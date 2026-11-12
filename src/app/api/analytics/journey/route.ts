import {NextResponse} from "next/server";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getDiraAdminApp} from "@/lib/firebase/admin";

export const runtime="nodejs";
const allowed=new Set(["public_visit","catalogue_view","service_selected","request_flow_opened","request_submitted","notification_enabled"]);

export async function POST(request:Request){
  try{
    const match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);
    if(!match)return NextResponse.json({ok:false},{status:401});
    const app=getDiraAdminApp();
    const decoded=await getAuth(app).verifyIdToken(match[1]);
    const db=getFirestore(app);
    if((await db.collection("admins").doc(decoded.uid).get()).exists)return NextResponse.json({ok:true,ignored:true});
    const body=await request.json() as {event?:unknown;details?:Record<string,unknown>};
    if(typeof body.event!=="string"||!allowed.has(body.event))return NextResponse.json({ok:false},{status:400});
    const input=body.details??{};
    const details:Record<string,string>={};
    if(typeof input.itemId==="string")details.itemId=input.itemId.slice(0,100);
    if(typeof input.itemName==="string")details.itemName=input.itemName.slice(0,120);
    if(input.kind==="service"||input.kind==="package")details.kind=input.kind;
    const createdAt=new Date().toISOString();
    const record={customerId:decoded.uid,event:body.event,details,createdAt};
    const payloadBytes=Buffer.byteLength(JSON.stringify(record),"utf8");
    await db.collection("customerJourneyEvents").add({...record,payloadBytes});
    return NextResponse.json({ok:true});
  }catch(error){
    console.error("[Dira Creative] journey analytics write failed:",error);
    return NextResponse.json({ok:false,error:error instanceof Error?error.message:"Analytics unavailable"},{status:503});
  }
}
