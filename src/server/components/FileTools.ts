import * as fs from "fs";
import path from "path";
import logger from "../log4js/logger";

export default class FileTools{
  public static readJson(filepath:string):any{
    try{
      return JSON.parse(fs.readFileSync(filepath).toString());
    }catch(e){
      logger.error("File not exists or file content is not a JSON!",e);
    }
  }

  public static writeJson(filepath:string,data:any){
    const dir=path.dirname(filepath);
    try{
      if(!fs.existsSync(dir)){
        fs.mkdirSync(dir,{recursive:true});
      }
      fs.writeFileSync(filepath,JSON.stringify(data,null,2))
    }catch(e){
      logger.error("Failed to save JSON",e);
    }
  }
}