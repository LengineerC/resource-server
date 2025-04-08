import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PROTOCOL } from "../../../public/utils/enums";
import { FTPConfig } from "../../../public/types/common";

type UserState={
    protocol:null|PROTOCOL,
    config:null | FTPConfig,
}

const initialState:UserState={
    protocol:null,
    config:null,
}

const userSlice=createSlice({
    name: "user",
    initialState,
    reducers: {
        saveUserState(state,action:PayloadAction<UserState>){
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