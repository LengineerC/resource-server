import RESPONSE_CODE from "../utils/codes";

export type Config={
    ftp:FTPConfig,
}

export type FTPConfig={
    host:string,
    port:number,
    user:string,
    pass:string,
}

export type Response={
    code:RESPONSE_CODE,
    msg:null|string,
    data:any
};