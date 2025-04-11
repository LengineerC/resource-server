import RESPONSE_CODE from "../utils/codes";
import { FTP_RESOURCE_TYPE } from "../utils/enums";

export type Config={
    ftp:{
        connection:FTPConfig
    },
}

export type FTPConfig={
    host:string,
    port:number,
    user:string,
    pass:string,
}

export type Response<T>={
    code:RESPONSE_CODE,
    msg:null|string,
    data:T
};

export type Permission={
    read:boolean,
    write:boolean,
    exec:boolean
}

export type FTPResource={
    name: string,
    type: FTP_RESOURCE_TYPE,
    time: number,
    size: string,
    owner: string,
    group: string,
    userPermissions: Permission,
    groupPermissions: Permission,
    otherPermissions: Permission
}