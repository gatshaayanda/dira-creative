"use client";
import {useEffect,useState} from "react";
import {subscribeToClientDiraTasks,type DiraTask} from "@/lib/firebase/dira-projects";

export default function ClientProjectTasks({uid}:{uid:string}){
 const[tasks,setTasks]=useState<DiraTask[]>([]),[error,setError]=useState("");
 useEffect(()=>subscribeToClientDiraTasks(uid,setTasks,problem=>setError(problem.message)),[uid]);
 if(error)return <section className="accountSection"><p className="notice" role="status">{error}</p></section>;
 if(!tasks.length)return null;
 const groups=tasks.reduce<Record<string,DiraTask[]>>((result,task)=>{(result[task.projectId]??=[]).push(task);return result;},{});
 return <section className="accountSection diraClientTasks"><div className="panelHeading"><div><span className="kicker">DELIVERY TRANSPARENCY</span><h2>Project checklist.</h2></div><span className="orderTruth">{tasks.filter(task=>task.status==="Done").length} / {tasks.length} complete</span></div>{Object.entries(groups).map(([projectId,items])=><div className="diraClientTaskGroup" key={projectId}><h3>{items[0]?.projectName||"Project"} <small>· {projectId.slice(0,8).toUpperCase()}</small></h3>{items.map(task=><article key={task.id}><span className={"diraTaskStatus status-"+task.status.toLowerCase().replaceAll(" ","-")}>{task.status}</span><div><strong>{task.title}</strong>{task.description&&<p>{task.description}</p>}<small>{task.assignee?"Assigned to "+task.assignee:"Dira Creative team"}{task.dueDate?" · Due "+new Date(task.dueDate).toLocaleDateString():""}</small></div></article>)}</div>)}</section>;
}
