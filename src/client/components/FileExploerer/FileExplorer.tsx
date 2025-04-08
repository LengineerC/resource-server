import React from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import "./index.scss";

export default function FileExplorer() {
  const [path,setPath]=useState<string>("./lengineerc/media/vedio/photos/games/th");
  const [resources,setResources]=useState<{[key:string]:any}[]>([]);

  const navigateToSelectedFolder=(fullPath:string)=>{
    setPath(fullPath);
  }

  const createPaths=()=>{
    const folders=path.split('/');

    return folders.map((path,i)=>{
      const fullPath=folders.slice(0,i+1).join("/")

      return path!==""&&
        <React.Fragment key={`segment-${path}-${i}`}>
          <span className="folder" onClick={()=>navigateToSelectedFolder(fullPath)}>
            {path}
          </span>
          {i!==folders.length-1 && <span className="divider">/</span>}
        </React.Fragment>
    });
  }

  return (
    <div
      className="file-exploerer-main"
    >
      <div className="navigator">
        <div className="path-main">
          <div className="icon-container">
            <FontAwesomeIcon 
              icon={faArrowLeft}
              className="back-btn"
            />

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

      <div>
        resources
      </div>
    </div>
  )
}
