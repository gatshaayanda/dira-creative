"use client";
import {useEffect,useState} from "react";
import {auth} from "@/lib/firebase/client";
import {subscribeToCustomerConversations,type Conversation} from "@/lib/firebase/data";
import ConversationPanel from "@/components/ConversationPanel";

const REQUESTS=[
 ["Question","Ask Dira Creative anything about the service"],
 ["Service information","Ask what a service includes or request a custom scope"],
 ["Project enquiry","Discuss a service, package or preferred timeline"],
 ["Larger engagement","Discuss a multi-service or multi-brand project"],
 ["Future planning","Discuss a phased project or ongoing support"],
 ["Quote & payment","Discuss a proposal, agreed initial payment, invoice or receipt"],
 ["Deliverables & handover","Discuss files, revisions and final handover"],
 ["Something else","Tell Dira Creative what you need in your own words"]
];

export default function CustomerConversations(){
 const[user,setUser]=useState(auth.currentUser),[conversations,setConversations]=useState<Conversation[]>([]),[selected,setSelected]=useState<string>(),[selectedTitle,setSelectedTitle]=useState<string>(),[notice,setNotice]=useState("");
 useEffect(()=>auth.onAuthStateChanged(next=>setUser(next)),[]);
 useEffect(()=>{if(!user){setConversations([]);setNotice("");return}return subscribeToCustomerConversations(user.uid,setConversations,error=>{const code=(error as {code?:unknown}).code;setNotice(code==="permission-denied"?"Customer messages are temporarily unavailable. Your Dira Creative account and orders are still safe.":"We could not load your Dira Creative messages right now.")})},[user]);
 function start(title:string){if(!user)return;setNotice("");setSelected(undefined);setSelectedTitle(title);}
 if(!user)return null;
 if(selected||selectedTitle)return <ConversationPanel conversationId={selected} conversationTitle={selectedTitle} onBack={()=>{setSelected(undefined);setSelectedTitle(undefined)}}/>;
 return <section className="conversationHub" id="conversation-hub">
  <div className="panelHeading"><div><span className="kicker">Talk to Dira Creative</span><h2>Need something?</h2><p className="orderTruth">Ask questions, discuss quotes and payments, or share supporting images and PDFs. The Dira Creative team can reply here.</p></div><span className="conversationPrivate">{conversations.filter(x=>x.unreadForCustomer).length?conversations.filter(x=>x.unreadForCustomer).length+" new":"Private"}</span></div>
  <div className="conversationList">{conversations.map(item=><button className="conversationRow" key={item.id} onClick={()=>setSelected(item.id)}><span className="conversationDot" data-unread={item.unreadForCustomer?"true":"false"}/><span><strong>{item.title}</strong><small>{item.lastMessagePreview||"No messages yet."}</small></span><time>{new Date(item.updatedAt).toLocaleDateString()}</time></button>)}{!conversations.length&&<div className="conversationEmpty"><strong>No conversations yet.</strong><p>Start a private conversation with Dira Creative. Replies and supporting files stay in your client account.</p></div>}</div>
  <details className="conversationStart"><summary><span><strong>Start a conversation</strong><small>Choose a topic to help Dira Creative understand what you need.</small></span><b aria-hidden="true">＋</b></summary><div className="requestChoices">{REQUESTS.map(([title,copy])=><button key={title} className="requestChoice" onClick={()=>start(title)}><strong>{title}</strong><span>{copy}</span><b aria-hidden="true">→</b></button>)}</div></details>
  {notice&&<p className="notice" role="status">{notice}</p>}
 </section>
}