"use client";

import {signInAnonymously} from "firebase/auth";
import {auth,hasFirebaseWebConfig} from "@/lib/firebase/client";

let guestPromise:Promise<string|null>|null=null;
export type DiraJourneyEvent="public_visit"|"catalogue_view"|"service_selected"|"request_flow_opened"|"request_submitted"|"notification_enabled";

async function guestToken():Promise<string|null>{
  if(!hasFirebaseWebConfig)return null;
  try{
    let user=auth.currentUser;
    if(!user){
      if(!guestPromise)guestPromise=signInAnonymously(auth).then(result=>result.user.getIdToken()).catch(()=>null).finally(()=>{guestPromise=null});
      return await guestPromise;
    }
    return await user.getIdToken();
  }catch{return null}
}

export async function trackDiraJourney(event:DiraJourneyEvent,details:{itemId?:string;itemName?:string;kind?:"service"|"package"}={}){
  const token=await guestToken();
  if(!token)return;
  const safeDetails={
    ...(typeof details.itemId==="string"?{itemId:details.itemId.slice(0,100)}:{}),
    ...(typeof details.itemName==="string"?{itemName:details.itemName.slice(0,120)}:{}),
    ...(details.kind==="service"||details.kind==="package"?{kind:details.kind}:{})
  };
  try{
    await fetch("/api/analytics/journey",{method:"POST",headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:JSON.stringify({event,details:safeDetails})});
  }catch{/* Analytics must never interrupt the customer journey. */}
}
