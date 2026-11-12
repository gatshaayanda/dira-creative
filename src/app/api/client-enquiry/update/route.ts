import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
export const runtime="nodejs";
const statuses=["New Enquiry","Reviewing","Quote Ready","Awaiting Approval","Awaiting Initial Payment","Initial Payment Received","In Progress","Client Review","Completed","Cancelled"];
function app(){const raw=process.env.FIREBASE_ADMIN_KEY;if(!raw)throw new Error("Dira Creative's database is not configured yet.");if(getApps().length)return getApps()[0];let account:Record<string,unknown>;try{account=JSON.parse(raw) as Record<string,unknown>}catch{throw new Error("Dira Creative's Firebase credentials are invalid.")}return initializeApp({credential:cert(account as Parameters<typeof cert>[0])})}
export async function POST(request:Request){
 try{
  const a=app(),match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);if(!match)return NextResponse.json({error:"Owner sign-in is required."},{status:401});
  const token=await getAuth(a).verifyIdToken(match[1]),db=getFirestore(a),admin=await db.collection("admins").doc(token.uid).get();
  if(!admin.exists||!["owner","staff"].includes(String(admin.data()?.role??"").toLowerCase()))return NextResponse.json({error:"Only authorised Dira Creative staff can update project records."},{status:403});
  const body=await request.json() as {enquiryId?:unknown;quotedPrice?:unknown;initialPaymentRequired?:unknown;initialPaymentReceived?:unknown;paymentReference?:unknown;paymentMethod?:unknown;targetCompletion?:unknown;engagementMode?:unknown;deliverables?:unknown;status?:unknown};
  if(typeof body.enquiryId!=="string"||!body.enquiryId)return NextResponse.json({error:"Missing client enquiry reference."},{status:400});
  const quote=body.quotedPrice===undefined?undefined:Number(body.quotedPrice),required=Number(body.initialPaymentRequired??0),received=Number(body.initialPaymentReceived??0),reference=String(body.paymentReference??"").trim(),method=String(body.paymentMethod??"").trim(),targetCompletion=String(body.targetCompletion??""),engagementMode=String(body.engagementMode??"remote"),deliverables=String(body.deliverables??"").trim(),requestedStatus=String(body.status??"Reviewing");
  if(quote!==undefined&&(!Number.isFinite(quote)||quote<=0||quote>100000000))return NextResponse.json({error:"Enter a valid final quote in BWP."},{status:400});
  if(!Number.isFinite(required)||required<0||!Number.isFinite(received)||received<0||required>100000000||received>100000000)return NextResponse.json({error:"Check the initial payment amounts."},{status:400});
  if(quote!==undefined&&(required>quote||received>quote))return NextResponse.json({error:"Initial payment amounts cannot exceed the quoted total."},{status:400});
  if(!statuses.includes(requestedStatus))return NextResponse.json({error:"Invalid project status."},{status:400});
  if(!["remote","on-site","hybrid"].includes(engagementMode))return NextResponse.json({error:"Invalid engagement mode."},{status:400});
  if(targetCompletion&&!/^\d{4}-\d{2}-\d{2}$/.test(targetCompletion))return NextResponse.json({error:"Use a valid target completion date."},{status:400});
  if(deliverables.length>4000||reference.length>180||method.length>100)return NextResponse.json({error:"One of the project fields is too long."},{status:400});
  const enquiryRef=db.collection("clientEnquiries").doc(body.enquiryId),now=new Date().toISOString(),paymentRef=db.collection("payments").doc(),baseUrl=process.env.NEXT_PUBLIC_BASE_URL||"";
  const result=await db.runTransaction(async tx=>{
   const snap=await tx.get(enquiryRef);if(!snap.exists)throw new Error("Client enquiry not found.");
   const old=snap.data()??{},oldReceived=Number(old.initialPaymentReceived??0);
   if(received<oldReceived)throw new Error("Verified payment totals cannot be reduced. Record a separate adjustment if a correction is needed.");
   const paymentDelta=received-oldReceived;
   if(paymentDelta>0&&(!method||!reference))throw new Error("Add the payment method and transaction reference before recording verified funds.");
   const termsChanged=Number(old.quotedPrice??0)!==Number(quote??0)||Number(old.initialPaymentRequired??0)!==required||String(old.deliverables??"")!==deliverables||String(old.targetCompletion??"")!==targetCompletion||String(old.engagementMode??"remote")!==engagementMode;
   const approvalCurrent=Boolean(old.clientApprovedAt&&old.clientApprovedPrice===quote&&!termsChanged);
   let nextStatus=requestedStatus;
   if(termsChanged&&old.clientApprovedAt&&quote!==undefined)nextStatus="Quote Ready";
   if(nextStatus==="Quote Ready"&&quote===undefined)throw new Error("Set a final quote before sending it to the client.");
   if(["Awaiting Initial Payment","Initial Payment Received","In Progress","Client Review","Completed"].includes(nextStatus)&&!approvalCurrent)throw new Error("The client must approve the current quote before the project can proceed.");
   if(["Initial Payment Received","In Progress","Client Review","Completed"].includes(nextStatus)&&required>received)throw new Error("Record the required initial payment before moving the project forward.");
   if(["Client Review","Completed"].includes(nextStatus)&&!deliverables)throw new Error("Add the agreed deliverables before review or completion.");
   if(nextStatus==="Awaiting Initial Payment"&&required>0&&received>=required)nextStatus="Initial Payment Received";
   let quoteId=String(old.quoteId??""),quoteVersion=Number(old.quoteVersion??0),newQuote=false;
   if(quote!==undefined&&(termsChanged||!quoteId)){
    const quoteQuery=db.collection("quotes").where("enquiryId","==",body.enquiryId),quoteSnapshot=await tx.get(quoteQuery);
    quoteVersion=quoteSnapshot.docs.reduce((max,d)=>Math.max(max,Number(d.data().version??0)),0)+1;
    for(const previous of quoteSnapshot.docs){if(["Draft","Sent"].includes(String(previous.data().status??"")))tx.update(previous.ref,{status:"Superseded",updatedAt:now});}
    const newQuoteRef=db.collection("quotes").doc();quoteId=newQuoteRef.id;newQuote=true;
    tx.create(newQuoteRef,{enquiryId:body.enquiryId,clientId:old.customerId,serviceName:old.serviceName,packageName:old.packageName||"",scope:old.scope||"",amount:quote,currency:"BWP",initialPaymentRequired:required,deliverables,targetCompletion,engagementMode,version:quoteVersion,status:nextStatus==="Quote Ready"?"Sent":"Draft",sentAt:nextStatus==="Quote Ready"?now:null,sentBy:token.uid,createdAt:now,updatedAt:now});
   }
   if(paymentDelta>0)tx.create(paymentRef,{enquiryId:body.enquiryId,clientId:old.customerId,projectId:old.projectId||null,amount:paymentDelta,currency:"BWP",method,reference,status:"Verified",source:"owner-confirmed",verifiedAt:now,verifiedBy:token.uid,createdAt:now});
   const update:Record<string,unknown>={quotedPrice:quote??null,initialPaymentRequired:required,initialPaymentReceived:received,paymentReference:reference,paymentMethod:method,targetCompletion,engagementMode,deliverables,status:nextStatus,updatedAt:now};
   if(quoteId){update.quoteId=quoteId;update.quoteVersion=quoteVersion;}
   if(termsChanged&&old.clientApprovedAt){update.clientApprovedAt=null;update.clientApprovedPrice=null;update.clientApprovalUid=null;update.clientApprovalSource=null;}
   tx.update(enquiryRef,update);
   if(old.projectId){const projectRef=db.collection("projects").doc(String(old.projectId));tx.update(projectRef,{status:termsChanged&&old.clientApprovedAt?"Quote Revision":nextStatus,targetCompletion,engagementMode,deliverables,updatedAt:now});}
   return {customerId:String(old.customerId??""),status:nextStatus,quoteVersion,paymentDelta,quoteSent:nextStatus==="Quote Ready",newQuote};
  });
  let notified=0;
  if(result.customerId&&(result.quoteSent||result.paymentDelta>0)){
   const pref=(await db.collection("notificationPreferences").doc(result.customerId).get()).data();
   if(pref?.enabled){const tokens=await db.collection("notificationTokens").doc(result.customerId).collection("tokens").get(),messaging=getMessaging(a);for(const device of tokens.docs){const value=String(device.data().token??"");if(!value)continue;try{await messaging.send({token:value,notification:{title:result.quoteSent?"Dira Creative sent a quote":"Dira Creative recorded a payment",body:result.quoteSent?"Your project quote is ready to review.": "A verified payment has been added to your project record."},data:{link:"/account#enquiries",enquiryId:body.enquiryId},webpush:{...(baseUrl?{fcmOptions:{link:baseUrl+"/account#enquiries"}}:{}),notification:{tag:"dira-enquiry-"+body.enquiryId,icon:"/dira-icon.svg",badge:"/dira-icon.svg"}}});notified++}catch{}}}
  }
  return NextResponse.json({saved:true,status:result.status,quoteVersion:result.quoteVersion,paymentRecorded:result.paymentDelta>0,notificationCount:notified,message:result.quoteSent?"Quote sent to the client for approval.":result.paymentDelta>0?"Verified payment recorded.":"Project update saved."});
 }catch(error){console.error("[Dira Creative] owner enquiry update failed:",error);return NextResponse.json({error:error instanceof Error?error.message:"The project update could not be saved."},{status:400})}
}
