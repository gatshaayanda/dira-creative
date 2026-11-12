import {NextResponse} from "next/server";
import {cert,getApps,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
export const runtime="nodejs";
function app(){const raw=process.env.FIREBASE_ADMIN_KEY;if(!raw)throw new Error("Dira Creative notifications are not configured yet.");if(getApps().length)return getApps()[0];let account:Record<string,unknown>;try{account=JSON.parse(raw) as Record<string,unknown>}catch{throw new Error("Dira Creative notification credentials are invalid.")}return initializeApp({credential:cert(account as Parameters<typeof cert>[0])})}
export async function POST(request:Request){
 try{
  const a=app(),match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);if(!match)throw new Error("Missing Firebase authentication token.");
  const uid=(await getAuth(a).verifyIdToken(match[1])).uid,db=getFirestore(a);
  const adminDoc=await db.collection("admins").doc(uid).get();
  if(!adminDoc.exists||!["owner","staff"].includes(String(adminDoc.data()?.role||"").toLowerCase()))return NextResponse.json({sent:0,error:"Only authorised Dira Creative staff can send client updates."},{status:403});
  const body=await request.json() as {enquiryId?:unknown};if(typeof body.enquiryId!=="string"||!body.enquiryId)throw new Error("Missing client enquiry reference.");
  const snap=await db.collection("clientEnquiries").doc(body.enquiryId).get();if(!snap.exists)throw new Error("Client enquiry not found.");
  const data=snap.data()??{},customerId=String(data.customerId??"");if(!customerId)throw new Error("Client enquiry has no customer account.");
  const pref=(await db.collection("notificationPreferences").doc(customerId).get()).data();if(!pref?.enabled)return NextResponse.json({sent:0,reason:"customer-notifications-disabled"});
  const tokens=await db.collection("notificationTokens").doc(customerId).collection("tokens").get();if(tokens.empty)return NextResponse.json({sent:0,reason:"customer-device-not-registered"});
  const messaging=getMessaging(a),title="Dira Creative project update",bodyText=String(data.status??"Your project enquiry has been updated.")+(typeof data.quotedPrice==="number"?" · Quote "+Number(data.quotedPrice).toFixed(2)+" BWP":"");
  const baseUrl=process.env.NEXT_PUBLIC_BASE_URL||"",link="/account#enquiries";let sent=0;const failures:string[]=[];
  for(const tokenDoc of tokens.docs){const token=String(tokenDoc.data().token??"");if(!token)continue;try{await messaging.send({token,notification:{title,body:bodyText},data:{title,body:bodyText,link,enquiryId:body.enquiryId},webpush:{...(baseUrl?{fcmOptions:{link:baseUrl+link}}:{}),notification:{tag:"dira-enquiry-"+body.enquiryId,icon:"/dira-icon.svg",badge:"/dira-icon.svg"}}});sent++}catch(error){const code=(error as {code?:string})?.code||"unknown";failures.push(code);if(code==="messaging/registration-token-not-registered"||code==="messaging/invalid-registration-token")await tokenDoc.ref.delete().catch(()=>{})}}
  return NextResponse.json({sent,failures});
 }catch(error){console.error("[Dira Creative] enquiry update notification failed:",error);return NextResponse.json({sent:0,error:error instanceof Error?error.message:"Client update notification failed."},{status:400})}
}
