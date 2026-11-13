import fs from "node:fs";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const sw = read("../public/sw.js");
const page = read("../src/app/page.tsx");
const account = read("../src/app/AccountWorkspace.tsx");
const offline = read("../src/app/offline/page.tsx");
const pwaRegister = read("../src/app/pwa-register.tsx");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(/const CACHE_VERSION = "dira-creative-shell-v\d+"/.test(sw), "versioned Dira Creative app-shell cache is missing");
check(/const MEDIA_CACHE = "dira-creative-media-v\d+"/.test(sw), "versioned Dira Creative media cache is missing");

const shellCacheVersion = Number(sw.match(/const CACHE_VERSION = "dira-creative-shell-v(\d+)"/)?.[1] || 0);
check(shellCacheVersion >= 2, "current hardened shell cache version is missing");
check(sw.includes("account|request|requests|orders|admin|invite"), "customer account, enquiry and owner routes must use the private network-only path");
check(sw.includes("fetchWithTimeout(request, 7000)") && sw.includes("controller.abort()"), "public navigation must fall back after a bounded network wait");
check(sw.includes('key.startsWith("dira-creative-shell-")') && sw.includes('key.startsWith("dira-creative-media-")'), "activation must clean superseded Dira cache versions");
const appShell = sw.match(/const APP_SHELL = \[(.*?)\];/s)?.[1] || "";
check((appShell.match(/"\/dira-icon\.svg"/g) || []).length === 1, "app shell should not repeat the Dira icon URL");
check(sw.includes('"/", "/offline"'), "home and offline fallback must be precached");
check(sw.includes('event.respondWith(cacheMediaRequest(request, event))'), "approved image/video requests must use the offline media cache");
check(sw.includes('event.data?.type === "CACHE_MEDIA"'), "service worker must accept the page's current media list");
check(sw.includes('"images.unsplash.com"') && sw.includes('"utfs.io"') && sw.includes('"ufs.sh"'), "media cache must be restricted to the supported image/upload hosts");
check(sw.includes("const MEDIA_LIMIT = 40"), "media cache must have a bounded entry limit");
check(sw.includes('if (cached) return cached') && sw.includes('return Response.error()'), "media and navigation fetches must retain an offline fallback");
check(page.includes('type: "CACHE_MEDIA"') && page.includes("catalogue.map") && page.includes("item.imageUrl"), "published catalogue media must be prepared for offline use");
check(account.includes('window.localStorage.setItem("dira-creative:account-extras:v1"') && account.includes("onUpdateOrder"), "optional account extras must persist locally while order updates use the supplied workspace handler");
check(account.includes("if (!online || !navigator.onLine)") && account.includes("Upload"), "offline account messaging must stay available while uploads are blocked");
check(offline.includes("not queued for later delivery") && offline.includes("let its images and videos finish loading"), "offline guidance must explain preparation and non-sync boundaries");

check(offline.includes("production enquiries, customer accounts") && offline.includes("owner/admin actions"), "offline guidance must distinguish live server journeys from local preview data");
check(pwaRegister.includes("Cached public preview is available") && pwaRegister.includes("customer accounts and owner actions need a connection"), "offline banner must not imply production records are saved locally");

if (failures.length) {
  console.error("OFFLINE VERIFICATION FAILED");
  failures.forEach(failure => console.error(" - " + failure));
  process.exit(1);
}
console.log("OFFLINE VERIFIED — versioned app shell, bounded approved catalogue media cache, private-route boundaries, and honest upload/sync guidance.");
