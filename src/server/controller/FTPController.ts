import { Express } from "express";
import ResponseCreator from "../response/ResponseCreator";
import createUrl from "../../public/functions/createUrl";
import { FTP_REQUEST_PATHS } from "../../public/utils/requests";
import logger from "../log4js/logger";
import FileTools from "../components/FileTools";
import { CONFIG_FILE } from "../utils/constants";
import FTPHandler from "../components/FTPHandler";
import RESPONSE_CODE from "../../public/utils/codes";
import { Config, FTPConfig, Response } from "../../public/types/common";
import { createContentType } from "../utils/functions";
import { FILE_TYPE } from "../../public/utils/enums";
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

  private async releaseFtp(ftp:FTPHandler){
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
    const {BASE,LOGIN,LOGOUT,LS,PREVIEW,DOWNLOAD}=FTP_REQUEST_PATHS;

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
          const socket=await ((await this.getFtp()).data)?.get(decodingPath);

          req.on('close', () => {
            logger.info(`Client disconnected: ${filePath}`);
            socket?.destroy();
            res.destroy();
          });
      

          socket?.on("end",()=>{
            logger.info(`FTP preload ${filePath} finished`);
            socket.destroy();
          });

          socket?.on("error",err=>{
            if(err){
              logger.error("Failed to receive stream:",err);
            }
          })

          socket?.pipe(res);
        }

      }catch(err){
        logger.error(`Failed to download file: ${filePath}`,err);
      }

    });
  }

}