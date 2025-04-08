import RESPONSE_CODE from "../../public/utils/codes";
import { Response } from "../../public/types/common";

export default class ResponseCreator{
    static success(data:any,msg:string|null=null):Response{
        return {
            code:RESPONSE_CODE.SUCCESS,
            msg,
            data
        };
    }

    static error(data:any,msg:string|null=null):Response{
        return {
            code:RESPONSE_CODE.ERROR,
            msg,
            data
        }
    }
}