import RESPONSE_CODE from "../../public/utils/codes";
import { Response } from "../../public/types/common";

export default class ResponseCreator{
    public static success(data:any,msg:string|null=null):Response{
        return {
            code:RESPONSE_CODE.SUCCESS,
            msg,
            data
        };
    }

    public static error(data:any,msg:string|null=null):Response{
        return {
            code:RESPONSE_CODE.ERROR,
            msg,
            data
        }
    }
}