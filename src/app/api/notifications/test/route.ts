import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getMessaging} from "firebase-admin/messaging";
export const runtime="nodejs";
function app(){const raw=process.env.FIREBASE_ADMIN_KEY;if(!raw)throw new Error("Dira Creative notifications are not configured yet.");const existing=getApps()[0];if(existing)return existing;let serviceAccount:Record<string,unknown>;try{serviceAccount=JSON.parse(raw) as Record<string,unknown>}catch{throw new Error("Dira Creative notification credentials are not valid JSON yet.")}return initializeApp({credential:cert(serviceAccount as Parameters<typeof cert>[0])})}
export async function POST(request:Request){
 try{
  const header=request.headers.get("authorization")||"";const match=header.match(/^Bearer\s+(.+)$/i);if(!match)throw new Error("Missing Firebase authentication token.");
  const decoded=await getAuth(app()).verifyIdToken(match[1]);const body=await request.json().catch(()=>({})) as {deviceToken?:unknown};if(typeof body.deviceToken!=="string"||!body.deviceToken)throw new Error("This device is not registered for Dira Creative notifications yet.");
  const messaging=getMessaging(app());const title="Dira Creative notifications are on";const result=await messaging.send({token:body.deviceToken,notification:{title,body:"This device is ready for Dira Creative project updates."},data:{title,body:"This device is ready for Dira Creative project updates.",link:"/account",test:"true"},webpush:{...(process.env.NEXT_PUBLIC_BASE_URL?{fcmOptions:{link:process.env.NEXT_PUBLIC_BASE_URL+"/account"}}:{}),notification:{tag:"dira-test",icon:"/dira-icon.svg",badge:"/dira-icon.svg"}}});
  void decoded;return NextResponse.json({sent:Boolean(result)});
 }catch(error){console.error("Dira Creative test notification failed:",error);return NextResponse.json({sent:false,error:error instanceof Error?error.message:"Dira Creative could not send the test notification."},{status:400})}
}
