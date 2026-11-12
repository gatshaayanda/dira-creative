"use client";

import Link from "next/link";
import DiraBrand from "@/components/DiraBrand";
import {useEffect,useState} from "react";
import {signInAnonymously} from "firebase/auth";
import {addDoc,collection} from "firebase/firestore";
import {auth,db,hasFirebaseWebConfig} from "@/lib/firebase/client";
import {uploadFiles} from "@/lib/uploadthing";
import {createCustomerConversation,getCustomerProfile,recordConversationMessage,saveCustomerProfile} from "@/lib/firebase/data";
import {createDiraEnquiry,type DiraSelectedItem} from "@/lib/firebase/dira-data";
import {DEFAULT_DIRA_CATALOGUE} from "@/lib/dira-catalogue";
import {trackDiraJourney} from "@/lib/firebase/journey-analytics";

type Attachment={url:string;name:string;type:string;size:number};
const MAX_FILE_SIZE=4*1024*1024;

export default function RequestForm(){
 const[serviceName,setServiceName]=useState("");
 const[packageName,setPackageName]=useState("");
 const[selectedItems,setSelectedItems]=useState<DiraSelectedItem[]>([]);
 const[additionalServiceId,setAdditionalServiceId]=useState("");
 const[showAddService,setShowAddService]=useState(false);
 const[name,setName]=useState("");
 const[email,setEmail]=useState("");
 const[phone,setPhone]=useState("");
 const[scope,setScope]=useState("");
 const[budget,setBudget]=useState("");
 const[preferredTimeline,setPreferredTimeline]=useState("");
 const[engagementMode,setEngagementMode]=useState<"remote"|"on-site"|"hybrid">("remote");
 const[file,setFile]=useState<File|null>(null);
 const[busy,setBusy]=useState(false);
 const[progress,setProgress]=useState(0);
 const[notice,setNotice]=useState("");
 const[enquiryId,setEnquiryId]=useState("");
 useEffect(()=>{void trackDiraJourney("request_flow_opened");const params=new URLSearchParams(window.location.search);const initialName=params.get("package")||params.get("service")||"";const initial=DEFAULT_DIRA_CATALOGUE.find(item=>item.name.toLowerCase()===initialName.trim().toLowerCase());if(initial){const entry={id:initial.id,name:initial.name,kind:initial.kind,price:initial.priceFrom??0,priceLabel:initial.priceLabel};setSelectedItems([entry]);void trackDiraJourney("service_selected",{itemId:initial.id,itemName:initial.name,kind:initial.kind});setServiceName(initial.name);setPackageName(initial.kind==="package"?initial.name:"");}},[]);
 const selectedIds=new Set(selectedItems.map(item=>item.id));
 function addAnotherService(){const item=DEFAULT_DIRA_CATALOGUE.find(entry=>entry.id===additionalServiceId);if(!item||selectedIds.has(item.id))return;void trackDiraJourney("service_selected",{itemId:item.id,itemName:item.name,kind:item.kind});const next={id:item.id,name:item.name,kind:item.kind,price:item.priceFrom??0,priceLabel:item.priceLabel};setSelectedItems(current=>[...current,next]);setServiceName(current=>current?current+" + "+item.name:item.name);if(item.kind==="package")setPackageName(current=>current?[current,item.name].join(" + "):item.name);setAdditionalServiceId("");setShowAddService(false);}
 function removeService(id:string){const next=selectedItems.filter(item=>item.id!==id);setSelectedItems(next);setServiceName(next.map(item=>item.name).join(" + "));setPackageName(next.filter(item=>item.kind==="package").map(item=>item.name).join(" + "));}
 const selectedCatalogueItem=selectedItems[0]&&DEFAULT_DIRA_CATALOGUE.find(item=>item.id===selectedItems[0].id);

 async function submit(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();
  if(busy)return;
  if(!selectedItems.length||!name.trim()||!email.trim()||!phone.trim()||!scope.trim()){setNotice("Choose at least one service, then complete your name, email, WhatsApp and project brief.");return;}
  if(file&&(!file.type.startsWith("image/")&&file.type!=="application/pdf")){setNotice("Attach an image or PDF file.");return;}
  if(file&&file.size>MAX_FILE_SIZE){setNotice("Attachments must be 4 MB or smaller.");return;}
  if(!hasFirebaseWebConfig){const message=["Hello Dira Creative, I would like to enquire about a project.","Selected services:",...selectedItems.map(item=>"- "+item.name+" · "+item.priceLabel),"Name: "+name.trim(),"Email: "+email.trim(),"WhatsApp: "+phone.trim(),"Budget guide: "+(budget.trim()||"Not supplied"),"Preferred timeline: "+(preferredTimeline.trim()||"To discuss"),"Working preference: "+engagementMode,"Project brief: "+scope.trim(),file?"Attachment to add in WhatsApp: "+file.name:""].filter(Boolean).join("\n");window.open("https://wa.me/26774343719?text="+encodeURIComponent(message),"_blank","noopener,noreferrer");setNotice("A WhatsApp enquiry draft has been prepared. Your details are not sent or saved by Dira until you press Send in WhatsApp.");return;}
  setBusy(true);setNotice("");setProgress(0);
  let savedId="";
  try{
   let customer=auth.currentUser;
   if(!customer)customer=(await signInAnonymously(auth)).user;
   const now=new Date().toISOString();
   let attachment:Attachment|null=null;
   if(file){
    const uploaded=await uploadFiles("fileUploader",{files:[file],onUploadProgress:({progress:next}:{file:File;progress:number;loaded:number;delta:number;totalLoaded:number;totalProgress:number})=>setProgress(Math.max(0,Math.min(100,Math.round(next))))});
    const first=uploaded?.[0] as (typeof uploaded)[number]&{ufsUrl?:string;appUrl?:string};
    const url=first?.url||first?.ufsUrl||first?.appUrl;
    if(!url)throw new Error("The file upload did not return a usable link. Your enquiry has not been submitted.");
    attachment={url,name:file.name,type:file.type,size:file.size};
   }
   const data={
    customerId:customer.uid,customerName:name.trim(),email:email.trim(),phone:phone.trim(),
    serviceName:selectedItems.map(item=>item.name).join(" + "),packageName:selectedItems.filter(item=>item.kind==="package").map(item=>item.name).join(" + "),selectedItems,scope:scope.trim(),
    budget:budget.trim(),preferredTimeline:preferredTimeline.trim(),attachment,
    createdAt:now,updatedAt:now,status:"New Enquiry" as const,engagementMode
   };
   const idToken=await customer.getIdToken();
   savedId=await createDiraEnquiry(data,idToken);
   await trackDiraJourney("request_submitted",{itemName:selectedItems.map(item=>item.name).join(" + ").slice(0,120)});
   await fetch("/api/notifications/enquiry-created",{method:"POST",headers:{Authorization:"Bearer "+idToken,"Content-Type":"application/json"},body:JSON.stringify({enquiryId:savedId})}).catch(()=>null);
   const existing=await getCustomerProfile(customer.uid).catch(()=>null);
   await saveCustomerProfile({uid:customer.uid,name:name.trim(),email:email.trim(),phone:phone.trim(),preferredDeliveryLocation:existing?.preferredDeliveryLocation||"",notes:scope.trim(),createdAt:existing?.createdAt||now,updatedAt:now});
   try{
    const conversationId=await createCustomerConversation(customer.uid,"Project enquiry · "+serviceName.trim());
    const messageText=["New project enquiry", "Selected services:",...selectedItems.map(item=>item.name+" · "+item.priceLabel), "Engagement: "+engagementMode, "Budget guide: "+(budget.trim()||"Not supplied"), "Preferred timeline: "+(preferredTimeline.trim()||"To discuss"), "Brief: "+scope.trim()].filter(Boolean).join("\n");
    await addDoc(collection(db,"conversations",conversationId,"messages"),{senderId:customer.uid,senderRole:"customer",text:messageText,attachment:attachment??null,createdAt:now});
    await recordConversationMessage(conversationId,"customer",messageText);
   }catch(error){console.warn("[Dira Creative] enquiry conversation setup was not confirmed",error);}
   setEnquiryId(savedId);
   window.location.assign("/account?submitted=1&enquiry="+encodeURIComponent(savedId));
  }catch(error){
   setNotice(error instanceof Error?error.message:"Your enquiry could not be confirmed. Keep this page open and try again.");
  }finally{setBusy(false);setProgress(0);}
 }

 if(enquiryId)return <main className="orderPage"><div className="orderWrap"><div className="orderHeader"><Link href="/" className="logo"><DiraBrand/></Link></div><section className="orderCard confirm"><span className="kicker">ENQUIRY RECEIVED · {enquiryId.slice(0,8).toUpperCase()}</span><h1>Let&apos;s build with intention.</h1><p>Your project enquiry is saved. Dira Creative will review the scope, confirm the proposed deliverables and send a quote for your approval. Any initial payment will be agreed separately; this submission does not charge you.</p><div className="actions centered"><Link href="/account" className="button buttonPrimary">Open my client account →</Link><Link href="/" className="button buttonLight">Back to Dira Creative</Link></div><p className="orderTruth">A requested timeline is a preference, not a confirmed delivery date. Your enquiry and attachments remain linked to this account.</p></section></div></main>;

 return <main className="orderPage"><div className="orderWrap"><div className="orderHeader"><Link href="/" className="logo"><DiraBrand/></Link><Link href="/account" className="button buttonLight">Client account</Link></div><section className="orderCard diraRequestCard" style={{maxWidth:820,margin:"0 auto"}}><span className="kicker">START A PROJECT · GABORONE, BOTSWANA</span><h1>Tell us what you want to build.</h1><p>Five short essentials help us understand the opportunity. We will review the scope and agree a proposal before work or payment is confirmed.</p>{selectedCatalogueItem&&<p className="orderTruth"><strong>Selected: {selectedCatalogueItem.name} · {selectedCatalogueItem.priceLabel}</strong>{selectedCatalogueItem.kind==="package"?" Published package price; scope and any price adjustment can be discussed and agreed before approval.":" Listed service price."}</p>}<div className="diraRequestSteps" aria-label="What happens next"><span><b>01</b> Share your brief</span><span><b>02</b> Scope &amp; proposal</span><span><b>03</b> Approve &amp; begin</span></div><form className="adminForm" onSubmit={submit}>
  <div className="fieldGrid"><div className="diraSelectedServices"><strong>Your selected services & packages</strong>{selectedItems.length?selectedItems.map(item=><div className="diraSelectedService" key={item.id}><span>{item.name} · {item.priceLabel}</span><button type="button" className="textLink" onClick={()=>removeService(item.id)} disabled={busy}>Remove</button></div>):<p className="orderTruth">Choose at least one service or package below.</p>}{showAddService?<div><select value={additionalServiceId} onChange={e=>setAdditionalServiceId(e.target.value)}><option value="">Choose another service or package…</option>{DEFAULT_DIRA_CATALOGUE.filter(item=>!selectedIds.has(item.id)).map(item=><option key={item.id} value={item.id}>{item.name} · {item.priceLabel}</option>)}</select><button type="button" className="button buttonPrimary" onClick={addAnotherService} disabled={!additionalServiceId}>Add selection</button><button type="button" className="textLink" onClick={()=>setShowAddService(false)}>Cancel</button></div>:<button type="button" className="button buttonLight" onClick={()=>setShowAddService(true)}>+ Add another service</button>}<p className="orderTruth">Published prices are shown for each selection. We’ll review the combined scope and agree the final quote before approval.</p></div><label>Your name *<input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" required/></label><label>Email address *<input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" required/></label><label>WhatsApp / phone *<input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" autoComplete="tel" required/></label><details className="diraRequestOptional"><summary>Add a little more context <span>Optional · budget, timing and working preference</span></summary><div className="fieldGrid"><label>Budget guide <span>(BWP)</span><input value={budget} onChange={e=>setBudget(e.target.value)} placeholder="e.g. P3,000–P5,000"/></label><label>Preferred timeline<input value={preferredTimeline} onChange={e=>setPreferredTimeline(e.target.value)} placeholder="e.g. within 4 weeks, flexible"/></label><label>How should we work together?<select value={engagementMode} onChange={e=>setEngagementMode(e.target.value as typeof engagementMode)}><option value="remote">Remote</option><option value="on-site">On-site</option><option value="hybrid">Hybrid</option></select></label></div></details></div>
  <label>Project brief *<textarea value={scope} onChange={e=>setScope(e.target.value)} rows={6} maxLength={5000} placeholder="What are you trying to achieve? Tell us about your business, audience, current challenges and the outcome you need." required/></label>
  <label>Supporting image or PDF <span>(optional · max 4 MB)</span><input type="file" accept="image/*,application/pdf" disabled={busy} onChange={e=>setFile(e.target.files?.[0]||null)}/>{file&&<small>{file.name} · {(file.size/1024/1024).toFixed(1)} MB <button type="button" className="textLink" disabled={busy} onClick={()=>setFile(null)}>Remove</button></small>}</label>
  {busy&&file&&<div className="requestProgress" role="status" aria-live="polite"><div><strong>Uploading attachment</strong><span>{progress}%</span></div><div className="requestProgressTrack"><span style={{width:progress+"%"}}/></div></div>}
  <p className="orderTruth">Submitting creates your private client session and saves this enquiry. You can enable project notifications in your client account afterwards. This is not a confirmed quote, invoice or payment.</p>
  <button className="button buttonPrimary" type="submit" disabled={busy||!selectedItems.length}>{busy?"Saving enquiry…":hasFirebaseWebConfig?"Save project & open my account →":"Continue on WhatsApp →"}</button>
  {!hasFirebaseWebConfig&&<p className="orderTruth">WhatsApp opens a prepared message. Review it and press Send to contact Dira. If you selected an attachment, add it in WhatsApp before sending.</p>}
  {notice&&!enquiryId&&<p className="notice" role="status">{notice}</p>}
 </form></section></div></main>;
}
