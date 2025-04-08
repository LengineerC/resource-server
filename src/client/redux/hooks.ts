import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispath, RootState } from "./store";

export const useAppDispatch:()=>AppDispath=useDispatch;
export const useAppSelector:TypedUseSelectorHook<RootState>=useSelector;