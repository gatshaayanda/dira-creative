"use client";
import {addDoc,collection,deleteDoc,doc,onSnapshot,query,updateDoc,where} from "firebase/firestore";
import type {Unsubscribe} from "firebase/firestore";
import {db} from "@/lib/firebase/client";

export const DIRA_TASK_STATUSES=["To Do","In Progress","Done","Blocked"] as const;
export type DiraTaskStatus=typeof DIRA_TASK_STATUSES[number];
export type DiraTask={id:string;projectId:string;enquiryId:string;clientId:string;title:string;description:string;status:DiraTaskStatus;dueDate:string;assignee:string;sortOrder:number;createdAt:string;updatedAt:string};
const tasks=collection(db,"tasks");
const sorted=(items:DiraTask[])=>items.sort((a,b)=>a.sortOrder-b.sortOrder||a.createdAt.localeCompare(b.createdAt));
export function subscribeToProjectTasks(projectId:string,onChange:(items:DiraTask[])=>void,onError:(error:Error)=>void):Unsubscribe{
 return onSnapshot(query(tasks,where("projectId","==",projectId)),snapshot=>onChange(sorted(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<DiraTask,"id">})))),error=>onError(error instanceof Error?error:new Error("Project tasks are unavailable.")));
}
export function subscribeToClientDiraTasks(clientId:string,onChange:(items:DiraTask[])=>void,onError:(error:Error)=>void):Unsubscribe{
 return onSnapshot(query(tasks,where("clientId","==",clientId)),snapshot=>onChange(sorted(snapshot.docs.map(item=>({id:item.id,...item.data() as Omit<DiraTask,"id">})))),error=>onError(error instanceof Error?error:new Error("Your project checklist is unavailable.")));
}
export async function createDiraTask(data:Omit<DiraTask,"id"|"createdAt"|"updatedAt">){
 const now=new Date().toISOString();const ref=await addDoc(tasks,{...data,createdAt:now,updatedAt:now});return ref.id;
}
export async function updateDiraTask(id:string,patch:Partial<Omit<DiraTask,"id"|"projectId"|"enquiryId"|"clientId"|"createdAt">>){
 await updateDoc(doc(db,"tasks",id),{...patch,updatedAt:new Date().toISOString()});
}
export async function deleteDiraTask(id:string){await deleteDoc(doc(db,"tasks",id));}
