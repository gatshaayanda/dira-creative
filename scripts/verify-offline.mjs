import fs from "node:fs";

const read = path => fs.readFileSync(new URL(path, import.meta.url), "utf8");
const sw = read("../public/sw.js");
const page = read("../src/app/page.tsx");
const account = read("../src/app/AccountWorkspace.tsx");
const offline = read("../src/app/offline/page.tsx");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(/const CACHE_VERSION = "dira-creative-shell-v\d+"/.test(sw), "versioned Dira Creative app-shell cache is missing");
check(/const MEDIA_CACHE = "dira-creative-media-v\d+"/.test(sw), "versioned Dira Creative media cache is missing");
check(sw.includes('"/", "/offline"'), "home and offline fallback must be precached");
check(sw.includes('event.respondWith(cacheMediaRequest(request, event))'), "approved image/video requests must use the offline media cache");
check(sw.includes('event.data?.type === "CACHE_MEDIA"'), "service worker must accept the page's current media list");
check(sw.includes('"images.unsplash.com"') && sw.includes('"utfs.io"') && sw.includes('"ufs.sh"'), "media cache must be restricted to the supported image/upload hosts");
check(sw.includes("const MEDIA_LIMIT = 40"), "media cache must have a bounded entry limit");
check(sw.includes('if (cached) return cached') && sw.includes('return Response.error()'), "media and navigation fetches must retain an offline fallback");
check(page.includes('type: "CACHE_MEDIA"') && page.includes("data.services.map") && page.includes("data.announcementImage"), "Store service and announcement media must be prepared for offline use");
check(page.includes('window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))'), "customer/admin demo changes must be synchronously saved before success feedback");
check(account.includes("if (!online || !navigator.onLine)") && account.includes("Upload"), "offline account messaging must stay available while uploads are blocked");
check(offline.includes("not queued for server delivery") && offline.includes("let its images and videos finish loading"), "offline guidance must explain preparation and non-sync boundaries");

if (failures.length) {
  console.error("OFFLINE VERIFICATION FAILED");
  failures.forEach(failure => console.error(" - " + failure));
  process.exit(1);
}
console.log("OFFLINE VERIFIED — versioned app shell, bounded approved media cache, local customer/admin writes, and honest upload/sync boundaries.");
