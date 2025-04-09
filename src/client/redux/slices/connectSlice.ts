import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PROTOCOL } from "../../../public/utils/enums";
import { FTPConfig } from "../../../public/types/common";

export type ConnectState={
    protocol:null|PROTOCOL,
    config:null | FTPConfig,
}

const initialState:ConnectState={
    protocol:null,
    config:null,
}

const userSlice=createSlice({
    name: "user",
    initialState,
    reducers: {
        saveUserState(state,action:PayloadAction<ConnectState>){
            const {payload}=action;
            state.protocol=payload.protocol;
            state.config=payload.config;
        },
        clearUserState(state){
            state=initialState;
        },
    }
});

export const {
    saveUserState,
    clearUserState,
}=userSlice.actions;

export default userSlice.reducer;