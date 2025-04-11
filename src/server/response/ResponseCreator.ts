import RESPONSE_CODE from "../../public/utils/codes";
import { Response } from "../../public/types/common";

export default class ResponseCreator{
    public static success<T>(data:T,msg:string|null=null):Response<T>{
        return {
            code:RESPONSE_CODE.SUCCESS,
            msg,
            data
        };
    }

    public static error<T>(data:T,msg:string|null=null):Response<T>{
        return {
            code:RESPONSE_CODE.ERROR,
            msg,
            data
        }
    }
}