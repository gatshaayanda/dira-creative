"use client";

import {useEffect,useState} from "react";
import {getIdToken,type User} from "firebase/auth";
import {createDiraEnquiry,type DiraSelectedItem} from "@/lib/firebase/dira-data";
import {DEFAULT_DIRA_CATALOGUE} from "@/lib/dira-catalogue";
import type {CustomerProfile} from "@/lib/firebase/data";

type Props={user:User;profile:CustomerProfile;onSaved:(id:string)=>void};
type Change={action:"added"|"removed"|"package_changed";itemId:string;itemName:string;kind:"service"|"package";price:number;at:string};
const packages=[
 {id:"package-novice",includes:["logo-basic","colour-basic","type-basic","layout-basic"]},
 {id:"package-elevate",includes:["logo-standard","colour-standard","type-standard","icons-basic","graphics-basic","layout-standard"]},
 {id:"package-elite",includes:["logo-inclusive","colour-full","type-full","icons-custom","graphics-full","photo-full","illustration-custom","layout-full"]},
] as const;
const money=(n:number)=>"P"+n.toLocaleString("en-BW",{minimumFractionDigits:2,maximumFractionDigits:2});
const catalogue=DEFAULT_DIRA_CATALOGUE.filter(x=>x.published);
export default function DiraProjectBuilder({user,profile,onSaved}:Props){
 const[packageId,setPackageId]=useState("");
 const[custom,setCustom]=useState(false);
 const[chosen,setChosen]=useState<string[]>([]);
 const[excluded,setExcluded]=useState<string[]>([]);
 const[history,setHistory]=useState<Change[]>([]);
 const[scope,setScope]=useState("");
 const[name,setName]=useState(profile.name||user.displayName||"");
 const[email,setEmail]=useState(profile.email||user.email||"");
 const[phone,setPhone]=useState(profile.phone||"");
 const[busy,setBusy]=useState(false);
 const[notice,setNotice]=useState("");
 const[expanded,setExpanded]=useState(false);
 const selectedPackage=catalogue.find(x=>x.id===packageId&&x.kind==="package");
 const included:string[]=[...(packages.find(x=>x.id===packageId)?.includes||[])];
 const serviceIds=custom?chosen:included.filter(id=>!excluded.includes(id));
 const addOns=custom?serviceIds.filter(id=>catalogue.find(x=>x.id===id)?.kind==="service"):chosen.filter(id=>!included.includes(id));
 const total=(selectedPackage?.priceFrom||0)+addOns.reduce((sum,id)=>sum+(catalogue.find(x=>x.id===id)?.priceFrom||0),0);
 const packageChoices=catalogue.filter(x=>x.kind==="package");
 const serviceChoices=catalogue.filter(x=>x.kind==="service");
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const requested=params.get("package")||params.get("service")||"";
  const item=catalogue.find(x=>x.id===requested||x.name.toLowerCase()===requested.toLowerCase());
  if(!item)return;
  if(item.kind==="package"){setPackageId(item.id);setCustom(false);setChosen([]);setExcluded([]);}
  else{setPackageId("");setCustom(true);setChosen([item.id]);}
 },[]);
 function changePackage(id:string){
  const item=packageChoices.find(x=>x.id===id);if(!item)return;
  const previous=packageChoices.find(x=>x.id===packageId);
  const at=new Date().toISOString();
  setHistory(v=>[...v,...(previous?[{action:"package_changed" as const,itemId:previous.id,itemName:previous.name,kind:"package" as const,price:previous.priceFrom||0,at}]:[]),{action:"package_changed",itemId:item.id,itemName:item.name,kind:"package",price:item.priceFrom||0,at}]);
  setPackageId(id);setCustom(false);setChosen([]);setExcluded([]);
 }
 function toggle(id:string){
  const item=serviceChoices.find(x=>x.id===id);if(!item)return;
  const exists=custom?chosen.includes(id):excluded.includes(id);
  const action=custom?(exists?"removed":"added"):(exists?"added":"removed");
  setHistory(v=>[...v,{action,itemId:id,itemName:item.name,kind:"service",price:item.priceFrom||0,at:new Date().toISOString()}]);
  if(custom)setChosen(v=>exists?v.filter(x=>x!==id):[...v,id]);
  else setExcluded(v=>exists?v.filter(x=>x!==id):[...v,id]);
 }
 function switchToCustom(){setChosen(v=>[...included.filter(id=>!excluded.includes(id)),...v.filter(id=>!included.includes(id))]);setCustom(true);setPackageId("");setExcluded([]);setHistory(v=>[...v,{action:"package_changed",itemId:"custom",itemName:"Custom service-only proposal",kind:"package",price:0,at:new Date().toISOString()}]);}
 async function submit(){
  if(busy)return;
  if(!name.trim()||!email.trim()||!phone.trim()||!scope.trim()){setNotice("Complete your name, email, WhatsApp and project brief before sending your proposal.");return;}
  if(!serviceIds.length&&!selectedPackage){setNotice("Choose a package or at least one individual service.");return;}
  setBusy(true);setNotice("");
  try{
   const selectedItems:DiraSelectedItem[]=[
    ...(selectedPackage?[{id:selectedPackage.id,name:selectedPackage.name,kind:"package" as const,price:selectedPackage.priceFrom||0,priceLabel:selectedPackage.priceLabel}]:[]),
    ...addOns.map(id=>catalogue.find(x=>x.id===id)).filter((x):x is typeof catalogue[number]=>Boolean(x)).map(x=>({id:x.id,name:x.name,kind:"service" as const,price:x.priceFrom||0,priceLabel:x.priceLabel}))
   ];
   const now=new Date().toISOString();
   const id=await createDiraEnquiry({customerId:user.uid,customerName:name.trim(),email:email.trim(),phone:phone.trim(),serviceName:selectedItems.map(x=>x.name).join(" + "),packageName:selectedPackage?.name||"",selectedItems,scope:scope.trim(),budget:"",preferredTimeline:"To discuss during consultation",engagementMode:"remote",attachment:null,createdAt:now,updatedAt:now,status:"New Enquiry",configurationType:custom?"custom":"package",proposedTotal:total,excludedInclusions:excluded.map(id=>{const x=catalogue.find(y=>y.id===id)!;return{id:x.id,name:x.name,price:x.priceFrom||0}}),configurationHistory:history} as Parameters<typeof createDiraEnquiry>[0],await getIdToken(user));
   onSaved(id);
  }catch(error){setNotice(error instanceof Error?error.message:"Your proposal could not be saved. Your selections remain on this screen.");}
  finally{setBusy(false);}
 }
 return <section className="diraBuilder" id="project-builder">
  <div className="diraBuilderHeading"><div><span className="kicker">YOUR NEXT STEP · LIVE PROJECT CONFIGURATION</span><h2>{selectedPackage?.name||"Build your business solution"}</h2><p>Choose the starting point that fits your business today. You can change it or build a service-only proposal.</p></div><strong>{money(total)}</strong></div>
  <div className="diraBuilderPackages">{packageChoices.map(item=><button type="button" key={item.id} className={packageId===item.id&&!custom?"isSelected":""} onClick={()=>changePackage(item.id)}><span>{item.name.replace(" Brand Package","")}</span><strong>{item.priceLabel}</strong></button>)}<button type="button" className={custom?"isSelected":""} onClick={switchToCustom}><span>Custom services</span><strong>Build your own</strong></button></div>
  {selectedPackage&&<div className="diraBuilderIncluded"><div className="diraBuilderSubhead"><strong>What this package includes</strong><small>Toggle components to shape the scope Dira will review.</small></div><div className="diraBuilderServiceList">{included.map(id=>{const item=catalogue.find(x=>x.id===id);if(!item)return null;const active=!excluded.includes(id);return <label key={id} className={!active?"isExcluded":""}><input type="checkbox" checked={active} onChange={()=>toggle(id)}/><span><strong>{item.name}</strong><small>{item.priceLabel} reference value · {active?"Included in package":"Excluded from proposed scope"}</small></span><b>{active?"Included":"Excluded"}</b></label>})}</div><p className="orderTruth">The published package price remains the reference price while Dira reviews exclusions. Any revised package price is confirmed by Dira before approval; no automatic discount is assumed.</p></div>}
  <div className="diraBuilderIncluded"><div className="diraBuilderSubhead"><strong>{custom?"Choose the services for your custom proposal":"Add individual services"}</strong><small>Selected add-ons are added to the live estimate.</small></div><button type="button" className="diraBuilderToggle" onClick={()=>setExpanded(v=>!v)}>{expanded?"Hide service catalogue":"Browse all "+serviceChoices.length+" services"}</button>{expanded&&<div className="diraBuilderServiceList">{serviceChoices.filter(item=>custom||!included.includes(item.id)).map(item=>{const active=chosen.includes(item.id);return <label key={item.id}><input type="checkbox" checked={active} onChange={()=>{const exists=chosen.includes(item.id);setHistory(v=>[...v,{action:exists?"removed":"added",itemId:item.id,itemName:item.name,kind:"service",price:item.priceFrom||0,at:new Date().toISOString()}]);setChosen(v=>exists?v.filter(x=>x!==item.id):[...v,item.id]);}}/><span><strong>{item.name}</strong><small>{item.description}</small></span><b>{item.priceLabel}</b></label>})}</div>}</div>
  <div className="diraBuilderReceipt"><div className="diraBuilderSubhead"><strong>Your live receipt</strong><small>Indicative BWP estimate · no payment taken</small></div>{selectedPackage&&<div><span>{selectedPackage.name}</span><strong>{selectedPackage.priceLabel}</strong></div>}{addOns.map(id=>{const item=catalogue.find(x=>x.id===id);return item?<div key={id}><span>{item.name}</span><strong>{item.priceLabel}</strong></div>:null})}{excluded.length>0&&<p>{excluded.length} package inclusion(s) excluded from the proposed scope · review required</p>}<div className="diraBuilderTotal"><span>Current estimate</span><strong>{money(total)}</strong></div></div>
  <div className="diraBuilderForm"><div className="diraBuilderSubhead"><strong>Tell Dira about your business</strong><small>We'll review feasibility and arrange a conversation.</small></div><div className="fieldGrid"><label>Your name<input value={name} onChange={e=>setName(e.target.value)} required/></label><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>WhatsApp / phone<input value={phone} onChange={e=>setPhone(e.target.value)} required/></label></div><label>What are you trying to achieve?<textarea rows={3} maxLength={5000} value={scope} onChange={e=>setScope(e.target.value)} placeholder="Tell us where the business is today, what is missing and what you want to achieve." required/></label></div>
  <div className="diraBuilderSubmit"><button type="button" className="button buttonPrimary" onClick={()=>void submit()} disabled={busy}>{busy?"Saving your proposal…":"Continue with this solution →"}</button><small>Your proposed configuration and change history go to Dira for review. This is not a confirmed quote or payment.</small></div>
  {notice&&<p className="notice" role="status">{notice}</p>}
 </section>;
}
