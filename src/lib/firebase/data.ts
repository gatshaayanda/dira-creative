"use client";

import {addDoc,collection,doc,getDoc,onSnapshot,query,setDoc,updateDoc,where} from "firebase/firestore";
import type {Unsubscribe} from "firebase/firestore";
import {db} from "@/lib/firebase/client";

export type CustomerProfile={uid:string;name:string;email:string;phone:string;preferredDeliveryLocation:string;notes:string;createdAt:string;updatedAt:string};
export type NotificationPreferences={enabled:boolean;leadMinutes?:number;updatedAt:string};
export type NotificationToken={token:string;admin:boolean;updatedAt:string};
export type ConversationAttachment={url:string;name:string;type:string;size:number};
export type Conversation={id:string;customerId:string;customerName?:string;title:string;status:"open"|"waiting"|"resolved";createdAt:string;updatedAt:string;lastMessageAt:string;lastMessagePreview:string;unreadForCustomer:boolean;unreadForAdmin:boolean;customerLastReadAt?:string;adminLastReadAt?:string};
export type ConversationMessage={id:string;senderId:string;senderRole:"customer"|"admin";text:string;attachment?:ConversationAttachment|null;createdAt:string};

const customersCollection=collection(db,"customers");
const conversationsCollection=collection(db,"conversations");

export async function isAdminUser(uid:string):Promise<boolean>{
 const snapshot=await getDoc(doc(db,"admins",uid));
 return snapshot.exists()&&["owner","staff"].includes(String(snapshot.data().role??"").toLowerCase());
}
export async function getCustomerProfile(uid:string):Promise<CustomerProfile|null>{
 const snapshot=await getDoc(doc(customersCollection,uid));
 return snapshot.exists()?{uid:snapshot.id,...snapshot.data() as Omit<CustomerProfile,"uid">}:null;
}
export async function saveCustomerProfile(profile:CustomerProfile){
 await setDoc(doc(customersCollection,profile.uid),profile,{merge:true});
}
export async function getNotificationPreferences(uid:string):Promise<NotificationPreferences|null>{
 const snapshot=await getDoc(doc(db,"notificationPreferences",uid));
 return snapshot.exists()?snapshot.data() as NotificationPreferences:null;
}
export async function saveNotificationPreferences(uid:string,prefs:NotificationPreferences){
 await setDoc(doc(db,"notificationPreferences",uid),prefs,{merge:true});
}
export async function saveNotificationToken(uid:string,token:string,admin:boolean){
 const encoded=encodeURIComponent(token);
 await setDoc(doc(db,"notificationTokens",uid,"tokens",encoded),{token,admin,updatedAt:new Date().toISOString()} as NotificationToken,{merge:true});
}
export async function createCustomerConversation(uid:string,title:string):Promise<string>{
 const profile=await getCustomerProfile(uid),now=new Date().toISOString();
 const reference=await addDoc(conversationsCollection,{customerId:uid,customerName:profile?.name||"Dira Creative client",title,status:"open",createdAt:now,updatedAt:now,lastMessageAt:now,lastMessagePreview:"",unreadForCustomer:false,unreadForAdmin:false});
 return reference.id;
}
export function subscribeToCustomerConversations(uid:string,onChange:(items:Conversation[])=>void,onError:(error:Error)=>void):Unsubscribe{
 return onSnapshot(query(conversationsCollection,where("customerId","==",uid)),snapshot=>onChange(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<Conversation,"id">})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))),error=>onError(error instanceof Error?error:new Error("Client conversations are unavailable.")));
}
export function subscribeToAdminConversations(onChange:(items:Conversation[])=>void,onError:(error:Error)=>void):Unsubscribe{
 return onSnapshot(conversationsCollection,snapshot=>onChange(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<Conversation,"id">})).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt))),error=>onError(error instanceof Error?error:new Error("The Dira Creative client inbox is unavailable.")));
}
export function subscribeToConversation(id:string,onConversation:(conversation:Conversation|null)=>void,onMessages:(messages:ConversationMessage[])=>void,onError:(error:Error)=>void):Unsubscribe{
 const stopConversation=onSnapshot(doc(db,"conversations",id),snapshot=>onConversation(snapshot.exists()?{id:snapshot.id,...snapshot.data() as Omit<Conversation,"id">}:null),error=>onError(error instanceof Error?error:new Error("Conversation unavailable.")));
 const stopMessages=onSnapshot(query(collection(db,"conversations",id,"messages")),snapshot=>onMessages(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<ConversationMessage,"id">})).sort((a,b)=>a.createdAt.localeCompare(b.createdAt))),error=>onError(error instanceof Error?error:new Error("Messages unavailable.")));
 return ()=>{stopConversation();stopMessages()};
}
export async function updateConversationRead(id:string,role:"customer"|"admin"){
 const field=role==="customer"?"unreadForCustomer":"unreadForAdmin";
 const readField=role==="customer"?"customerLastReadAt":"adminLastReadAt";
 await updateDoc(doc(db,"conversations",id),{[field]:false,[readField]:new Date().toISOString()});
}
export async function recordConversationMessage(id:string,role:"customer"|"admin",preview:string){
 const now=new Date().toISOString();
 await updateDoc(doc(db,"conversations",id),{updatedAt:now,lastMessageAt:now,lastMessagePreview:preview.slice(0,160),...(role==="customer"?{unreadForAdmin:true}:{unreadForCustomer:true})});
}
