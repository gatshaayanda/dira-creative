"use client";

import {useState} from "react";

type Props={name?:string;subtitle?:string;className?:string};

export default function DiraBrand({name="Dira Creative",subtitle="BRAND & BUSINESS DEVELOPMENT",className=""}:Props){
 const[hasLogo,setHasLogo]=useState(true);
 return <span className={`diraBrand ${className}`.trim()}>
  {hasLogo?<img src="/diralogo.jpeg" alt="" onError={()=>setHasLogo(false)}/>:<span className="diraBrandFallback" aria-hidden="true">D</span>}
  <span className="diraBrandWords"><strong>{name}</strong>{subtitle&&<small>{subtitle}</small>}</span>
 </span>;
}
