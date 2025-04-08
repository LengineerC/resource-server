import { CSSProperties, ReactNode } from "react";
import "./index.scss";

type Props={
    children:ReactNode,
    style?:CSSProperties,
    className?:string
}

export default function Card({children,style={},className=""}:Props) {

  return (
    <div 
      className={`card-main ${className}`}
      style={style}
    >
      {children}
    </div>
  )
}
