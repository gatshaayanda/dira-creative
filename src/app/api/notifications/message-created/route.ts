import {NextResponse} from "next/server";
import {getDiraAdminApp} from "@/lib/firebase/admin";
import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {getMessaging} from "firebase-admin/messaging";
export const runtime="nodejs";
function app(){return getDiraAdminApp();}
export async function POST(request:Request){
 try{
  const a=app(),match=(request.headers.get("authorization")||"").match(/^Bearer\s+(.+)$/i);if(!match)throw new Error("Missing authentication token.");
  const uid=(await getAuth(a).verifyIdToken(match[1])).uid,body=await request.json() as {conversationId?:unknown;messageId?:unknown};
  if(typeof body.conversationId!=="string"||typeof body.messageId!=="string")throw new Error("Missing conversation message identifiers.");
  const db=getFirestore(a),conversationRef=db.collection("conversations").doc(body.conversationId),conversation=await conversationRef.get(),message=await conversationRef.collection("messages").doc(body.messageId).get();
  if(!conversation.exists||!message.exists)throw new Error("Conversation message not found.");
  const data=conversation.data()??{},msg=message.data()??{},senderRole=String(msg.senderRole??"");
  if(String(msg.senderId??"")!==uid)throw new Error("Message does not belong to this sender.");
  const adminDoc=await db.collection("admins").doc(uid).get(),isAdmin=adminDoc.exists&&["owner","staff"].includes(String(adminDoc.data()?.role??"").toLowerCase());
  if(senderRole==="admin"&&!isAdmin)return NextResponse.json({sent:0,error:"Only authorised Dira Creative staff can send owner replies."},{status:403});
  if(senderRole==="customer"&&(isAdmin||String(data.customerId??"")!==uid))return NextResponse.json({sent:0,error:"This client conversation does not belong to the signed-in account."},{status:403});
  if(!["admin","customer"].includes(senderRole))throw new Error("Invalid conversation sender role.");
  const recipientIds:string[]=[];
  if(senderRole==="customer"){
   const admins=await db.collection("admins").get();
   for(const admin of admins.docs){if(!["owner","staff"].includes(String(admin.data()?.role??"").toLowerCase()))continue;const pref=(await db.collection("notificationPreferences").doc(admin.id).get()).data();if(pref?.enabled)recipientIds.push(admin.id)}
  }else{
   const customerId=String(data.customerId??"");
   if(customerId){const pref=(await db.collection("notificationPreferences").doc(customerId).get()).data();if(pref?.enabled)recipientIds.push(customerId)}
  }
  const messaging=getMessaging(a),baseUrl=process.env.NEXT_PUBLIC_BASE_URL||"",link=senderRole==="customer"?"/admin":"/account";let sent=0;
  const preview=String(msg.text??"Attachment sent").slice(0,120),title=senderRole==="customer"?String(data.customerName??"Client")+" sent a message":"Dira Creative replied";
  for(const recipient of recipientIds){
   const tokens=await db.collection("notificationTokens").doc(recipient).collection("tokens").get();
   for(const token of tokens.docs){const value=String(token.data().token??"");if(!value)continue;try{await messaging.send({token:value,notification:{title,body:preview},data:{link,conversationId:body.conversationId,messageId:body.messageId},webpush:{...(baseUrl?{fcmOptions:{link:baseUrl+link}}:{}),notification:{tag:"dira-conversation-"+body.conversationId,icon:"/diralogo.jpeg",badge:"/diralogo.jpeg"}}});sent++}catch(error){const code=(error as {code?:string})?.code;if(code==="messaging/registration-token-not-registered"||code==="messaging/invalid-registration-token")await token.ref.delete().catch(()=>{})}}
  }
  return NextResponse.json({sent});
 }catch(error){console.error("[Dira Creative] conversation notification failed:",error);return NextResponse.json({sent:0,error:error instanceof Error?error.message:"Conversation notification unavailable."},{status:400})}
}
