import {configureStore} from "@reduxjs/toolkit";
import connectReducer from "./slices/connectSlice";

const store=configureStore({
    reducer:{
        connect:connectReducer,
    }
});

export type RootState=ReturnType<typeof store.getState>;
export type AppDispath=typeof store.dispatch;

export default store;