import { useRoutes } from "react-router-dom";
import router from "./route";
import { ConfigProvider } from "antd";

import "./App.scss";

export default function App(){
  const element=useRoutes(router)

  return (
    <ConfigProvider
      theme={{
        token:{
          colorPrimary:"#409EFF",
        }
      }}
    >
      <div className="app">
        {element}
      </div>
    </ConfigProvider>
  );
}