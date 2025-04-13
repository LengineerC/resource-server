import { FTPConfig, FTPResource, Response } from "../../public/types/common";
import createUrl from "../../public/functions/createUrl"
import request from "../utils/request/request"
import { FTP_REQUEST_PATHS } from "../../public/utils/requests";
import { AxiosResponse } from "axios";
import { fetchStreamDownload } from "../utils/request/fetchStreamDownload";
import streamUpload from "../utils/request/streamUpload";

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

// export function download(params:{path:string}){
//     return request(createUrl(BASE,FTP_REQUEST_PATHS.DOWNLOAD),{
//         method:"GET",
//         params,
//         responseType:"blob"
//     }) as Promise<Blob>;
// }

export function download(params:{path:string},options?: {
    filename?: string;
    onProgress?: (loaded: number, total?: number) => void;
    signal?: AbortSignal;
}){
    const url=createUrl(BASE,FTP_REQUEST_PATHS.DOWNLOAD);
    
    return fetchStreamDownload(
        url,
        {
            method:"GET",
            params,
            ...options
        }
    );
}

export function mkdir(params:{dirpath:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.MKDIR),{
        method:"POST",
        params
    }) as Promise<Response<null>>;
}

export function deleteFile(params:{filePath:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.DELETE),{
        method:"POST",
        params
    }) as Promise<Response<null>>;
}

export function deleteDir(params:{dirpath:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.RMDIR),{
        method:"POST",
        params
    }) as Promise<Response<null>>;
}

export function rename(params:{from:string,to:string}){
    return request(createUrl(BASE,FTP_REQUEST_PATHS.RENAME),{
        method:"POST",
        params
    }) as Promise<Response<null>>;
}

export function upload(file:File,toPath:string){
    return streamUpload(
        createUrl(BASE,FTP_REQUEST_PATHS.UPLOAD),
        createUrl(BASE,FTP_REQUEST_PATHS.COMPLETE_UPLOAD),
        file,
        toPath
    );
}