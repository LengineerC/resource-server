import express from "express";
import process from "process";
import path from "path";
import * as fs from 'fs';
import { CONFIG_FILE, CONFIG_FILENAME } from "./utils/constants";
import { Config } from "../public/types/common";
import FileTools from "./components/FileTools";
import cors from "cors";
import logger from "./log4js/logger";
import FTPController from "./controller/FTPController";
import ConfigController from "./controller/ConfigController";

const app=express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));

let PORT=7500;
let initConfig:Config={
    ftp:{
        host:"",
        port:21,
        user:"",
        pass:""
    },
};

if(!fs.existsSync(CONFIG_FILE)){
    FileTools.writeJson(CONFIG_FILE,initConfig);
    logger.info(`${CONFIG_FILENAME} is not exists, start to initialize`);
}else{
    initConfig=FileTools.readJson(CONFIG_FILE);
    logger.info(`Read config:`,initConfig);
}

if(process.env.NODE_ENV!=="development"){
    app.use(express.static(path.resolve(__dirname,"../client")));

    app.get("/",(_,res)=>{
        const indexPage=path.join(__dirname,"../client/index.html");
        logger.info(`Send file ${indexPage}`);
        res.sendFile(indexPage);
    });
}

new ConfigController(app);
new FTPController(app);

app.listen(PORT,(err)=>{
    if(err){
        logger.error("Start server error:",err.message);
        return;
    }

    logger.info(`App listening on port ${PORT}!`);
});