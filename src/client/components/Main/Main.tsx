import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAppSelector } from "../../redux/hooks";
import { logout } from "../../services/ftpService";
import Header from "../Header/Header";

import "./index.scss";

export default function Main() {
  const navigate=useNavigate();
  const user=useAppSelector(s=>s.user.config);

  // useEffect(()=>{
  //   if(!user){
  //     navigate("/login");
  //   };

  // },[window.location.pathname]);

  useEffect(()=>{

    return ()=>{
      logout();
    }
  },[]);

  return (
    <div className="main">
      <Header />
      <Outlet />
    </div>
  );
}