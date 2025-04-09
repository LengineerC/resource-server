import { RouteObject } from "react-router-dom";
// import { lazy } from "react";
import { Main } from "../components";

import Login from "../pages/Login";
import Home from "../pages/Home";


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