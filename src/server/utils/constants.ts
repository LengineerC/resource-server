import path from "path";
import process from "process";

export const CONFIG_FILENAME:string="config.json";
export const CONFIG_FILE=path.resolve(process.cwd(),CONFIG_FILENAME);