import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FTP_RESOURCE_TYPE } from "../../../../public/utils/enums";
import {
  faCircleInfo,
  faFile,
  faFolder
} from "@fortawesome/free-solid-svg-icons";
import { Button, Modal } from "antd";
import { CSSProperties, useEffect, useRef, useState } from "react";

import "./index.scss";

type Props={
  type:FTP_RESOURCE_TYPE,
  path:string,
  name:string,
  time:number,
  size:string,
  style?:CSSProperties,
  onSelect?:()=>void,
  onUnSelect?:()=>void,
  onDoubleClick?:()=>void,
  onRightClick?:(e:MouseEvent)=>void,
  onDownloadClick?:()=>void,
  onDeleteClick?:()=>void,
  onRenameClick?:()=>void,
  onShowInfo?:()=>void,
  onCloseInfo?:()=>void,
}

export default function ResourceContainer(props:Props) {
  const [selected,setSelected]=useState<boolean>(false);
  const [showInfoModal,setShowInfoModal]=useState<boolean>(false);
  
  const rcRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    rcRef.current?.addEventListener("contextmenu",e=>props.onRightClick?.(e));

    return()=>{
      rcRef.current?.removeEventListener("contextmenu",e=>props.onRightClick?.(e));
    }
  },[])

  const handleOnClick=()=>{
    !selected
      ?props.onSelect?.()
      :props.onUnSelect?.();

    setSelected(!selected);
  }

  const getExtName=()=>{
    if(props.type===FTP_RESOURCE_TYPE.DIR) return "Directory";
    else{
      const nameArr=props.name.split(".");
      const extName=nameArr.pop();

      if(extName==="") return "Unknown";
      else return extName?.toUpperCase();
    }
  }

  const getDateString=()=>{
    return new Date(props.time).toLocaleString();
  }

  const getSizeString=()=>{
    if(props.type===FTP_RESOURCE_TYPE.DIR) return "";
    else{
      const size=Number(props.size);

      if(size<1024) return `${size} B`;

      const KB=size/1024;
      if(KB<1024) return `${KB.toFixed(1)} KB`;

      const MB=KB/1024;
      if(MB<1024) return `${MB.toFixed(1)} MB`;

      const GB=MB/1024;
      if(GB<1024) return `${GB.toFixed(1)} GB`;

      const TB=GB/1024;
      if(TB<1024) return `${TB.toFixed(1)} TB`;
    }
  }

  const showInfo=(e:React.MouseEvent<SVGSVGElement, MouseEvent>)=>{
    e.stopPropagation();

    setShowInfoModal(true);
    props.onShowInfo?.();
  }

  const onInfoModalClose=(e:React.MouseEvent<HTMLButtonElement, MouseEvent>)=>{
    e.stopPropagation();
    setShowInfoModal(false);
    props.onCloseInfo?.();
  }

  const onDoubleClick=(e:React.MouseEvent<HTMLDivElement, MouseEvent>)=>{
    e.stopPropagation();
    
    props.onDoubleClick?.();
  }

  const onDownloadClick=()=>{
    setShowInfoModal(false);
    props.onDownloadClick?.();
  }

  const onDeleteClick=()=>{
    setShowInfoModal(false);
    props.onDeleteClick?.();
  }

  const onRenameClick=()=>{
    setShowInfoModal(false);
    props.onRenameClick?.();
  }

  return (
    <div 
      className={`rc-main ${selected?"selected":""}`}
      style={props.style}
      ref={rcRef} 
      onClick={showInfoModal?()=>{}:handleOnClick}
      onDoubleClick={showInfoModal?()=>{}:onDoubleClick}
    >
      <FontAwesomeIcon 
        icon={props.type===FTP_RESOURCE_TYPE.DIR?faFolder:faFile}
        className="icon"
      />

      <div className="name">
        {props.name}
      </div>

      <div className="info-container">
        <div className="resource-type">
          {getExtName()}
        </div>

        <div className="time">
          {getDateString()}
        </div>

        <div className="size">
          {getSizeString()}
        </div>

        <FontAwesomeIcon 
          className="info-btn"
          icon={faCircleInfo}
          onClick={showInfo}
        />
      </div>

      <Modal
        title="Infomation" 
        className="info-modal"
        open={showInfoModal} 
        onCancel={onInfoModalClose}
        footer={<>
          <Button 
            color="danger" 
            variant="outlined"
            onClick={onDeleteClick}
          >
            Delete
          </Button>

          {
            props.type===FTP_RESOURCE_TYPE.FILE&&
            <Button 
              color="primary"
              onClick={onDownloadClick}
            >
              Download
            </Button>
          }

          <Button 
            variant="outlined"
            onClick={onRenameClick}
          >
            Rename
          </Button>
        </>}
        closable
      >
        <div className="info-p">
          <div className="info-labal">Name:</div>
          <div className="info-content">{props.name}</div>
        </div>

        <div className="info-p">
          <div className="info-labal">Type:</div>
          <div className="info-content">{getExtName()}</div>
        </div>

        <div className="info-p">
          <div className="info-labal">Edit time:</div>
          <div className="info-content">{getDateString()}</div>
        </div>

        {props.type===FTP_RESOURCE_TYPE.FILE && (
          <div className="info-p">
            <div className="info-labal">Size:</div>
            <div className="info-content">{getSizeString()}</div>
          </div>
        )}

        {/* <div className="info-footer">

        </div> */}
      </Modal>
    </div>
  );
}
