import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
export const runtime="nodejs";
function app(){if(getApps().length)return getApps()[0];const raw=process.env.FIREBASE_ADMIN_KEY;if(!raw)throw new Error("Quote approval is not available until Dira Creative's database is configured.");let account:Record<string,unknown>;try{account=JSON.parse(raw) as Record<string,unknown>}catch{throw new Error("Dira Creative's Firebase credentials are invalid.")}return initializeApp({credential:cert(account as Parameters<typeof cert>[0])})}
export async function POST(request:Request){
 try{
  const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);if(!match)return NextResponse.json({error:"Please restore your client session and try again."},{status:401});
  const a=app(),token=await getAuth(a).verifyIdToken(match[1]),body=await request.json() as {enquiryId?:unknown};
  if(typeof body.enquiryId!=="string"||!body.enquiryId.trim())return NextResponse.json({error:"Missing enquiry reference."},{status:400});
  const db=getFirestore(a),enquiryRef=db.collection("clientEnquiries").doc(body.enquiryId),now=new Date().toISOString();
  const result=await db.runTransaction(async tx=>{
   const snap=await tx.get(enquiryRef);if(!snap.exists)throw new Error("This client enquiry could not be found.");
   const data=snap.data()??{};if(data.customerId!==token.uid)return {status:403 as const,error:"This enquiry does not belong to the signed-in account."};
   if(typeof data.quotedPrice!=="number"||!Number.isFinite(data.quotedPrice)||data.quotedPrice<=0)return {status:409 as const,error:"Dira Creative has not sent a final quote yet."};
   const alreadyApproved=Boolean(data.clientApprovedAt&&data.clientApprovedPrice===data.quotedPrice);
   if(!alreadyApproved&&!["Quote Ready","Awaiting Approval"].includes(String(data.status)))return {status:409 as const,error:"This quote is not awaiting approval. Refresh My enquiries to see the latest status."};
   const required=Number(data.initialPaymentRequired??0),nextStatus=required>0?"Awaiting Initial Payment":"In Progress";
   let quoteId=String(data.quoteId??"");
   let quoteRef=quoteId?db.collection("quotes").doc(quoteId):null;
   let quoteSnap=quoteRef?await tx.get(quoteRef):null;
   if(!quoteSnap?.exists){quoteRef=db.collection("quotes").doc();quoteId=quoteRef.id;}
   let projectId=String(data.projectId??"");
   const projectRef=projectId?db.collection("projects").doc(projectId):db.collection("projects").doc();
   const projectSnap=data.projectId?await tx.get(projectRef):null;
   projectId=projectRef.id;
   const projectData={clientId:token.uid,enquiryId:body.enquiryId,quoteId,serviceName:data.serviceName,packageName:data.packageName||"",scope:data.scope||"",approvedQuote:data.quotedPrice,currency:"BWP",status:nextStatus,targetCompletion:data.targetCompletion||"",engagementMode:data.engagementMode||"remote",deliverables:data.deliverables||"",createdAt:projectSnap?.exists?String(projectSnap.data()?.createdAt||now):now,updatedAt:now};
   if(quoteSnap?.exists)tx.update(quoteRef!,{status:"Approved",approvedAt:data.clientApprovedAt||now,approvedBy:token.uid,updatedAt:now});
   else tx.create(quoteRef!,{enquiryId:body.enquiryId,clientId:token.uid,serviceName:data.serviceName,packageName:data.packageName||"",scope:data.scope||"",amount:data.quotedPrice,currency:"BWP",initialPaymentRequired:required,deliverables:data.deliverables||"",targetCompletion:data.targetCompletion||"",engagementMode:data.engagementMode||"remote",version:Number(data.quoteVersion??1),status:"Approved",sentAt:now,approvedAt:now,approvedBy:token.uid,createdAt:now,updatedAt:now});
   if(projectSnap?.exists)tx.update(projectRef,projectData);else tx.create(projectRef,projectData);
   tx.update(enquiryRef,{clientApprovedAt:data.clientApprovedAt||now,clientApprovedPrice:data.quotedPrice,clientApprovalSource:"dira-client-portal",clientApprovalUid:token.uid,status:nextStatus,quoteId,projectId,updatedAt:now});
   return {status:200 as const,approvedAt:String(data.clientApprovedAt||now),alreadyApproved,projectId};
  });
  if(result.status!==200)return NextResponse.json({error:result.error},{status:result.status});
  if(!result.alreadyApproved){
   const enquiry=(await db.collection("clientEnquiries").doc(body.enquiryId).get()).data()??{},admins=await db.collection("admins").get(),messaging=getMessaging(a),baseUrl=process.env.NEXT_PUBLIC_BASE_URL||"";
   for(const admin of admins.docs){if(!["owner","staff"].includes(String(admin.data()?.role||"").toLowerCase()))continue;const pref=(await db.collection("notificationPreferences").doc(admin.id).get()).data();if(!pref?.enabled)continue;const tokens=await db.collection("notificationTokens").doc(admin.id).collection("tokens").get();for(const device of tokens.docs){const value=String(device.data().token??"");if(!value)continue;try{await messaging.send({token:value,notification:{title:"Dira Creative quote approved",body:String(enquiry.customerName??"Client")+" approved "+String(enquiry.serviceName??"a project quote")},data:{link:"/admin",enquiryId:body.enquiryId,projectId:result.projectId},webpush:{...(baseUrl?{fcmOptions:{link:baseUrl+"/admin"}}:{}),notification:{tag:"dira-quote-approved-"+body.enquiryId,icon:"/dira-icon.svg",badge:"/dira-icon.svg"}}})}catch{}}}
  }
  return NextResponse.json({approved:true,approvedAt:result.approvedAt,alreadyApproved:result.alreadyApproved,projectId:result.projectId});
 }catch(error){console.error("[Dira Creative] quote approval failed:",error);return NextResponse.json({error:error instanceof Error?error.message:"We could not record your approval. Please try again."},{status:400})}
}
