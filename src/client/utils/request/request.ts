import axios from "axios";
import { LOCAL_URL } from "./ip";
import { Response } from "../../../public/types/common";

type Option={
    method:"GET"|"POST",
    params?:any
}

export default function request(url:string,option:Option):Promise<Response>|undefined{
    const {method,params}=option;
    let requestUrl=
        (LOCAL_URL[LOCAL_URL.length-1]==='/'?
            LOCAL_URL.substring(0,LOCAL_URL.length-1):
            LOCAL_URL)
            +url;

    if(method==='GET'){
        return axios.get(
            requestUrl,{
                params:{...params},
            }
        ).then(response=>{
            return response.data;
        }).catch(err=>{
            console.log(err);
        });

    }else if(method==="POST"){
        return axios.post(
            requestUrl,
            params
        ).then(response=>{
            return response.data;
        }).catch(err=>{
            console.log(err);
        });
    }
}