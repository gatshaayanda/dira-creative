import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
export const runtime="nodejs";
function app(){const raw=process.env.FIREBASE_ADMIN_KEY;if(!raw)throw new Error("Dira Creative notifications are not configured yet.");if(getApps().length)return getApps()[0];let account:Record<string,unknown>;try{account=JSON.parse(raw) as Record<string,unknown>}catch{throw new Error("Dira Creative notification credentials are invalid.")}return initializeApp({credential:cert(account as Parameters<typeof cert>[0])})}
export async function POST(request:Request){
 try{
  const a=app(),match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);if(!match)throw new Error("Missing client authentication token.");
  const uid=(await getAuth(a).verifyIdToken(match[1])).uid,body=await request.json() as {enquiryId?:unknown};if(typeof body.enquiryId!=="string"||!body.enquiryId)throw new Error("Missing enquiry reference.");
  const db=getFirestore(a),snap=await db.collection("clientEnquiries").doc(body.enquiryId).get();if(!snap.exists)throw new Error("Client enquiry not found.");
  const data=snap.data()??{};if(String(data.customerId??"")!==uid)return NextResponse.json({sent:0,error:"This enquiry does not belong to the signed-in client."},{status:403});
  const admins=await db.collection("admins").get(),messaging=getMessaging(a),baseUrl=process.env.NEXT_PUBLIC_BASE_URL||"",link="/admin";let sent=0;
  for(const admin of admins.docs){if(!["owner","staff"].includes(String(admin.data()?.role||"").toLowerCase()))continue;const pref=(await db.collection("notificationPreferences").doc(admin.id).get()).data();if(!pref?.enabled)continue;const tokens=await db.collection("notificationTokens").doc(admin.id).collection("tokens").get();for(const token of tokens.docs){const value=String(token.data().token??"");if(!value)continue;try{await messaging.send({token:value,notification:{title:"New Dira Creative enquiry",body:String(data.customerName??"Client")+" · "+String(data.serviceName??"Project")},data:{link,enquiryId:body.enquiryId},webpush:{...(baseUrl?{fcmOptions:{link:baseUrl+link}}:{}),notification:{tag:"dira-new-enquiry-"+body.enquiryId,icon:"/dira-icon.svg",badge:"/dira-icon.svg"}}});sent++}catch{}}}
  return NextResponse.json({sent});
 }catch(error){console.error("[Dira Creative] new enquiry notification failed:",error);return NextResponse.json({sent:0,error:error instanceof Error?error.message:"New enquiry notification unavailable."},{status:400})}
}
