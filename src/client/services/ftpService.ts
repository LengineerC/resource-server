import { FTPConfig, Response } from "../../public/types/common";
import createUrl from "../../public/functions/createUrl"
import request from "../utils/request/request"
import { FTP_REQUEST_PATHS } from "../../public/utils/requests";
import { AxiosResponse } from "axios";

const {BASE}=FTP_REQUEST_PATHS;

export function login(params:FTPConfig){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LOGIN),{
        method:"POST",
        params
    }) as Promise<Response>;
}

export function logout(){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LOGOUT),{
        method:"GET"
    }) as Promise<Response>;
}

export function ls(params:{path:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LS),{
        method:"GET",
        params
    }) as Promise<Response>;
}

export function preview(params:{path:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.PREVIEW),{
        method:"GET",
        params:{
            path:encodeURIComponent(params.path)
        },
        responseType:"blob"
    },true) as Promise<AxiosResponse<Blob>>;
}