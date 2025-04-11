import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useAppSelector } from "../../redux/hooks";
// import { logout } from "../../services/ftpService";

import "./index.scss";

export default function Main() {
  const navigate=useNavigate();
  const connect=useAppSelector(s=>s.connect);
  const mainRef=useRef<HTMLDivElement|null>(null);

  useEffect(()=>{
    if(!connect.config || !connect.protocol){
      navigate("/login");
    };

  },[window.location.pathname]);

  const handleRightClick=(e:MouseEvent)=>{
    e.preventDefault();
  }

  useEffect(()=>{
    mainRef.current?.addEventListener("contextmenu",handleRightClick);

    return ()=>{
      mainRef.current?.removeEventListener("contextmenu",handleRightClick);
    }
  },[]);


  return (
    <div className="main" ref={mainRef}>
      <Outlet />
    </div>
  );
}

// export default function MainWrapper(){
//   const navigate=useNavigate();
//   const location=useLocation();
//   const connect=useAppSelector(s=>s.connect);

//   return (
//     <Main 
//       navigate={navigate} 
//       location={location} 
//       connect={connect}
//     />
//   );
// }


// type Props={
//   navigate:NavigateFunction,
//   location:Location,
//   connect:ConnectState
// }

// class Main extends PureComponent<Props>{
//   componentDidUpdate(prevProps: Readonly<Props>): void {
//       if(prevProps.location.pathname!==this.props.location.pathname){
//         const {config,protocol}=this.props.connect;
//         if(!config || !protocol){
//           this.props.navigate("/login");
//         }
//       }
//   }

//   componentDidMount(): void {
//     const {config,protocol}=this.props.connect;
//     if(!config || !protocol){
//       setTimeout(()=>{
//         this.props.navigate("/login");
//       },0);
//     }
//   }

//   componentWillUnmount(): void {
//     console.log("logout");
    
//     logout();
//   }

//   render(): ReactNode {
//     return(
//       <div className="main">
//         <Outlet />
//       </div>
//     );
//   }
// }