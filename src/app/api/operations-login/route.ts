import {createHash,timingSafeEqual} from "node:crypto";
import {getDiraAdminApp} from "@/lib/firebase/admin";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {NextResponse} from "next/server";

export const runtime="nodejs";

function getAdminApp(){ return getDiraAdminApp(); }
function matchesWord(input:string,expected:string){
 const a=createHash("sha256").update(input).digest();
 const b=createHash("sha256").update(expected).digest();
 return timingSafeEqual(a,b)&&input.length>0;
}
export async function POST(request:Request){
 try{
  const expected=process.env.DIRA_OPERATIONS_WORD;
  if(!expected)return NextResponse.json({error:"Operations access is not configured yet. Set DIRA_OPERATIONS_WORD in Vercel."},{status:503});
  const body=await request.json().catch(()=>null) as {word?:unknown}|null;
  const word=typeof body?.word==="string"?body.word:"";
  if(!matchesWord(word,expected))return NextResponse.json({error:"Access denied. Check the access word and try again."},{status:401});
  const app=getAdminApp();
  const uid="dira-creative-temporary-operations";
  await getFirestore(app).collection("admins").doc(uid).set({role:"owner",temporaryAccess:true,createdAt:new Date().toISOString()},{merge:true});
  const token=await getAuth(app).createCustomToken(uid);
  return NextResponse.json({token},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("Operations login failed:",error instanceof Error?error.message:"unknown error");
  return NextResponse.json({error:"Operations sign-in is temporarily unavailable. Check the server configuration."},{status:500});
 }
}
