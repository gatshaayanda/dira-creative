import type {Metadata,Viewport} from "next";
import {headers} from "next/headers";
import {Analytics} from "@vercel/analytics/next";
import {SpeedInsights} from "@vercel/speed-insights/next";
import PwaRegister from "@/app/pwa-register";
import Script from "next/script";
import "./globals.css"; import "./pwa.css"; import "./install-card.css";
const EMBEDDED_BROWSER_PATTERN=/WhatsApp|Instagram|FBAN|FBAV|Messenger|Line[/]|Twitter|TikTok|Snapchat/i;
export const metadata:Metadata={
 title:{default:"Dira Creative | Business OS",template:"%s | Dira Creative"},
 description:"Dira Creative helps businesses build clear brands, effective communication and stronger operations through design, structure and strategy.",
 applicationName:"Dira Creative",
 keywords:["Dira Creative","Brand development","Business development","Brand identity","Business systems","Botswana"],
 openGraph:{type:"website",siteName:"Dira Creative",title:"Dira Creative | Business OS",description:"Building brands that communicate clearly, operate efficiently, and scale effectively."},
 twitter:{card:"summary",title:"Dira Creative | Business OS",description:"Building brands that communicate clearly, operate efficiently, and scale effectively."},
 icons:{icon:[{url:"/dira-icon.svg",type:"image/svg+xml"}],apple:{url:"/dira-icon.svg"}},
 manifest:"/manifest.webmanifest",
 appleWebApp:{capable:true,title:"Dira Creative",statusBarStyle:"default"}
};
export const viewport:Viewport={themeColor:"#0097b2",colorScheme:"light"};
export default async function RootLayout({children}:{children:React.ReactNode}){
 const requestHeaders=await headers();
 const userAgent=requestHeaders.get("user-agent")||"";
 const requestedWith=requestHeaders.get("x-requested-with")||"";
 // A social referrer does not prove this browser is embedded: Chrome opened from WhatsApp
 // must not be trapped in the in-app-browser install gate.
 const embedded=EMBEDDED_BROWSER_PATTERN.test(userAgent)
   || (/Android/i.test(userAgent)&&/\bwv\b/i.test(userAgent))
   || /^(com\.whatsapp|com\.instagram\.android|com\.facebook\.katana|com\.facebook\.lite|com\.facebook\.orca)$/i.test(requestedWith);
 const android=/Android/i.test(userAgent);
 return <html lang="en"><body style={embedded?{overflow:"hidden"}:undefined}><Script id="iteration13-early-install-capture" strategy="beforeInteractive">{`
(function () {
  window.addEventListener("beforeinstallprompt", function (event) {
    var standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (standalone || window.__iteration13PwaListenerReady === true) return;
    event.preventDefault();
    window.__iteration13InstallPrompt = event;
  });
})();
`}</Script><PwaRegister initialEmbedded={embedded} initialAndroid={android}/>{children}<Analytics/><SpeedInsights/></body></html>
}
