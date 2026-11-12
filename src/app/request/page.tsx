import {redirect} from "next/navigation";
import RequestForm from "./request-form";

export const metadata={title:"Project enquiry",description:"Start a project enquiry with Dira Creative."};

export default function RequestPage(){
 const configured=Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY&&process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN&&process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID&&process.env.NEXT_PUBLIC_FIREBASE_APP_ID&&process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
 if(!configured)redirect("/#service-order");
 return <RequestForm/>;
}
