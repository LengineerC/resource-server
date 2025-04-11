import { FTPConfig, FTPResource, Response } from "../../public/types/common";
import createUrl from "../../public/functions/createUrl"
import request from "../utils/request/request"
import { FTP_REQUEST_PATHS } from "../../public/utils/requests";
import { AxiosResponse } from "axios";

const {BASE}=FTP_REQUEST_PATHS;

export function login(params:FTPConfig){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LOGIN),{
        method:"POST",
        params
    }) as Promise<Response<any>>;
}

export function logout(){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LOGOUT),{
        method:"GET"
    }) as Promise<Response<any>>;
}

export function ls(params:{path:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.LS),{
        method:"GET",
        params
    }) as Promise<Response<FTPResource[]>>;
}

export function preview(params:{path:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.PREVIEW),{
        method:"GET",
        params,
        responseType:"blob"
    },true) as Promise<AxiosResponse<Blob>>;
}

export function download(params:{path:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.DOWNLOAD),{
        method:"GET",
        params,
        responseType:"blob"
    }) as Promise<Blob>;
}