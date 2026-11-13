"use client";
import {useEffect,useState} from "react";
import {auth} from "@/lib/firebase/client";
import {subscribeToCustomerConversations,type Conversation} from "@/lib/firebase/data";
import ConversationPanel from "@/components/ConversationPanel";

const REQUESTS=[
 ["Question","A quick question for the team"],
 ["Service information","What a service includes or costs"],
 ["Project enquiry","Discuss a package, scope or timeline"],
 ["Larger engagement","A multi-service or multi-brand project"],
 ["Future planning","Phased work or ongoing support"],
 ["Quote & payment","A proposal, payment or receipt"],
 ["Deliverables & handover","Files, revisions or final handover"],
 ["Something else","Explain what you have in mind"]
];

export default function CustomerConversations(){
 const[user,setUser]=useState(auth.currentUser),[conversations,setConversations]=useState<Conversation[]>([]),[selected,setSelected]=useState<string>(),[selectedTitle,setSelectedTitle]=useState<string>(),[notice,setNotice]=useState("");
 useEffect(()=>auth.onAuthStateChanged(next=>setUser(next)),[]);
 useEffect(()=>{if(!user){setConversations([]);setNotice("");return}return subscribeToCustomerConversations(user.uid,setConversations,error=>{const code=(error as {code?:unknown}).code;setNotice(code==="permission-denied"?"Messages are temporarily unavailable. Your account and projects are safe.":"Messages could not be loaded. Please try again.")})},[user]);
 function start(title:string){if(!user)return;setNotice("");setSelected(undefined);setSelectedTitle(title);}
 if(!user)return null;
 if(selected||selectedTitle)return <ConversationPanel conversationId={selected} conversationTitle={selectedTitle} onBack={()=>{setSelected(undefined);setSelectedTitle(undefined)}}/>;
 return <section className="conversationHub" id="conversation-hub">
  <div className="conversationHubHeading">
   <div><span className="kicker">PRIVATE MESSAGES</span><h2>Talk to Dira Creative</h2><p>Questions, quotes, payments and project files — all in one place.</p></div>
   <span className="conversationPrivate">{conversations.filter(x=>x.unreadForCustomer).length?conversations.filter(x=>x.unreadForCustomer).length+" new":"Private"}</span>
  </div>
  {conversations.length>0?<div className="conversationList">{conversations.map(item=><button className="conversationRow" key={item.id} onClick={()=>setSelected(item.id)}><span className="conversationDot" data-unread={item.unreadForCustomer?"true":"false"}/><span><strong>{item.title}</strong><small>{item.lastMessagePreview||"No messages yet."}</small></span><time>{new Date(item.updatedAt).toLocaleDateString()}</time></button>)}</div>:<div className="conversationEmpty"><span className="conversationEmptyIcon" aria-hidden="true">↗</span><div><strong>Your private inbox is ready.</strong><p>Start a message whenever you need the Dira team. Replies and files stay with your client account.</p></div></div>}
  <details className="conversationStart"><summary><span><strong>＋ New message</strong><small>Choose a topic to get started</small></span><b aria-hidden="true">⌄</b></summary><div className="requestChoices">{REQUESTS.map(([title,copy])=><button key={title} className="requestChoice" onClick={()=>start(title)}><strong>{title}</strong><span>{copy}</span><b aria-hidden="true">→</b></button>)}</div></details>
  {notice&&<p className="notice" role="status">{notice}</p>}
 </section>
}