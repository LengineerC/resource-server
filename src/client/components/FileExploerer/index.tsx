import React, { ReactNode, useEffect } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft,
  faDownload,
  faFolderOpen,
  faFolderPlus,
  faTrashCan,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FTPResource } from "../../../public/types/common";
import { Image, Popover, Spin } from "antd";
import { ls, preview } from "../../services/ftpService";
import useMessage from "antd/es/message/useMessage";
import RESPONSE_CODE from "../../../public/utils/codes";
import ResourceContainer from "./ResourceContainer";
import { FILE_TYPE, FTP_RESOURCE_TYPE } from "../../../public/utils/enums";

import "./index.scss";

const testData:FTPResource[]=[                                                                                                                                              
  {
    name: '12.12.The.Day.2023.1080p.WATCHA.WEB-DL.H264.AAC5.1-ADWeb[PianYuan]',
    type: 1,
    time: 1722355200000,
    size: '0',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: 'Dr.コトー診療所',
    type: 1,
    time: 1729925940000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: 'Guardians Of The Galaxy Vol. 2 (2017) [Chris Pratt] 1080p H264 DolbyD 5.1 & nickarad',
    type: 1,
    time: 1722355200000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: 'Kamen.Rider.BLACK.SUN.S01.1080p.AMZN.WEB-DL.DDP5.1.H.264-0N0R3D1K31D0',
    type: 1,
    time: 1722355200000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: 'True.Lies.1994.1080p.WEBRip.DD5.1.x264-NTb',
    type: 1,
    time: 1722355200000,
    size: '0',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '[HI-Res][220406][ALBUM][森口博子][GUNDAM SONG COVERS 3][24Bit／96KHz][FLAC]',
    type: 1,
    time: 1738804920000,
    size: '0',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '[Nekomoe kissaten][Dandadan][01-12][1080p][JPSC]',
    type: 1,
    time: 1738805100000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: "[PoM&WM]BanG Dream!It's MyGO!!!!![01-13Fin]",
    type: 1,
    time: 1729926300000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: 'music2',
    type: 1,
    time: 1722528000000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: 'vegaspost18',
    type: 1,
    time: 1730016600000,
    size: '0',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '【游戏安装码在这里】.txt',
    type: 0,
    time: 1711382400000,
    size: '1915',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '侠盗猎车手圣安地列斯安装包.exe',
    type: 0,
    time: 1711641600000,
    size: '4158819537',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '夸克网盘下载',
    type: 1,
    time: 1722528000000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '小何的music',
    type: 1,
    time: 1723996800000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '川北医学院',
    type: 1,
    time: 1722528000000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '手机音乐',
    type: 1,
    time: 1723996800000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '未看',
    type: 1,
    time: 1738805460000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '歌词适配',
    type: 1,
    time: 1723996800000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '泰迪熊',
    type: 1,
    time: 1738805400000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '漫音社',
    type: 1,
    time: 1723996800000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '白い巨塔.白色巨塔.1966.720p.中日字幕-树屋字幕组V2.mp4',
    type: 0,
    time: 1704384000000,
    size: '1686624636',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '祝某的music',
    type: 1,
    time: 1723996800000,
    size: '4096',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '科研',
    type: 1,
    time: 1722355200000,
    size: '0',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '蔚蓝档案枪战小游戏（兰术制作）(2)',
    type: 1,
    time: 1730016600000,
    size: '0',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '车载U盘音乐',
    type: 1,
    time: 1723996800000,
    size: '81920',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  },
  {
    name: '鬼子来了(DVD国语中字).Devils.on.the.Doorstep.2000.DVD-1080p.X264.AAC.CHS-UUMp4',
    type: 1,
    time: 1722528000000,
    size: '0',
    owner: '0',
    group: '0',
    userPermissions: { read: true, write: true, exec: true },
    groupPermissions: { read: true, write: true, exec: true },
    otherPermissions: { read: true, write: true, exec: true }
  }
]

export default function FileExplorer() {
  const [messageApi,contextHolder]=useMessage();

  const [path,setPath]=useState<string>(".");
  const [resources,setResources]=useState<FTPResource[]>([]);
  // const [resources,setResources]=useState<FTPResource[]>(testData);
  const [selectedResources,setSelectedResources]=useState<FTPResource[]>([]);
  const [loading,setLoading]=useState<boolean>(false);
  const [showPreview,setShowPreview]=useState<boolean>(false);
  const [previewElem,setPreviewElem]=useState<ReactNode>(
    <></>
  );
  const [objectUrl,setObjectUrl]=useState<string|null>();

  useEffect(()=>{
    setLoading(true);
    setSelectedResources([]);
    ls({path:path})
    .then(res=>{
      const {code,data}=res;
      if(code===RESPONSE_CODE.SUCCESS){
        setResources(data);
      }else{
        messageApi.error("Failed to fetched: "+path);
      }

    }).catch(err=>{
      console.error("Failed to fetch directory:",err);
    }).finally(()=>{
      setLoading(false);
    });

  },[path]);

  const navigateToSelectedFolder=(fullPath:string)=>{
    setPath(fullPath);
  }
  
  const backToPrevFolder=()=>{
    const folders=path.split("/").filter(p=>p!=='');
    if(folders.length>1){
      folders.pop();
      setPath(folders.join("/"));
    }
  }

  const createPaths=()=>{
    const folders=path.split('/');

    return folders.map((dirname,i)=>{
      const fullPath=folders.slice(0,i+1).join("/")

      return dirname!==""&&
        <React.Fragment key={`segment-${dirname}-${i}`}>
          <span className="folder" onClick={()=>navigateToSelectedFolder(fullPath)}>
            {dirname}
          </span>
          {i!==folders.length-1 && <span className="divider">/</span>}
        </React.Fragment>
    });
  }

  const handlePreview=async(path:string)=>{
    const response=await preview({path});
    // console.log("response",response)
    const blob=response.data;
    const contentType=response.headers["content-type"];
    // console.log("contentType",contentType)
    let contentTypeArr=contentType?.toString().split("/");

    if(contentTypeArr && contentTypeArr?.length>0){
      const fileType=contentTypeArr.shift();
      // console.log("fileType",fileType);

      switch(fileType){
        case FILE_TYPE.IMAGE:{
          const url=URL.createObjectURL(blob);
          setObjectUrl(url);
          setPreviewElem(
            <Image 
              src={url}
            />
          );
          break;
        }

        case FILE_TYPE.VIDEO:{
          const url=URL.createObjectURL(blob);
          setObjectUrl(url);
          setPreviewElem(
            <video 
              src={url} 
              controls
            >
              Loading video...
            </video>
          );
          break;
        }

        case FILE_TYPE.TEXT:
          await blob.text()
          .then(v=>{
            setPreviewElem(
              <textarea 
                disabled 
                className="text-displayer" 
                value={v}
              />
            );
          }).catch(err=>{
            console.error("Failed to read blob:",err);
          });
  
          break;

        default:
          break;
      }
    }
  }

  const onResourceSelect=(resource:FTPResource)=>{
    setSelectedResources(prev=>[...prev,resource]);
  }
  const onResourceUnSelect=(resource:FTPResource)=>{
    setSelectedResources(prev=>prev.filter(r=>r.name!==resource.name));
  }
  const onDoubleClick=(resource:FTPResource,path:string)=>{
    if(resource.type===FTP_RESOURCE_TYPE.DIR){
      setPath(path);
    }else if(resource.type===FTP_RESOURCE_TYPE.FILE){
      setShowPreview(true);
      handlePreview(path);
    }
  }

  const onPreviewClose=()=>{
    setShowPreview(false);
    if(objectUrl){
      URL.revokeObjectURL(objectUrl);
    }
    setPreviewElem(<></>);
  }

  const createResourceContainers=()=>resources.map((resource,i)=>{
    const {
      name,
      type,
      time,
      size
    }=resource;

    const pathArr=path.split("/").filter(p=>p!=='');
    pathArr.push(name);
    const resourcePath=pathArr.join("/");

    return(
      <ResourceContainer
        key={`${name}-${type}`}
        name={name}
        type={type}
        time={time}
        size={size}
        path={resourcePath}
        onSelect={()=>onResourceSelect(resource)}
        onUnSelect={()=>onResourceUnSelect(resource)}
        onDoubleClick={()=>onDoubleClick(resource,resourcePath)}
      />
    );
  });

  return (
    <div
      className="file-exploerer-main"
    >
      {contextHolder}

      {showPreview && (
        <div className="preview">
          <div className="close-btn">
            <FontAwesomeIcon
              icon={faXmark}
              onClick={onPreviewClose}
            />
          </div>

          <div className="preview-container">
            {previewElem}
          </div>
        </div>
      )}

      <Spin 
        spinning={loading}
        fullscreen
      />
      <div className="navigator">
        <div className="path-main">
          <div className="icon-container">
            <Popover
              content="Back"
            >
              <FontAwesomeIcon 
                icon={faArrowLeft}
                className="back-btn"
                onClick={backToPrevFolder}
              />
            </Popover>

            <FontAwesomeIcon 
              icon={faFolderOpen}
              style={{
                fontSize:30,
                color:"grey"
              }}
            />
          </div>

          <div className="path-container">
            {createPaths()}
          </div>
        </div>
      </div>

      <div className="resources">
        <div className="options">
          <FontAwesomeIcon
            icon={faTrashCan}
            className={`btn ${selectedResources.length===0 && "disabled"}`}
            onClick={
              selectedResources.length===0?()=>{}:()=>{}
            }
          />

          <div>
            <FontAwesomeIcon
              icon={faDownload}
              className={`btn ${selectedResources.length===0 && "disabled"}`}
              onClick={
                selectedResources.length===0?()=>{}:()=>{}
              }
            />

            <FontAwesomeIcon
              icon={faFolderPlus}
              className={`btn ${selectedResources.length===0 && "disabled"}`}
              onClick={
                selectedResources.length===0?()=>{}:()=>{}
              }
            />
          </div>
        </div>
        
        <div className="resources-display">
          {createResourceContainers()}
        </div>
      </div>
    </div>
  )
}
