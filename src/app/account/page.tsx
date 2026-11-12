"use client";
import Link from "next/link";
import DiraBrand from "@/components/DiraBrand";
import {getIdToken,GoogleAuthProvider,browserLocalPersistence,linkWithPopup,onAuthStateChanged,setPersistence,signInWithCredential,signInWithPopup,signOut,type User} from "firebase/auth";
import {useEffect,useState} from "react";
import {auth,hasFirebaseWebConfig} from "@/lib/firebase/client";
import NotificationSettings from "@/components/NotificationSettings";
import CustomerConversations from "@/components/CustomerConversations";
import ClientProjectTasks from "@/components/ClientProjectTasks";
import {getCustomerProfile,isAdminUser,saveCustomerProfile,type CustomerProfile} from "@/lib/firebase/data";
import {subscribeToCustomerDiraEnquiries,type DiraEnquiry} from "@/lib/firebase/dira-data";

function authMessage(error:unknown){
 const code=typeof error==="object"&&error&&"code" in error?String((error as {code?:unknown}).code):"";
 if(code==="auth/popup-closed-by-user")return "Google sign-in was cancelled.";
 if(code==="auth/credential-already-in-use"||code==="auth/account-exists-with-different-credential")return "That Google account belongs to a separate Dira Creative client account. The histories have not been merged, and your current session is unchanged. Keep this session open; the accounts cannot safely be combined automatically.";
 if(code==="auth/popup-blocked")return "Your browser blocked the Google sign-in window. Allow pop-ups for Dira Creative and try again.";
 if(code==="auth/unauthorized-domain")return "Google sign-in is not enabled for this website yet. Try again later; your current session has not been changed.";
 if(code==="auth/configuration-not-found"||code==="auth/operation-not-allowed")return "Google sign-in is not available yet. Dira Creative's sign-in setup is incomplete. Try again later.";
 if(code.startsWith("auth/")||code.startsWith("app/"))return "Google sign-in could not be completed because Dira Creative’s sign-in setup is not ready. Try again later; your current session has not been changed.";
 return "Google sign-in could not be completed. Please try again later. Your current session has not been changed.";
}
const terminal=new Set(["Completed","Cancelled"]);

export default function AccountPage(){
 const[user,setUser]=useState<User|null>(null),[profile,setProfile]=useState<CustomerProfile|null>(null),[requests,setRequests]=useState<DiraEnquiry[]>([]),[busy,setBusy]=useState(false),[authReady,setAuthReady]=useState(false),[message,setMessage]=useState(""),[showPostSubmitSetup,setShowPostSubmitSetup]=useState(false);


 useEffect(()=>{const params=new URLSearchParams(window.location.search);if(params.has("submitted")){setMessage("Your project enquiry is saved. Dira Creative will review the scope, prepare a quote and confirm the proposed timeline. No payment has been taken.");setShowPostSubmitSetup(true)}},[]);
 useEffect(()=>{
  let stopRequests=()=>{};
  let stopAuth=()=>{};
  let disposed=false;
  const start=async()=>{
   if(hasFirebaseWebConfig){
    try{await setPersistence(auth,browserLocalPersistence)}catch{if(!disposed)setMessage("This browser could not confirm saved sign-in. Keep this browser session available while using Dira Creative.")}
   }
   if(disposed)return;
   stopAuth=onAuthStateChanged(auth,async next=>{
    stopRequests();stopRequests=()=>{};
    if(next&&await isAdminUser(next.uid)){
     await signOut(auth);
     if(disposed)return;
     setUser(null);setProfile(null);setRequests([]);setAuthReady(true);return;
    }
    if(disposed)return;
    setUser(next);
    if(next){
     const saved=await getCustomerProfile(next.uid).catch(()=>null);
     if(disposed)return;
     setProfile(saved??{uid:next.uid,name:next.displayName??"",email:next.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
     stopRequests=subscribeToCustomerDiraEnquiries(next.uid,setRequests,error=>setMessage(error.message));
    }else{setProfile(null);setRequests([])}
    setAuthReady(true);
   });
  };
  void start();
  return()=>{disposed=true;stopRequests();stopAuth()};
 },[]);

 async function google(){
  if(!authReady||busy)return;
  if(!hasFirebaseWebConfig){setMessage("Google sign-in is not available yet because Dira Creative's client sign-in setup is incomplete. Try again later; your current session has not been changed.");return;}
  setBusy(true);setMessage("");
  try{
   const provider=new GoogleAuthProvider();provider.setCustomParameters({prompt:"select_account"});
   let recoveredExistingAccount=false;
   if(user?.isAnonymous){
    try{
     const linked=await linkWithPopup(user,provider);
     const saved=await getCustomerProfile(linked.user.uid);
     if(saved)setProfile(saved);
    }catch(error){
     const code=typeof error==="object"&&error&&"code" in error?String((error as {code?:unknown}).code):"";
     if(code!=="auth/credential-already-in-use"&&code!=="auth/account-exists-with-different-credential")throw error;
     // The Google identity already has its own UID. Sign into that existing account
     // instead of trapping the customer in an anonymous-session linking error.
     // Do not claim or attempt to merge the separate histories.
     const credential=GoogleAuthProvider.credentialFromError(error as import("firebase/app").FirebaseError);
     if(!credential)throw error;
     const result=await signInWithCredential(auth,credential);
     const now=new Date().toISOString();
     const saved=await getCustomerProfile(result.user.uid);
     if(saved)setProfile(saved);
     else{
      const nextProfile={uid:result.user.uid,name:result.user.displayName??"",email:result.user.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:now,updatedAt:now};
      await saveCustomerProfile(nextProfile);setProfile(nextProfile);
     }
     recoveredExistingAccount=true;
    }
   }
   else if(!user){const result=await signInWithPopup(auth,provider);const now=new Date().toISOString();const saved=await getCustomerProfile(result.user.uid);if(saved)setProfile(saved);else{const nextProfile={uid:result.user.uid,name:result.user.displayName??"",email:result.user.email??"",phone:"",preferredDeliveryLocation:"",notes:"",createdAt:now,updatedAt:now};await saveCustomerProfile(nextProfile);setProfile(nextProfile)}}
   setMessage(recoveredExistingAccount?"You’re signed in to your existing Dira Creative Google account. The separate guest-session history has not been merged.":"Your Dira Creative client account is connected.");
   const destination=new URLSearchParams(window.location.search).get("next");
   if(destination&&destination.startsWith("/")&&!destination.startsWith("//"))window.location.assign(destination);
  }catch(error){setMessage(authMessage(error))}finally{setBusy(false)}
 }

 async function approveQuote(request:DiraEnquiry){
  if(!user||busy)return;
  setBusy(true);setMessage("");
  try{
   const idToken=await getIdToken(user);
   const response=await fetch("/api/client-enquiry/approve-quote",{method:"POST",headers:{Authorization:"Bearer "+idToken,"Content-Type":"application/json"},body:JSON.stringify({enquiryId:request.id})});
   const result=await response.json().catch(()=>({}));
   if(!response.ok)throw new Error(typeof result.error==="string"?result.error:"We could not record your approval. Please try again.");
   setMessage(result.alreadyApproved?"You already approved this exact quote.":"Quote approval saved. Dira Creative can now confirm any agreed initial payment and begin the project.");
  }catch(error){setMessage(error instanceof Error?error.message:"We could not record your approval. Please try again.");}
  finally{setBusy(false);}
 }

 async function save(event:React.FormEvent<HTMLFormElement>){
  event.preventDefault();if(!user||!profile)return;setBusy(true);setMessage("");
  const form=new FormData(event.currentTarget);
  const next={...profile,name:String(form.get("name")??"").trim(),email:String(form.get("email")??"").trim(),phone:String(form.get("phone")??"").trim(),preferredDeliveryLocation:String(form.get("preferredDeliveryLocation")??"").trim(),notes:String(form.get("notes")??"").trim(),updatedAt:new Date().toISOString()};
  try{await saveCustomerProfile(next);setProfile(next);setMessage("Your Dira Creative client profile is saved.")}catch{setMessage("We could not save your details. Nothing was changed; please try again.")}finally{setBusy(false)}
 }

 return <main className="orderPage diraAccountPage"><div className="orderWrap">
  <div className="orderHeader"><Link href="/" className="logo"><DiraBrand/></Link><nav aria-label="Client account navigation" className="accountTopNav"><Link href="/" className="button buttonLight">Store</Link><Link href="#enquiries" className="button buttonLight">My activity</Link><Link href="/request" className="button buttonPrimary">New enquiry <span aria-hidden="true">↗</span></Link></nav></div>
  <section className="orderCard accountHome accountDashboard" style={{maxWidth:920,margin:"0 auto"}}>
   <div className="accountHero"><div><span className="kicker">DIRA CREATIVE / CLIENT SPACE</span><h1>Your work, in one place.</h1><p>Keep track of your enquiries, project progress, quotes and conversations with Dira Creative.</p></div>{user&&profile&&<span className="accountStatus">{user.isAnonymous?"Guest session":"Account connected"}</span>}</div>
   {user&&profile&&<nav className="accountQuicklinks" aria-label="Your account shortcuts"><a href="#enquiries"><span>01</span><strong>My enquiries</strong><small>{requests.length?`${requests.length} saved ${requests.length===1?"enquiry":"enquiries"}`:"View your project activity"}</small><b aria-hidden="true">↘</b></a><a href="#conversation-hub"><span>02</span><strong>Messages</strong><small>Talk privately with Dira Creative</small><b aria-hidden="true">↗</b></a><a href="#notifications"><span>03</span><strong>Project updates</strong><small>Manage notification preferences</small><b aria-hidden="true">↗</b></a><a href="#profile"><span>04</span><strong>Your details</strong><small>Keep your contact details current</small><b aria-hidden="true">↗</b></a></nav>}
   {(!user||user.isAnonymous)&&<section id="connect" className="accountConnect accountConnectPrimary"><div><strong>{user?.isAnonymous?"Keep your history and set up your circle.":"Already have a Dira Creative client account?"}</strong><p>{user?.isAnonymous?"Connecting Google is optional, but helps preserve this session’s request history and private conversations across devices.":"Continue with Google to reopen an existing account and its saved history. New to Dira Creative? Start a request first; your private session is created only when you submit."}</p>{!hasFirebaseWebConfig&&<p className="notice" role="status">Dira Creative cannot connect or save requests in this deployment yet. Try again later; nothing has been sent.</p>}</div><div className="actions"><button className="googleSignInButton" type="button" onClick={()=>void google()} disabled={busy||!authReady||!hasFirebaseWebConfig}><span>{!authReady?"Restoring your session…":busy?"Connecting…":user?.isAnonymous?"Connect Google":"Continue with Google"}</span></button><Link className="button buttonLight" href="/request">Start a request</Link></div></section>}





   {user&&profile&&<>
    {requests.length===0?<article className="feedEmpty" id="enquiries"><strong>Nothing here yet.</strong><p>Start a project enquiry and Dira Creative will review it here.</p><Link className="button buttonPrimary" href="/request">Start a project enquiry →</Link></article>:<section className="accountSection" id="enquiries"><div className="panelHeading accountRequestsHeading"><div><span className="kicker">PROJECT ENQUIRIES · {requests.length}</span><h2>Your project enquiries.</h2></div><Link className="button buttonPrimary" href="/request">New project enquiry +</Link></div><div className="feedList">{requests.map(request=>{const complete=terminal.has(request.status);const quote=request.quotedPrice!==undefined?" · Quote "+request.quotedPrice.toFixed(2)+" BWP":"";const required=Number(request.initialPaymentRequired||0);const received=Number(request.initialPaymentReceived||0);return <article className="feedItem" key={request.id}><div className="feedMarker">{complete?"✓":"•"}</div><div className="feedBody"><div className="feedTop"><strong>{request.status}</strong><small>{new Date(request.updatedAt).toLocaleString()}</small></div><p><strong>{request.serviceName}</strong>{request.packageName?" · "+request.packageName:""}{quote}{request.quoteVersion?" · Quote v"+request.quoteVersion:""}</p><div className="feedActions"><span>{required>0?"Verified initial payment P"+received.toFixed(2)+" / P"+required.toFixed(2):"No initial payment required"}</span>{request.projectId&&<span>Project · {request.projectId.slice(0,8).toUpperCase()}</span>}</div>{request.scope&&<details className="enquiryDetailDisclosure"><summary>Project brief</summary><p>{request.scope}</p></details>}{request.deliverables&&<details className="enquiryDetailDisclosure"><summary>Agreed deliverables</summary><p>{request.deliverables}</p></details>}{request.targetCompletion&&<p className="orderTruth">Target completion: {new Date(request.targetCompletion).toLocaleDateString()}</p>}{request.quotedPrice!==undefined&&["Quote Ready","Awaiting Approval"].includes(request.status)&&request.clientApprovedPrice!==request.quotedPrice&&<div className="feedActions"><p className="orderTruth">Review the quote of P{request.quotedPrice.toFixed(2)} BWP. Approving records your agreement; it does not charge you.</p><button className="button buttonPrimary" type="button" disabled={busy} onClick={()=>void approveQuote(request)}>{busy?"Saving approval…":"Approve this quote"}</button></div>}{request.clientApprovedAt&&request.clientApprovedPrice!==undefined&&request.clientApprovedPrice===request.quotedPrice&&<p className="orderTruth">You approved this quote on {new Date(request.clientApprovedAt).toLocaleString()}. {request.projectId?"Your project record is now active.":"Your project record is being prepared."}</p>}{request.status==="Awaiting Initial Payment"&&<p className="orderTruth">Quote approved. The agreed initial payment must be verified before project work begins.</p>}{request.status==="In Progress"&&<p className="orderTruth">Your project is in progress. Dira Creative will share updates and deliverables here.</p>}{request.status==="Client Review"&&<p className="orderTruth">Project deliverables are ready for your review.</p>}{request.status==="Completed"&&<p className="orderTruth">Project completed. Your deliverables and handover details are available above and in your private conversation.</p>}</div></article>})}</div></section>}
   </>}
   {user&&<ClientProjectTasks uid={user.uid}/>}

   {user&&<details className="memberSetup accountSetupDisclosure" open={showPostSubmitSetup}><summary className="accountSetupSummary"><span className="kicker">OPTIONAL SETUP</span><strong>Account & updates</strong><small>Connect Google, choose project notifications and update your client details.</small><b aria-hidden="true">＋</b></summary><div className="accountSetupBody"><div className="memberSetupHeading"><span className="kicker">MAKE IT YOURS</span><h2 id="member-setup-title">{user.isAnonymous?"Keep your Dira Creative project history together.":"Your client account, your way."}</h2><p>{user.isAnonymous?"Connect Google to keep project enquiries and private conversations available when you change devices. Notification preferences can be managed separately.":"Manage sign-in, project updates, contact details and private conversations from one place."}</p></div><div className="memberSetupGrid">{user.isAnonymous?<><a href="#notifications" className="memberSetupCard memberSetupCardPrimary"><span>01 · UPDATES</span><strong>Enable project updates <b aria-hidden="true">↗</b></strong><small>Receive supported enquiry, quote and private message notifications on this device.</small></a><a href="#connect" className="memberSetupCard"><span>02 · KEEP YOUR HISTORY</span><strong>Connect Google <b aria-hidden="true">↗</b></strong><small>Recommended before changing devices so you can keep access to your project records.</small></a><a href="#profile" className="memberSetupCard"><span>03 · CONTACT DETAILS</span><strong>Update your client details <b aria-hidden="true">↗</b></strong><small>Keep your email, phone number and project context current.</small></a></>:<><div className="memberSetupCard memberSetupCardComplete"><span>01 · ACCOUNT</span><strong>Account connected <b aria-hidden="true">✓</b></strong><small>Your project enquiries and private conversations are linked to this account.</small></div><a href="#notifications" className="memberSetupCard"><span>02 · STAY INFORMED</span><strong>Choose project alerts <b aria-hidden="true">↗</b></strong><small>Enable this device for supported enquiry, quote and reply updates.</small></a><a href="#profile" className="memberSetupCard"><span>03 · YOUR DETAILS</span><strong>Update client details <b aria-hidden="true">↗</b></strong><small>Keep your contact details and project context current.</small></a></>}</div><p className="memberSetupFootnote">Your project enquiries and private conversations are visible only to the signed-in client account and authorised Dira Creative team.</p>{user&&profile&&<section className="accountSection accountSetupNotifications" id="notifications"><div className="panelHeading"><div><span className="kicker">PREFERENCES</span><h2>Notifications.</h2></div></div><NotificationSettings/></section>}{user&&!user.isAnonymous&&profile&&<></>}</div></details>}

   {user&&<CustomerConversations/>}


   {message&&<p className="notice" role="status">{message}</p>}

   {user&&!user.isAnonymous&&profile&&<>
      <div className="accountBottomActions"><button className="button buttonLight" type="button" onClick={()=>void signOut(auth)}>Sign out</button><span className="orderTruth">Your account keeps your project enquiries and conversations together.</span></div></>}
   {user&&profile&&<details id="profile" className="accountDetails"><summary><span><strong>Your details</strong><small>Name, email, phone and project context</small></span><b>Edit</b></summary><form className="adminForm" onSubmit={save}><label>Name<input name="name" defaultValue={profile.name} required/></label><label>Email<input name="email" type="email" defaultValue={profile.email} readOnly={Boolean(user.email)} required={!user.isAnonymous}/>{user.isAnonymous&&<span>Optional until you connect Google.</span>}</label><label>Phone / WhatsApp<input name="phone" type="tel" defaultValue={profile.phone} required/></label><label>Preferred working location <span>(optional)</span><input name="preferredDeliveryLocation" defaultValue={profile.preferredDeliveryLocation}/></label><label>Notes <span>(optional)</span><textarea name="notes" defaultValue={profile.notes}/></label><button className="button buttonPrimary" type="submit" disabled={busy}>{busy?"Saving…":"Save my details"}</button></form></details>}
   {user&&!user.isAnonymous&&<details id="external-links" className="accountDetails"><summary><span><strong>External links</strong><small>For when you actually need them</small></span><b>Open</b></summary><div className="adminForm"><p className="orderTruth">Your requests, conversations and Dira Creative activity come first. Open these only when you want to leave Dira Creative.</p><p><a href="tel:+26774343719">Call Dira Creative · +267 74 343 719 ↗</a></p><p><a href="mailto:info.diracreative@gmail.com">Email Dira Creative ↗</a></p></div></details>}
   <p className="accountFooterNote orderTruth">{user?.isAnonymous?"Connect Google before changing devices if you want to keep access to your history.":"the team confirms the price and timing before you pay."}</p>
  {user&&profile&&<nav className="accountBottomNav" aria-label="Quick account navigation"><Link href="/">Store</Link><a href="#enquiries">Activity</a><a href="#conversation-hub">Messages</a><a href="#profile">Profile</a></nav>}
  </section>
 </div></main>;
}
