import path from "path";
import { FILE_TYPE } from "../../public/utils/enums";

export function getFileType(filePath:string):string{
  const extName=path.extname(filePath).toLowerCase();
  const typeMap:Record<string,FILE_TYPE>={
    '.png': FILE_TYPE.IMAGE,
    '.jpg': FILE_TYPE.IMAGE,
    '.jpeg': FILE_TYPE.IMAGE,
    '.gif': FILE_TYPE.IMAGE,
    '.webp':FILE_TYPE.IMAGE,

    '.txt': FILE_TYPE.TEXT,
    '.md': FILE_TYPE.TEXT,

    '.mp4': FILE_TYPE.VIDEO,

    '.mp3': FILE_TYPE.AUDIO,
    '.wav': FILE_TYPE.AUDIO,

    '.pdf': FILE_TYPE.APPLICATION,
  };

  return typeMap[extName] || "unknown";
}

export function createContentType(filePath:string):string{
  const fileType=getFileType(filePath);
  let extName=path.extname(filePath).slice(1);
  
  if(extName==="jpg") extName="jpeg";
  
  switch(fileType){
    case FILE_TYPE.TEXT:
      return `${FILE_TYPE.TEXT}/plain; charset=utf-8`;

    case FILE_TYPE.IMAGE:
      return `${FILE_TYPE.IMAGE}/${extName}`;

    case FILE_TYPE.AUDIO:
      return `${FILE_TYPE.AUDIO}/${extName}`;

    case FILE_TYPE.VIDEO:
      return `${FILE_TYPE.VIDEO}/${extName}`;

    case FILE_TYPE.APPLICATION:
      return `${FILE_TYPE.APPLICATION}/${extName}`;
    
    default:
      return FILE_TYPE.UNKNOWN;
  }
}