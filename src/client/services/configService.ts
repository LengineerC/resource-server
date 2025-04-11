import createUrl from "../../public/functions/createUrl";
import { Config, Response } from "../../public/types/common";
import { CONFIG_REQUEST_PATHS } from "../../public/utils/requests";
import request from "../utils/request/request";

const {BASE}=CONFIG_REQUEST_PATHS;

export function getConfig(){
    return request(createUrl(BASE,CONFIG_REQUEST_PATHS.GET),{
        method:"GET"
    }) as Promise<Response<Config>>;
}