"use client";

import {collection,doc,getDoc,getDocs,onSnapshot,query,updateDoc,where} from "firebase/firestore";
import type {Unsubscribe} from "firebase/firestore";
import {db} from "@/lib/firebase/client";

export const DIRA_ENQUIRY_STATUSES = [
  "New Enquiry",
  "Reviewing",
  "Quote Ready",
  "Awaiting Approval",
  "Awaiting Initial Payment",
  "Initial Payment Received",
  "In Progress",
  "Client Review",
  "Completed",
  "Cancelled",
] as const;
export type DiraEnquiryStatus = typeof DIRA_ENQUIRY_STATUSES[number];

export type DiraAttachment = {url:string;name:string;type:string;size:number};
export type DiraSelectedItem = {id:string;name:string;kind:"service"|"package";price:number;priceLabel:string};
export type DiraEnquiry = {
  id:string;
  customerId:string;
  customerName:string;
  email:string;
  phone:string;
  serviceName:string;
  packageName:string;
  selectedItems?:DiraSelectedItem[];
  scope:string;
  budget:string;
  preferredTimeline:string;
  attachment?:DiraAttachment|null;
  createdAt:string;
  updatedAt:string;
  status:DiraEnquiryStatus;
  quotedPrice?:number;
  initialPaymentRequired?:number;
  initialPaymentReceived?:number;
  paymentReference?:string;
  paymentMethod?:string;
  targetCompletion?:string;
  engagementMode?:"remote"|"on-site"|"hybrid";
  deliverables?:string;
  quoteId?:string;
  quoteVersion?:number;
  projectId?:string;
  clientApprovedAt?:string;
  clientApprovedPrice?:number;
  clientApprovalSource?:string;
  clientApprovalUid?:string;\n  configurationType?:"package"|"custom";\n  proposedTotal?:number;\n  excludedInclusions?:Array<{id:string;name:string;price:number}>;\n  configurationHistory?:Array<{action:"added"|"removed"|"package_changed";itemId:string;itemName:string;kind:"service"|"package";price:number;at:string}>;
};

const enquiries=collection(db,"clientEnquiries");

export async function createDiraEnquiry(data:Omit<DiraEnquiry,"id">,idToken:string){
  const ref=doc(enquiries);
  const response=await fetch("/api/client-enquiry",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+idToken},body:JSON.stringify({enquiryId:ref.id,data})});
  const result=await response.json().catch(()=>({error:"The enquiry service returned an unreadable response."})) as {enquiryId?:string;error?:string};
  if(!response.ok||!result.enquiryId)throw new Error(result.error||"The enquiry could not be confirmed. Your details remain on this page.");
  return result.enquiryId;
}

export async function getDiraEnquiry(id:string):Promise<DiraEnquiry|null>{
  const snapshot=await getDoc(doc(db,"clientEnquiries",id));
  return snapshot.exists()?{id:snapshot.id,...snapshot.data() as Omit<DiraEnquiry,"id">}:null;
}

export function subscribeToCustomerDiraEnquiries(uid:string,onChange:(items:DiraEnquiry[])=>void,onError:(error:Error)=>void):Unsubscribe{
  return onSnapshot(query(enquiries,where("customerId","==",uid)),snapshot=>{
    onChange(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<DiraEnquiry,"id">})).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)));
  },error=>onError(error instanceof Error?error:new Error("Your Dira Creative enquiries are unavailable.")));
}

export function subscribeToAllDiraEnquiries(onChange:(items:DiraEnquiry[])=>void,onError:(error:Error)=>void):Unsubscribe{
  return onSnapshot(enquiries,snapshot=>{
    onChange(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<DiraEnquiry,"id">})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));
  },error=>onError(error instanceof Error?error:new Error("The Dira Creative enquiry queue is unavailable.")));
}

export async function updateDiraEnquiry(id:string,patch:Partial<Omit<DiraEnquiry,"id"|"customerId"|"createdAt">>){
  await updateDoc(doc(db,"clientEnquiries",id),{...patch,updatedAt:new Date().toISOString()});
}

export async function getDiraEnquiryCount(uid:string){
  const snapshot=await getDocs(query(enquiries,where("customerId","==",uid)));
  return snapshot.size;
}
