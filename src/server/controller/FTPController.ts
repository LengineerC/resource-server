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

export default class FTPController{
  private app:Express;
  private ftp:FTPHandler|null;

  constructor(app:Express){
    this.app=app;
    this.ftp=null;
    this.createRequestListeners();
  }

  private createRequestListeners(){
    const {BASE}=FTP_REQUEST_PATHS;

    this.app.post(createUrl(BASE,FTP_REQUEST_PATHS.LOGIN),async(req,res)=>{
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

    this.app.get(createUrl(BASE,FTP_REQUEST_PATHS.LOGOUT),async(_,res)=>{
      try{
        await this.ftp?.quit();
        res.send(ResponseCreator.success(null,"Quited"));
      }catch(err){
        res.send(ResponseCreator.error(null,"Failed to quit"));
      }
    });
  }

}