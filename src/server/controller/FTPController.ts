import { Express } from "express";
import ResponseCreator from "../response/ResponseCreator";
import createUrl from "../../public/functions/createUrl";
import { FTP_REQUEST_PATHS } from "../../public/utils/requests";
import logger from "../log4js/logger";
import FileTools from "../components/FileTools";
import { CONFIG_FILE } from "../utils/constants";
import FTPHandler from "../components/FTPHandler";
import RESPONSE_CODE from "../../public/utils/codes";
import { Response } from "../../public/types/common";
import { createContentType } from "../utils/functions";
import { FILE_TYPE } from "../../public/utils/enums";
import path from "path";

export default class FTPController{
  private MAX_PREVIEW_SIZE=50*1024*1024;
  private app:Express;
  private ftp:FTPHandler|null;

  constructor(app:Express){
    this.app=app;
    this.ftp=null;
    this.createRequestListeners();
  }

  private createRequestListeners(){
    const {BASE,LOGIN,LOGOUT,LS,PREVIEW,DOWNLOAD}=FTP_REQUEST_PATHS;

    this.app.post(createUrl(BASE,LOGIN),async(req,res)=>{
      try{
        let config=FileTools.readJson(CONFIG_FILE);
        config.ftp={
          ...req.body
        };
        FileTools.writeJson(CONFIG_FILE,config);
        this.ftp=new FTPHandler(req.body);
        const response:Response=await this.ftp.connect();
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
        await this.ftp?.quit();
        res.send(ResponseCreator.success(null,"Quited"));
      }catch(err){
        res.send(ResponseCreator.error(null,"Failed to quit"));
      }
    });

    this.app.get(createUrl(BASE,LS),async(req,res)=>{
      const {path}=req.query;
      if(typeof path==="string"){
        const resources=await this.ftp?.ls(path);
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
          const fileInfo=await this.ftp?.ls(decodingPath);
          
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

          const socket=await this.ftp?.get(decodingPath);
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
          const fileInfo=await this.ftp?.ls(decodingPath);
          
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
          const socket=await this.ftp?.get(decodingPath);

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