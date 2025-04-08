import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser,
  faServer,
  faFlag,
  faPowerOff,
 } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { useState } from "react";
import { clearUserState } from "../../redux/slices/userSlice";
import { logout } from "../../services/ftpService";
import { useNavigate } from "react-router-dom";

import "./index.scss";

export default function Header() {
  const navigate=useNavigate();
  const dispatch=useAppDispatch();
  const [showOptions,setShowOptions]=useState<boolean>(false);
  const config=useAppSelector(s=>s.user);

  const disconnect=()=>{
    dispatch(clearUserState());
    logout();
    navigate("/login");
  }

  return (
    <div className="header">
      <div className="info-container">
        <div className="info-row" style={{marginBottom:5}}>
          <FontAwesomeIcon 
            icon={faFlag}
            style={{
              fontSize:15,
              color:"#fafafa",
              marginRight:7
            }}
          />
          <div className="info">
            {config.protocol?.toUpperCase() || "Unknown".toUpperCase()}
          </div>
        </div>
        
        <div className="info-row">
          <FontAwesomeIcon 
            icon={faServer}
            style={{
              fontSize:15,
              color:"#fafafa",
              marginRight:5
            }}
          />
          <div className="info">
            {config.config?.host || "Not connected"}
          </div>
        </div>
      </div>

      <div className="user-container">
        <div className="username">
          {config.config?.user || "user"}
        </div>
        
        <div 
          className="user-icon"
          onMouseEnter={()=>setShowOptions(true)}
          onMouseLeave={()=>setShowOptions(false)}
        >
          <FontAwesomeIcon 
            icon={faUser}
            style={{
              color:"#fafafa",
              fontSize:21,
            }}
          />

          <div 
            className={`option-container ${showOptions?"show":"hide"}`}
          >
            <div 
              className="option"
              onClick={disconnect}
            >
              <FontAwesomeIcon 
                icon={faPowerOff}
                className="icon"
              />

              断开连接
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
