import { RouteObject } from "react-router-dom";
import { lazy } from "react";

import Login from "../pages/Login/Login";
import Main from "../components/Main/Main";
import Home from "../pages/Home/Home";


const router:RouteObject[]=[
    {
        path:"/",
        element: <Main />,
        children:[
            {
                path:"",
                element:<Home />
            }
        ],
    },
    {
        path:"/login",
        element: <Login />
    }
];

export default router;