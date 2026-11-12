"use client";
import {addDoc,collection,deleteDoc,doc,onSnapshot,query,updateDoc,where} from "firebase/firestore";
import type {Unsubscribe} from "firebase/firestore";
import {db} from "@/lib/firebase/client";

export type DiraServiceKind="service"|"package";
export type DiraService={
 id:string;
 name:string;
 kind:DiraServiceKind;
 category:string;
 description:string;
 priceFrom?:number;
 priceTo?:number;
 priceLabel:string;
 imageUrl?:string;
 featured:boolean;
 published:boolean;
 sortOrder:number;
 createdAt:string;
 updatedAt:string;
};
const services=collection(db,"services");
const sorted=(items:DiraService[])=>items.sort((a,b)=>a.sortOrder-b.sortOrder||a.name.localeCompare(b.name));
export function subscribeToPublishedDiraServices(onChange:(items:DiraService[])=>void,onError:(error:Error)=>void):Unsubscribe{
 return onSnapshot(query(services,where("published","==",true)),snapshot=>onChange(sorted(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<DiraService,"id">})))),error=>onError(error instanceof Error?error:new Error("Dira Creative services are unavailable.")));
}
export function subscribeToAllDiraServices(onChange:(items:DiraService[])=>void,onError:(error:Error)=>void):Unsubscribe{
 return onSnapshot(services,snapshot=>onChange(sorted(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<DiraService,"id">})))),error=>onError(error instanceof Error?error:new Error("The service catalogue is unavailable.")));
}
export async function createDiraService(data:Omit<DiraService,"id"|"createdAt"|"updatedAt">){
 const now=new Date().toISOString();const ref=await addDoc(services,{...data,createdAt:now,updatedAt:now});return ref.id;
}
export async function updateDiraService(id:string,patch:Partial<Omit<DiraService,"id"|"createdAt">>){
 await updateDoc(doc(db,"services",id),{...patch,updatedAt:new Date().toISOString()});
}
export async function deleteDiraService(id:string){await deleteDoc(doc(db,"services",id));}
