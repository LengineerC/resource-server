import jsftp,{ JsftpOpts } from "jsftp";
import logger from "../log4js/logger";
import ResponseCreator from "../response/ResponseCreator";
import { FTPResource } from "../../public/types/common";
import { Socket } from "net";

export default class FTPHandler{
    private option:JsftpOpts;
    private ftp:jsftp|null;

    constructor(option:JsftpOpts){
        this.ftp=null;
        this.option=option;
    }
    
    private createFtpClient():Promise<jsftp|null>{
        return new Promise((resolve,reject)=>{
            try{
                const ftp=new jsftp(this.option);
                ftp.on("error",err => {
                    reject(new Error(`Error to connect FTP server: ${err.message}`));
                });
    
                ftp.on("timeout",err=>{
                    reject(new Error(`Connect timeout: ${err.message}`));
                });
    
                ftp.on("connect",()=>{
                    logger.info("Success to connect server");
                    resolve(ftp);
                });
            }catch(err){
                reject(new Error(`Failed to initialize FTP Client`));
            }
        })
    }

    public async connect(){
        try{
            logger.info(`Start to connect server: ${this.option.host} with user: ${this.option.user}`);
            this.ftp=await this.createFtpClient();
            this.ftp?.keepAlive(60000);
            return ResponseCreator.success(null,"Connected!");
        }catch(err:any){
            logger.error("Failed to connect",err.message);
            return ResponseCreator.error(null,err.message);
        }
    }

    public ls(path:string):Promise<FTPResource[]>{
        return new Promise((resolve,reject)=>{
            // console.log(path);
            this.ftp?.ls(path,(err,res)=>{
                if(err){
                    logger.error("Excute ls failed:",err);
                    reject(err);
                }

                logger.info("Fetched path: "+path);
                resolve(res as unknown as FTPResource[]);
            });
        });
    }

    public get(path:string):Promise<Socket>{
        return new Promise((resolve,reject)=>{
            this.ftp?.get(path,(err,data)=>{
                if(err){
                    logger.error(`Get ${path} error:`,err.message);
                    reject(err);
                }

                resolve(data);
            });
        });
    }

    public quit():Promise<null>{
        return new Promise((resolve,reject)=>{
            this.ftp?.raw("quit",err=>{
                if(err){
                    logger.error("Fail to quit:",err);
                    reject(err);
                }
                this.ftp?.destroy();
                logger.info("Quit");
                resolve(null);
            });
        });
    }
}