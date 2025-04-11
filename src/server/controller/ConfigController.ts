import { Express } from "express";
import createUrl from "../../public/functions/createUrl";
import { CONFIG_REQUEST_PATHS } from "../../public/utils/requests";
import FileTools from "../components/FileTools";
import { CONFIG_FILE } from "../utils/constants";
import ResponseCreator from "../response/ResponseCreator";
import { Config } from "../../public/types/common";

export default class ConfigController{
    private app:Express;
    
    constructor(app:Express){
        this.app=app;

        this.createRequestListeners();
    }

    private createRequestListeners(){
        const {BASE}=CONFIG_REQUEST_PATHS;

        this.app.get(createUrl(BASE,CONFIG_REQUEST_PATHS.GET),(_,res)=>{
            const config=FileTools.readJson(CONFIG_FILE);
            res.send(ResponseCreator.success<Config>(config));
        });
    }
}