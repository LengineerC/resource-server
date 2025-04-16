import { Express } from "express";
import ResponseCreator from "../response/ResponseCreator";
import createUrl from "../../public/functions/createUrl";
import { FTP_REQUEST_PATHS } from "../../public/utils/requests";
import process from "process";
import logger from "../log4js/logger";
import FileTools from "../components/FileTools";
import { CHUNK_FILE_EXTNAME, CONFIG_FILE } from "../utils/constants";
import FTPHandler from "../components/FTPHandler";
import RESPONSE_CODE from "../../public/utils/codes";
import { Config, FTPConfig, Response, UploadChunk } from "../../public/types/common";
import { createContentType } from "../utils/functions";
import { FILE_TYPE } from "../../public/utils/enums";
import formidableMiddleware from "express-formidable";
import fs from 'fs';
import path from "path";

export default class FTPController{
  private MAX_PREVIEW_SIZE=50*1024*1024;
  private MAX_POOL_SIZE=3;
  private app:Express;
  private ftpPool:FTPHandler[];
  private config:FTPConfig;

  constructor(app:Express){
    this.app=app;
    this.ftpPool=[];
    this.config={
      host:"",
      port:21,
      user:"",
      pass:"",
    };
    this.createRequestListeners();
  }

  private async getFtp():Promise<Response<FTPHandler|null>>{
    if(this.ftpPool.length<this.MAX_POOL_SIZE){
      const ftp=new FTPHandler(this.config);
      const response=await ftp.connect();
      if(response.code===RESPONSE_CODE.SUCCESS){
        this.ftpPool.push(ftp);
        logger.info(`Created FTP connection, current pool size: ${this.ftpPool.length}`);
        return ResponseCreator.success<FTPHandler>(ftp);
      }else{
        return ResponseCreator.error(null);
      }
    }

    return ResponseCreator.success<FTPHandler>(this.ftpPool[Math.floor(Math.random() * this.MAX_POOL_SIZE)]);
  }

  private async releaseFtp(ftp:FTPHandler|null){
    if(ftp===null) return;
    try{
      await ftp.quit();
      this.ftpPool = this.ftpPool.filter(conn => conn !== ftp);
      logger.info("FTP connection released");
    }catch(err){
      logger.error("Error to release FTP connection",err);
      this.ftpPool = this.ftpPool.filter(conn => conn !== ftp);
    }
  }

  private createRequestListeners(){
    const {BASE,LOGIN,LOGOUT,LS,PREVIEW,DOWNLOAD,MKDIR,DELETE,RMDIR,RENAME,UPLOAD,COMPLETE_UPLOAD}=FTP_REQUEST_PATHS;

    this.app.post(createUrl(BASE,LOGIN),async(req,res)=>{
      try{
        const savedConfig=FileTools.readJson(CONFIG_FILE) as Config;
        this.config={
          ...req.body
        };
        savedConfig.ftp.connection=this.config;
        FileTools.writeJson(CONFIG_FILE,savedConfig);
        const response=await this.getFtp();
        if(response.code===RESPONSE_CODE.SUCCESS){
          res.send(ResponseCreator.success(null,response.msg));
        }else{
          logger.info(response.msg);
          res.send(ResponseCreator.error(null,response.msg));
        }
      }catch(err){
        logger.error("Failed to login FTP server!",err);
        res.send(ResponseCreator.error(null,"Failed to login FTP server"));
      }
    });

    this.app.get(createUrl(BASE,LOGOUT),async(_,res)=>{
      try{
        await Promise.all(this.ftpPool.map(c=>{
          c.quit();
        }));
        this.ftpPool=[];
        res.send(ResponseCreator.success(null,"Quited"));
      }catch(err){
        this.ftpPool=[];
        res.send(ResponseCreator.error(null,"Failed to quit"));
      }
    });

    this.app.get(createUrl(BASE,LS),async(req,res)=>{
      const {path}=req.query;
      if(typeof path==="string"){
        const ftp=(await this.getFtp()).data;
        const resources=await ftp?.ls(path);
        res.send(ResponseCreator.success(resources));
      }else{
        res.send(ResponseCreator.error(null,"TypeError: path is not a string!"));
      }
    });

    this.app.get(createUrl(BASE,PREVIEW),async(req,res)=>{
      try{
        const {path:filePath}=req.query;
        
        if(typeof filePath==="string"){
          const decodingPath=decodeURIComponent(filePath);
          const ftp=(await this.getFtp()).data;
          const fileInfo=await ftp?.ls(decodingPath);
          
          if(!fileInfo || fileInfo.length===0){
            res.send(ResponseCreator.error(null,"File not exists"));
            return;
          }
          if(Number(fileInfo[0].size)>this.MAX_PREVIEW_SIZE){
            logger.info(`File ${decodingPath} is too big to preview`);
            res.send(ResponseCreator.error(Number(fileInfo[0].size),"File is too big to preview"));
            return;
          }

          const contentType=createContentType(decodingPath);
          // console.log("contentType",contentType)
          if(contentType===FILE_TYPE.UNKNOWN){
            res.send(ResponseCreator.error(null,"Unknown file"));
            return;
          }
          
          res.setHeader("Content-Type",contentType);
          res.setHeader("Cache-Control","no-cache");
          res.setHeader("Connection","keep-alive");

          const socket=await ((await this.getFtp()).data)?.get(decodingPath);
          if(socket){
            socket.on("end",()=>{
              logger.info(`FTP preload ${filePath} finished`);
              socket.destroy();
            });

            socket.pipe(res);
          }
        }else{
          logger.error("Error params to /ftp/preview");
          res.send(ResponseCreator.error(null,"Error params to /ftp/preview"));
        }
      }catch(err){
        logger.error("Error to preload",req.query.path);
        res.send(ResponseCreator.error(null,"Error to preload"));
      }
    });

    this.app.get(createUrl(BASE,DOWNLOAD),async(req,res)=>{
      const {path:filePath}=req.query;

      try{
        if(typeof filePath==="string"){
          const decodingPath=decodeURIComponent(filePath);
          const fileInfo=await ((await this.getFtp()).data)?.ls(decodingPath);
          
          if(!fileInfo || fileInfo.length===0){
            // res.send(ResponseCreator.error(null,"File not exists"));
            return;
          }

          const filename=path.basename(decodingPath);
          res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);
          res.setHeader('Content-Length', fileInfo[0].size);
          res.setHeader('Cache-Control', 'no-store');
          res.setHeader("Connection","keep-alive");
          res.setHeader('Content-Type', 'application/octet-stream');
          const ftp=(await this.getFtp()).data;
          const socket=await ftp?.get(decodingPath);

          req.on('close', () => {
            logger.info(`Client disconnected: ${filePath}`);
            socket?.destroy();
            res.destroy();
            if(ftp){
              this.releaseFtp(ftp);
            }
          });
      

          socket?.on("end",()=>{
            logger.info(`FTP preload ${filePath} finished`);
            socket.destroy();
            if(ftp){
              this.releaseFtp(ftp);
            }
          });

          socket?.on("error",err=>{
            if(err){
              logger.error("Failed to receive stream:",err);
              if(ftp){
                this.releaseFtp(ftp);
              }
            }
          })

          socket?.pipe(res);
        }

      }catch(err){
        logger.error(`Failed to download file: ${filePath}`,err);
      }

    });

    this.app.post(createUrl(BASE,MKDIR),async(req,res)=>{
      const {dirpath}=req.body;
      
      if(typeof dirpath==="string"){
        try{
          const ftp=(await this.getFtp()).data;
          await ftp?.mkdir(decodeURIComponent(dirpath));
          
          res.send(ResponseCreator.success(null,"Create directory succesfully"));
        }catch(err){
          res.send(ResponseCreator.error(null,"Failed to create directory"));
        }
      }else{
        logger.error("TypeError: dirPath is not a string");
        res.send(ResponseCreator.error(null,"TypeError: dirPath is not a string"));
      }
    
    });

    this.app.post(createUrl(BASE,DELETE),async(req,res)=>{
      const {filePath}=req.body;

      if(typeof filePath==="string"){
        try {
          const ftp=(await this.getFtp()).data;
          await ftp?.delete(decodeURIComponent(filePath));
  
          res.send(ResponseCreator.success(null,"Delete file successfully"));
        } catch (err) {
          res.send(ResponseCreator.error(null,"Failed to delete file"));
        }
      }else{
        logger.error("TypeError: filePath is not a string");
        res.send(ResponseCreator.error(null,"TypeError: filePath is not a string"));
      }
    });

    this.app.post(createUrl(BASE,RMDIR),async(req,res)=>{
      const {dirpath}=req.body;

      if(typeof dirpath==="string"){
        try {
          const ftp=(await this.getFtp()).data;
          await ftp?.rmdir(decodeURIComponent(dirpath));
  
          res.send(ResponseCreator.success(null,"Delete diretory successfully"));
        } catch (err) {
          res.send(ResponseCreator.error(null,"Failed to delete diretory"));
        }
      }else{
        logger.error("TypeError: dirpath is not a string");
        res.send(ResponseCreator.error(null,"TypeError: dirpath is not a string"));
      }
    });

    this.app.post(createUrl(BASE,RENAME),async(req,res)=>{
      const {from,to}=req.body;

      try{
        if(typeof from==="string" && typeof to==="string"){
          const ftp=(await this.getFtp()).data;
          const fromPath=decodeURIComponent(from);
          const toPath=decodeURIComponent(to);
          const response=await ftp?.rename(fromPath,toPath);
  
          if(response===RESPONSE_CODE.SUCCESS){
            res.send(ResponseCreator.success(null,"Renaming successful"));
          }else{
            res.send(ResponseCreator.error(null,"Failed to rename"));
          }
        }else{
          logger.error("TypeError: from or to is not string");
          res.send(ResponseCreator.error(null,"TypeError: from or to is not string"));
        }
      }catch(err){
        logger.error(`Failed to rename`);
        res.send(ResponseCreator.error(null,"Failed to rename"));
      }
    });

    this.app.post(createUrl(BASE,UPLOAD),async(req,res)=>{
      const { uploadId, fileName, chunkIndex } = req.query as any;

      if (!uploadId || !fileName || chunkIndex === undefined) {
        res
          .status(400)
          .send(ResponseCreator.error(null, "uploadId, fileName or chunkIndex is undefined"));

          return;
      }
      // console.log(`Caching ${fileName}: chunk-${chunkIndex}`);
      
      try{
        const tempDir=path.join(process.cwd(),".temp",uploadId);
        if(!fs.existsSync(tempDir)){
          fs.mkdirSync(tempDir,{recursive:true});
        }
        const chunkPath=path.join(tempDir,`${chunkIndex}${CHUNK_FILE_EXTNAME}`);
        const writeStream=fs.createWriteStream(chunkPath);
        req.pipe(writeStream);

        writeStream.on("finish",()=>{
          res.send(ResponseCreator.success(null, `${uploadId}: upload ${chunkIndex} finished`));
        });

        writeStream.on("error",err=>{
          logger.error(`${uploadId}: upload ${chunkIndex} error:`,err);
          res.status(500).json(ResponseCreator.error(null,  `${uploadId}: upload ${chunkIndex} error`));
        });

        // res.send(ResponseCreator.success(null,`Uploaded chunk ${chunkIndex}`));
      }catch(err){
        logger.error("Upload chunk ${chunkIndex} error:", err);
        res.status(500).json(ResponseCreator.error(null, `Upload chunk ${chunkIndex} error`));
      }
    });
    this.app.post(`${createUrl(BASE,COMPLETE_UPLOAD)}/:uploadId`,async(req,res)=>{
      const { uploadId } = req.params;
      const { fileName,toPath } = req.body;

      if (!uploadId || !fileName) {
        res.status(400).send(ResponseCreator.error(null, "No uploadId or fileName"));
      }

      const ftp=(await this.getFtp()).data;
      const files=await ftp?.ls(toPath);
      if(!files || files.length>0){
        res.send(ResponseCreator.success(null,`File ${fileName} has existed`));
        return;
      }

      try{
        const tempDir = path.join(process.cwd(), ".temp", uploadId);
        if (!fs.existsSync(tempDir)) {
          logger.error(`${uploadId} chunks not found`);
          res.status(400).send(ResponseCreator.error(null, `${uploadId} chunks not found`));
        }

        const chunkFiles=fs.readdirSync(tempDir)
        .filter(f=>f.endsWith(CHUNK_FILE_EXTNAME))
        .sort((a,b)=>Number(a.split(".")[0])-Number(b.split(".")[0]));

        const mergedFilePath=path.join(tempDir,fileName);
        const writeStream=fs.createWriteStream(mergedFilePath);

        for (const chunkFile of chunkFiles) {
          const chunkPath = path.join(tempDir, chunkFile);
          const dataStream = fs.createReadStream(chunkPath);
          await new Promise<void>((resolve, reject) => {
            dataStream.pipe(writeStream, { end: false });
            dataStream.on("end", resolve);
            dataStream.on("error", reject);
          });
        }
        writeStream.end();
        

        await new Promise<void>((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });

        // const readStream=fs.createReadStream(mergedFilePath);
        // readStream.on("end",async()=>{
  
        // });
        // console.log(fs.statSync(mergedFilePath));
        
        await ftp?.put(mergedFilePath,toPath);
        this.releaseFtp(ftp);

        fs.rmSync(tempDir, { recursive: true, force: true });
        res.send(ResponseCreator.success(null,`Upload ${fileName} finished`));

      }catch(err){
        res.send(ResponseCreator.error(null,`Upload ${fileName} error`));
      }
    });

  }


}