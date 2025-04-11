import axios from "axios";
import { BASE_URL } from "./ip";
import { Response } from "../../../public/types/common";

type Option={
    method:"GET"|"POST",
    params?:any,
    responseType?:'json' | 'blob' | 'arraybuffer' | 'text' | 'stream'
}

export default function request(url:string,option:Option,getFullResponse:boolean=false):Promise<axios.AxiosResponse|Response<any>|Blob|ArrayBuffer|string>|undefined{
    const {method,params}=option;
    let requestUrl=
        (BASE_URL[BASE_URL.length-1]==='/'?
            BASE_URL.substring(0,BASE_URL.length-1):
            BASE_URL)
            +url;
    const config:axios.AxiosRequestConfig={
        responseType:option.responseType
    } ;

    if(method==='GET'){
        config.params={...params};
        return axios.get(
            requestUrl,
            config
        ).then(response=>getFullResponse?response:response.data)
        .catch(err=>{
            console.log(err);
        });

    }else if(method==="POST"){
        return axios.post(
            requestUrl,
            params,
            config
        ).then(response=>getFullResponse?response:response.data)
        .catch(err=>{
            console.log(err);
        });
    }
}