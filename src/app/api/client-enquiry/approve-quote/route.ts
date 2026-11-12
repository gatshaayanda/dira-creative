import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";

export const runtime="nodejs";

function adminApp(){
  if(getApps().length)return getApps()[0];
  const raw=process.env.FIREBASE_ADMIN_KEY;
  if(!raw)throw new Error("Quote approval is not available until Dira Creative's database is configured.");
  let serviceAccount:Record<string,unknown>;
  try{serviceAccount=JSON.parse(raw) as Record<string,unknown>}
  catch{throw new Error("Dira Creative's Firebase credentials are invalid.");}
  return initializeApp({credential:cert(serviceAccount as Parameters<typeof cert>[0])});
}

export async function POST(request:Request){
  try{
    const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);
    if(!match)return NextResponse.json({error:"Please restore your client session and try again."},{status:401});
    const app=adminApp(),token=await getAuth(app).verifyIdToken(match[1]);
    const body=await request.json() as {enquiryId?:unknown};
    if(typeof body.enquiryId!=="string"||!body.enquiryId.trim())return NextResponse.json({error:"Missing enquiry reference."},{status:400});
    const db=getFirestore(app),ref=db.collection("clientEnquiries").doc(body.enquiryId),now=new Date().toISOString();
    const result=await db.runTransaction(async tx=>{
      const snap=await tx.get(ref);
      if(!snap.exists)throw new Error("This client enquiry could not be found.");
      const data=snap.data()??{};
      if(data.customerId!==token.uid)return {status:403 as const,error:"This enquiry does not belong to the signed-in account."};
      if(typeof data.quotedPrice!=="number"||!Number.isFinite(data.quotedPrice)||data.quotedPrice<=0)return {status:409 as const,error:"Dira Creative has not sent a final quote yet."};
      if(!["Quote Ready","Awaiting Approval"].includes(String(data.status)))return {status:409 as const,error:"This quote is not awaiting approval. Refresh My enquiries to see the latest status."};
      if(data.clientApprovedAt&&data.clientApprovedPrice===data.quotedPrice)return {status:200 as const,approvedAt:String(data.clientApprovedAt),alreadyApproved:true};
      const initialRequired=typeof data.initialPaymentRequired==="number"&&data.initialPaymentRequired>0?data.initialPaymentRequired:0;
      const nextStatus=initialRequired>0?"Awaiting Initial Payment":"In Progress";
      tx.update(ref,{clientApprovedAt:now,clientApprovedPrice:data.quotedPrice,clientApprovalSource:"dira-client-portal",clientApprovalUid:token.uid,status:nextStatus,updatedAt:now});
      return {status:200 as const,approvedAt:now,alreadyApproved:false};
    });
    if(result.status!==200)return NextResponse.json({error:result.error},{status:result.status});
    return NextResponse.json({approved:true,approvedAt:result.approvedAt,alreadyApproved:result.alreadyApproved});
  }catch(error){
    console.error("[Dira Creative] quote approval failed:",error);
    return NextResponse.json({error:error instanceof Error?error.message:"We could not record your approval. Please try again."},{status:400});
  }
}
