import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore,type DocumentData} from "firebase-admin/firestore";

export const runtime="nodejs";

function adminApp(){
  const existing=getApps()[0];if(existing)return existing;
  const raw=process.env.FIREBASE_ADMIN_KEY;
  if(!raw)throw new Error("The Dira client-enquiry service is not configured.");
  let serviceAccount:Record<string,unknown>;
  try{serviceAccount=JSON.parse(raw) as Record<string,unknown>}
  catch{throw new Error("The Dira Firebase service credentials are invalid.");}
  return initializeApp({credential:cert(serviceAccount as Parameters<typeof cert>[0])});
}

function validEnquiry(data:Record<string,unknown>,uid:string){
  const allowed=["customerId","customerName","email","phone","serviceName","packageName","scope","budget","preferredTimeline","attachment","createdAt","updatedAt","status","engagementMode"];
  if(Object.keys(data).some(key=>!allowed.includes(key))||!allowed.every(key=>Object.prototype.hasOwnProperty.call(data,key)))return false;
  if(data.customerId!==uid||typeof data.customerName!=="string"||!data.customerName.trim()||data.customerName.length>120)return false;
  if(typeof data.email!=="string"||data.email.length>254||!/^\S+@\S+\.\S+$/.test(data.email))return false;
  if(typeof data.phone!=="string"||!data.phone.trim()||data.phone.length>60)return false;
  if(typeof data.serviceName!=="string"||!data.serviceName.trim()||data.serviceName.length>180)return false;
  if(typeof data.packageName!=="string"||data.packageName.length>180||typeof data.scope!=="string"||data.scope.length>5000)return false;
  if(typeof data.budget!=="string"||data.budget.length>160||typeof data.preferredTimeline!=="string"||data.preferredTimeline.length>160)return false;
  if(typeof data.createdAt!=="string"||typeof data.updatedAt!=="string"||data.status!=="New Enquiry")return false;
  if(data.engagementMode!=="remote"&&data.engagementMode!=="on-site"&&data.engagementMode!=="hybrid")return false;
  if(data.attachment!==null){
    if(!data.attachment||typeof data.attachment!=="object"||Array.isArray(data.attachment))return false;
    const attachment=data.attachment as Record<string,unknown>;
    if(Object.keys(attachment).some(key=>!["url","name","type","size"].includes(key)))return false;
    if(typeof attachment.url!=="string"||!attachment.url.startsWith("https://")||typeof attachment.name!=="string"||attachment.name.length>255||typeof attachment.type!=="string"||!["application/pdf"].includes(attachment.type)&&!attachment.type.startsWith("image/")||typeof attachment.size!=="number"||!Number.isFinite(attachment.size)||attachment.size<0||attachment.size>4*1024*1024)return false;
  }
  return true;
}

export async function POST(request:Request){
  try{
    const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);
    if(!match)return NextResponse.json({error:"Your private session expired. Retry the enquiry."},{status:401});
    const app=adminApp(),decoded=await getAuth(app).verifyIdToken(match[1]);
    const body=await request.json() as {enquiryId?:unknown;data?:unknown};
    if(typeof body.enquiryId!=="string"||!/^[A-Za-z0-9_-]{10,128}$/.test(body.enquiryId))return NextResponse.json({error:"Invalid enquiry reference."},{status:400});
    if(!body.data||typeof body.data!=="object"||Array.isArray(body.data))return NextResponse.json({error:"Enquiry details are missing."},{status:400});
    const data=body.data as Record<string,unknown>;
    if(!validEnquiry(data,decoded.uid))return NextResponse.json({error:"Some enquiry details could not be validated. Check the form and retry."},{status:400});
    const db=getFirestore(app),ref=db.collection("clientEnquiries").doc(body.enquiryId);
    const result=await db.runTransaction(async tx=>{
      const existing=await tx.get(ref);
      if(existing.exists){
        const saved=existing.data()??{};
        if(saved.customerId===decoded.uid&&saved.serviceName===data.serviceName&&saved.createdAt===data.createdAt)return {id:ref.id,duplicate:true};
        throw new Error("That enquiry reference already exists. Refresh My enquiries before retrying.");
      }
      tx.create(ref,data as DocumentData);
      return {id:ref.id,duplicate:false};
    });
    return NextResponse.json({enquiryId:result.id,alreadySaved:result.duplicate},{status:result.duplicate?200:201});
  }catch(error){
    console.error("[Dira Creative] client enquiry save failed:",error);
    const message=error instanceof Error?error.message:"The enquiry could not be saved.";
    const status=/expired|token|authentication/i.test(message)?401:400;
    return NextResponse.json({error:message},{status});
  }
}
