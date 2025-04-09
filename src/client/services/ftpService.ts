import { FTPConfig } from "../../public/types/common";
import createUrl from "../../public/functions/createUrl"
import request from "../utils/request/request"
import { FTP_REQUEST_PATHS } from "../../public/utils/requests";

const {BASE}=FTP_REQUEST_PATHS;

export function login(params:FTPConfig){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LOGIN),{
        method:"POST",
        params
    });
}

export function logout(){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LOGOUT),{
        method:"GET"
    });
}

export function ls(params:{path:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LS),{
        method:"GET",
        params
    });
}