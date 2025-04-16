import FTP,{ JsftpOpts } from "jsftp";
import logger from "../log4js/logger";
import ResponseCreator from "../response/ResponseCreator";
import { FTPResource } from "../../public/types/common";
import { Socket } from "net";
import RESPONSE_CODE from "../../public/utils/codes";
import { Client } from "basic-ftp";
// import { Readable } from "stream";
// import fs from "fs";

export default class FTPHandler{
    private option:JsftpOpts;
    private ftp:FTP|null;

    constructor(option:JsftpOpts){
        this.ftp=null;
        this.option=option;
    }
    
    private createFtpClient():Promise<FTP|null>{
        return new Promise((resolve,reject)=>{
            try{
                const ftp=new FTP(this.option);
                ftp.on("error",err => {
                    reject(new Error(`Error to connect FTP server: ${err}`));
                });
    
                ftp.on("timeout",err=>{
                    reject(new Error(`Connect timeout: ${err}`));
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
            logger.error("Failed to connect",err);
            return ResponseCreator.error(null,err);
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

    public mkdir(path:string):Promise<null>{
        return new Promise((resolve,reject)=>{
            this.ftp?.raw("mkd",path,(err,data)=>{
                if(err){
                    logger.error("mkdir error:",err);
                    reject(err);
                }

                logger.info("mkdir:",data.text);
                resolve(null);
            });
        });
    }

    // public put(buffer:string|Buffer|Readable,path:string):Promise<RESPONSE_CODE>{
    //     return new Promise((resolve,reject)=>{
    //         logger.info("Start to put:",path);
    //         this.ftp?.put(buffer, path, err => {
    //             if (err) {
    //               logger.error("Failed to put file:",path);
    //               reject(err);
    //             }

    //             logger.info("Success to input file:",path);
    //             resolve(RESPONSE_CODE.SUCCESS);
    //           });
    //     });
    // }

    public async put(localPath:string,remotePath:string):Promise<RESPONSE_CODE>{
        const client=new Client();
        client.ftp.verbose=true;
        try{
            await client.access({
                host: this.option.host,
                user: this.option.user,
                password: this.option.pass,
                port: this.option.port,
                secure: false
            });

            await client.uploadFrom(localPath,remotePath);
            return RESPONSE_CODE.SUCCESS;
        }catch(err){
            logger.error("Failed to put file:",localPath,err);
            throw err;
        }finally{
            client.close();
        }
    }


    public delete(path:string):Promise<null>{
        return new Promise((resolve,reject)=>{
            this.ftp?.raw("dele",path,(err,data)=>{
                if(err){
                    logger.error("delete error:",err);
                    reject(err);
                }

                logger.info("delete:",data.text);
                resolve(null);
            });
        });
    }

    public rmdir(path:string):Promise<null>{
        return new Promise((resolve,reject)=>{
            this.ftp?.raw("rmd",path,(err,data)=>{
                if(err){
                    logger.error("rmdir error:",err);
                    reject(err);
                }

                logger.info("rmdir:",data.text);
                resolve(null);
            });
        });
    }

    public get(path:string):Promise<Socket>{
        return new Promise((resolve,reject)=>{
            this.ftp?.get(path,(err,data)=>{
                if(err){
                    logger.error(`Get ${path} error:`,err);
                    reject(err);
                }

                resolve(data);
            });
        });
    }

    public rename(fromPath:string,toPath:string):Promise<RESPONSE_CODE>{
        return new Promise((resolve,reject)=>{
            this.ftp?.rename(fromPath,toPath,err=>{
                if(err){
                    logger.error(`Rename ${fromPath} to ${toPath} failed`);
                    reject(err);
                }

                resolve(RESPONSE_CODE.SUCCESS);
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