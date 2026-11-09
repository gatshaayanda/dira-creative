"use client";

import Link from "next/link";
import ServiceGuide from "@/app/ServiceGuide";
import ServiceMediaPicker from "@/app/ServiceMediaPicker";
import AccountWorkspace, { type AccountMessage } from "@/app/AccountWorkspace";
import { useEffect, useMemo, useState } from "react";

type Service = { id: string; name: string; price: number; description: string; media: string; mediaType: "image" | "video"; active: boolean };
type DemoOrder = { id: string; serviceId: string; serviceName: string; price: number; dueDate: string; customerName: string; email: string; brief: string; status: string; createdAt: string; messages?: AccountMessage[]; paymentStatus?: "Unpaid" | "Paid (demo)"; paidAmount?: number; paidAt?: string; receiptNo?: string; isTest?: boolean; completedAt?: string };
type DemoEvent = { id: string; kind: "visit" | "request" | "completed" | "payment"; label: string; at: string; test?: boolean };
type DemoData = { services: Service[]; orders: DemoOrder[]; announcement: string; views: number; events?: DemoEvent[]; receiptProfile?: { legalName: string; registration: string; address: string; phone: string; footer: string } };
const STORAGE_KEY = "iteration13:service-demo:v1";
const seedServices: Service[] = [
  { id: "website", name: "Website", price: 100, description: "A clear, professional home for your business, services and contact details.", media: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80", mediaType: "image", active: true },
  { id: "app", name: "App", price: 200, description: "A mobile-first app experience built around the way your customers work.", media: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80", mediaType: "image", active: true },
  { id: "support", name: "Monthly support", price: 50, description: "Ongoing updates, small improvements and practical help after launch.", media: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80", mediaType: "image", active: true },
  { id: "phaser", name: "Phaser games", price: 500, description: "A custom browser game concept built for play, learning or promotion.", media: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80", mediaType: "image", active: true },
];
const emptyData: DemoData = { services: seedServices, orders: [], announcement: "", views: 0, events: [], receiptProfile: { legalName: "Your Business", registration: "", address: "", phone: "", footer: "Thank you for your business." } };
const money = (amount: number) => "P" + amount.toLocaleString("en-BW", { maximumFractionDigits: 2 });
const localDate = () => { const now = new Date(); return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-"); };

export default function Home() {
  const [data, setData] = useState<DemoData>(emptyData);
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(true);
  const [view, setView] = useState<"shop" | "account" | "login" | "admin">("shop");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassphrase, setAdminPassphrase] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [brief, setBrief] = useState("");
  const [notice, setNotice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("100");
  const [serviceDescription, setServiceDescription] = useState("");
  const [serviceMedia, setServiceMedia] = useState("");
  const [serviceMediaType, setServiceMediaType] = useState<"image" | "video">("image");
  const [serviceMediaUploading, setServiceMediaUploading] = useState(false);
  const [serviceActive, setServiceActive] = useState(true);
  const [announcementDraft, setAnnouncementDraft] = useState("");
  const [adminReplyDrafts, setAdminReplyDrafts] = useState<Record<string, string>>({});
  const [pendingConfirm, setPendingConfirm] = useState<{ kind: "delete-service" | "reset-demo"; serviceId?: string; serviceName?: string } | null>(null);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [notesReady, setNotesReady] = useState(false);
  const [themeColor, setThemeColor] = useState("#4f8cff");
  const [themeReady, setThemeReady] = useState(false);
  const [businessName, setBusinessName] = useState("Your Business");
  const [businessNameReady, setBusinessNameReady] = useState(false);

  useEffect(() => {
    try {
      const savedName = window.localStorage.getItem("iteration13:business-name:v1");
      if (savedName) setBusinessName(savedName.slice(0, 48));
    } catch { /* use the demo business name */ }
    setBusinessNameReady(true);
  }, []);

  useEffect(() => {
    if (!businessNameReady) return;
    try { window.localStorage.setItem("iteration13:business-name:v1", businessName.trim().slice(0, 48) || "Your Business"); }
    catch { setNotice("Business name could not be saved on this device."); }
  }, [businessName, businessNameReady]);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("iteration13:store-theme:v1");
      if (savedTheme && /^#[0-9a-f]{6}$/i.test(savedTheme)) setThemeColor(savedTheme);
    } catch { /* theme remains at the accessible default */ }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--studio-accent", themeColor);
    if (!themeReady) return;
    try { window.localStorage.setItem("iteration13:store-theme:v1", themeColor); }
    catch { setNotice("Theme could not be saved on this device."); }
  }, [themeColor, themeReady]);

  useEffect(() => {
    try { setOwnerNotes(window.localStorage.getItem("iteration13:owner-notes:v1") || ""); }
    catch { setNotice("My Notes could not be loaded from this browser."); }
    setNotesReady(true);
  }, []);

  useEffect(() => {
    if (!notesReady) return;
    try { window.localStorage.setItem("iteration13:owner-notes:v1", ownerNotes); }
    catch { setNotice("My Notes could not be saved on this device."); }
  }, [ownerNotes, notesReady]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DemoData>;
        setData({ ...emptyData, ...parsed, services: Array.isArray(parsed.services) ? parsed.services : seedServices, orders: Array.isArray(parsed.orders) ? parsed.orders : [], announcement: typeof parsed.announcement === "string" ? parsed.announcement : "", views: (Number(parsed.views) || 0) + 1, events: [...(Array.isArray(parsed.events) ? parsed.events : []), { id: "EV-"+Date.now().toString(36), kind: "visit", label: "Store visited", at: new Date().toISOString() }], receiptProfile: { ...emptyData.receiptProfile!, ...(parsed.receiptProfile || {}) } });
        setAnnouncementDraft(typeof parsed.announcement === "string" ? parsed.announcement : "");
      } else setData(current => ({ ...current, views: 1, events: [{ id: "EV-"+Date.now().toString(36), kind: "visit", label: "Store visited", at: new Date().toISOString() }] }));
    } catch { setNotice("Local demo storage is unavailable in this browser. You can explore, but changes may not persist."); }
    setReady(true);
    setOnline(navigator.onLine);
    const syncOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "account") setView("account");
    if (window.location.hash === "#admin" || window.location.hash === "#login") setView("login");
    return () => { window.removeEventListener("online", syncOnline); window.removeEventListener("offline", syncOnline); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { setNotice("The browser could not save this change locally. Check available storage."); }
  }, [data, ready]);

  useEffect(() => {
    if (!notice) return;
    const duration = /^(Choose|Add |Enter |The browser|Local demo storage|Could not save)/i.test(notice) ? 6500 : 4200;
    const timeout = window.setTimeout(() => setNotice(current => current === notice ? "" : current), duration);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!pendingConfirm) return;
    const keepDialogAccessible = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setPendingConfirm(null); return; }
      if (event.key !== "Tab") return;
      const dialog = document.querySelector(".sd-confirm-dialog");
      const focusable = dialog?.querySelectorAll<HTMLElement>("button:not([disabled]),a[href],input,select,textarea");
      if (!focusable?.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", keepDialogAccessible);
    return () => window.removeEventListener("keydown", keepDialogAccessible);
  }, [pendingConfirm]);

  useEffect(() => {
    if (!ready) return;
    if (view === "account") window.history.replaceState({}, "", "/?view=account");
    else if (view === "shop") window.history.replaceState({}, "", "/");
    else if (view === "login") window.history.replaceState({}, "", "/#login");
    else window.history.replaceState({}, "", "/#admin");
  }, [view, ready]);

  function commitData(update: (current: DemoData) => DemoData, successMessage: string) {
    const next = update(data);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setNotice("Could not save that change on this device. Check browser storage and try again.");
      return false;
    }
    setData(next);
    setNotice(successMessage);
    return true;
  }

  function toggleService(service: Service) {
    return commitData(current => ({ ...current, services: current.services.map(item => item.id === service.id ? { ...item, active: !item.active } : item) }), `${service.name} ${service.active ? "hidden" : "visible"} in the demo.`);
  }

  const activeServices = data.services.filter(service => service.active);
  const paidTotal = data.orders.reduce((sum, order) => sum + (order.paidAmount || 0), 0);
  const completedUnpaid = data.orders.filter(order => order.status === "Completed" && order.paymentStatus !== "Paid (demo)").reduce((sum, order) => sum + order.price, 0);
  const activePipeline = data.orders.filter(order => ["Accepted", "In progress"].includes(order.status)).reduce((sum, order) => sum + order.price, 0);
  const customerRecords = Array.from(new Map(data.orders.map(order => [order.email.toLowerCase(), { name: order.customerName, email: order.email, jobs: data.orders.filter(item => item.email.toLowerCase() === order.email.toLowerCase()) }])).values());
  const selectedService = data.services.find(service => service.id === selected && service.active);
  const statusCounts = useMemo(() => data.orders.reduce<Record<string, number>>((acc, order) => { acc[order.status] = (acc[order.status] || 0) + 1; return acc; }, {}), [data.orders]);

  function beginOrder(service: Service) {
    setSelected(service.id); setView("shop"); setNotice(`${service.name} selected. Add your details and requested date below.`); setDueDate(""); setBrief("");
    window.setTimeout(() => document.getElementById("service-order")?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);
  }

  function requestAdminLogin() {
    if (adminUnlocked) { setView("admin"); return; }
    setAdminPassphrase("");
    setView("login");
    setNotice("Enter the demo access word to open the owner workspace.");
  }
  function submitAdminLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (adminPassphrase.trim().toLowerCase() !== "admin") {
      setNotice("That word is not correct. Enter admin for this demo.");
      return;
    }
    setAdminUnlocked(true);
    setAdminPassphrase("");
    setView("admin");
    setNotice("Demo admin unlocked. This is not production authentication.");
  }
  function openAdminGuide(target?: "services" | "announcement" | "requests") {
    if (!adminUnlocked) { requestAdminLogin(); return; }
    setView("admin");
    const targetId = target === "services" ? "admin-service-tools" : target === "announcement" ? "admin-announcement-tools" : target === "requests" ? "admin-requests-tools" : "admin-tools";
    window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }
  function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedService) { setNotice("Choose a service first."); return; }
    if (!customerName.trim() || !email.trim() || !dueDate) { setNotice("Add your name, email and requested timeline date."); return; }
    if (dueDate < localDate()) { setNotice("Choose today or a future date for your requested timeline."); return; }
    const order: DemoOrder = { id: "DEMO-" + Date.now().toString(36).toUpperCase(), serviceId: selectedService.id, serviceName: selectedService.name, price: selectedService.price, dueDate, customerName: customerName.trim(), email: email.trim(), brief: brief.trim(), status: "New request", createdAt: new Date().toISOString(), paymentStatus: "Unpaid" };
    if (!commitData(current => ({ ...current, orders: [order, ...current.orders], events: [{ id: "EV-"+Date.now().toString(36), kind: "request", label: "Customer request received · "+order.serviceName, at: new Date().toISOString() }, ...(current.events || [])] }), "Order request saved on this device. No payment was taken.")) return;
    setView("account"); setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function startEdit(service: Service) {
    setEditingId(service.id); setServiceName(service.name); setServicePrice(String(service.price)); setServiceDescription(service.description); setServiceMedia(service.media); setServiceMediaType(service.mediaType); setServiceActive(service.active);
    document.getElementById("admin-service-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function saveService(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const price = Number(servicePrice);
    if (!serviceName.trim() || !Number.isFinite(price) || price < 0) { setNotice("Enter a service name and a valid price."); return; }
    if (serviceMediaUploading) { setNotice("Wait for the media upload to finish before saving the service."); return; }
    if (serviceMedia.trim()) { try { const parsedMedia = new URL(serviceMedia.trim()); if (parsedMedia.protocol !== "https:" && parsedMedia.protocol !== "http:") throw new Error("Unsupported protocol"); } catch { setNotice("Enter a valid http:// or https:// media URL, or upload the file first."); return; } }
    const service: Service = { id: editingId || "service-" + Date.now().toString(36), name: serviceName.trim(), price, description: serviceDescription.trim(), media: serviceMedia.trim(), mediaType: serviceMediaType, active: serviceActive };
    if (!commitData(current => ({ ...current, services: editingId ? current.services.map(item => item.id === editingId ? service : item) : [...current.services, service] }), editingId ? "Service updated and saved on this device." : "Service added and saved on this device.")) return;
    resetServiceForm();
  }
  function resetServiceForm() { setEditingId(null); setServiceName(""); setServicePrice("100"); setServiceDescription(""); setServiceMedia(""); setServiceMediaType("image"); setServiceActive(true); }
  function updateOrder(id: string, status: string) {
    const order = data.orders.find(item => item.id === id); const now = new Date().toISOString();
    commitData(current => ({ ...current, orders: current.orders.map(item => item.id === id ? { ...item, status, ...(status === "Completed" ? { completedAt: now } : {}) } : item), events: [{ id: "EV-"+Date.now().toString(36), kind: status === "Completed" ? "completed" : "request", label: (order?.serviceName || "Job")+" moved to "+status, at: now, test: order?.isTest }, ...(current.events || [])] }), order ? `${order.serviceName} status changed to ${status}. Saved on this device.` : "Request status saved on this device.");
  }
  function recordDemoPayment(id: string) {
    const order = data.orders.find(item => item.id === id); if (!order) return;
    if (order.paymentStatus === "Paid (demo)") { setNotice("This demo payment is already recorded."); return; }
    const now = new Date().toISOString(); const receiptNo = "RCP-"+now.slice(0,10).replaceAll("-","")+"-"+id.slice(-5);
    commitData(current => ({ ...current, orders: current.orders.map(item => item.id === id ? { ...item, paymentStatus: "Paid (demo)", paidAmount: item.price, paidAt: now, receiptNo } : item), events: [{ id: "EV-"+Date.now().toString(36), kind: "payment", label: "Demo payment recorded · "+order.serviceName, at: now, test: order.isTest }, ...(current.events || [])] }), "Demo payment recorded. Receipt is available in this job record; no money moved.");
  }
  function createTestPurchase() {
    const service = data.services.find(item => item.active) || data.services[0]; if (!service) { setNotice("Add a service before creating a test purchase."); return; }
    const now = new Date().toISOString(); const id = "TEST-"+now.slice(0,10).replaceAll("-","")+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
    const order: DemoOrder = { id, serviceId: service.id, serviceName: service.name, price: service.price, dueDate: localDate(), customerName: "Demo Customer", email: "demo.customer@example.com", brief: "Simulated customer checkout to demonstrate the owner workflow.", status: "Completed", createdAt: now, completedAt: now, paymentStatus: "Paid (demo)", paidAmount: service.price, paidAt: now, receiptNo: "RCP-"+id.slice(-10), isTest: true };
    commitData(current => ({ ...current, orders: [order, ...current.orders], events: [{ id: "EV-"+Date.now().toString(36), kind: "payment", label: "Test purchase completed · "+service.name, at: now, test: true }, { id: "EV-"+Date.now().toString(36)+"-2", kind: "request", label: "Test customer request created", at: now, test: true }, ...(current.events || [])] }), "Test purchase created. It appears in customers, completed jobs and demo receipts; no payment was processed.");
  }
  function replyToOrder(id: string) {
    const text = (adminReplyDrafts[id] || "").trim();
    if (!text) { setNotice("Write a reply before sending it."); return; }
    const message: AccountMessage = { id: "MSG-" + Date.now().toString(36), from: "studio", text, createdAt: new Date().toISOString() };
    if (commitData(current => ({ ...current, orders: current.orders.map(order => order.id === id ? { ...order, messages: [...(order.messages || []), message] } : order) }), "Studio reply saved to this browser's demo thread.")) setAdminReplyDrafts(current => ({ ...current, [id]: "" }));
  }

  return <main className="serviceDemo" style={{ "--studio-accent": themeColor } as React.CSSProperties}>
    <div className="sd-topline"><div className="sd-wrap"><span>13STUDIO <i className="sd-topline-divider">/</i> BUSINESS OS DEMO</span><span className={online ? "sd-connect" : "sd-connect is-offline"}><i />{online ? "Demo ready" : "Offline · local demo"}</span></div></div>
    <header className="sd-header"><div className="sd-wrap sd-nav"><button className="sd-brand" onClick={() => { setView("shop"); setNotice(""); window.scrollTo({top:0,behavior:"smooth"}); }} aria-label="Back to services"><span className="sd-logo">{(businessName.trim() || "YB").slice(0,2).toUpperCase()}</span><span><strong>{businessName || "Your Business"}</strong><small>STORE</small></span></button><nav aria-label="Main navigation"><button onClick={() => { setView("shop"); setNotice(""); }}>Store</button><button onClick={() => { setView("account"); setNotice(""); }}>Account <span className="sd-count">{data.orders.length}</span></button><button onClick={requestAdminLogin}>Login</button></nav></div></header>

    {view === "shop" && <>
      <section className="sd-store-home"><div className="sd-wrap"><div className="sd-store-intro"><div><span className="sd-kicker">YOUR BUSINESS / STORE + BRIEFCASE</span><h1>{businessName.trim() || "Your Business"}</h1><p>One simple place for customers to explore and the owner to stay organised.</p></div><div className="sd-store-proof"><span><b>25 GB</b><small>Capacity reference</small></span><span><b>1,000+</b><small>Busy-day interactions</small></span><span><b>24/7</b><small>Store access</small></span></div></div><section className="sd-quick-theme" aria-label="Choose business colour"><strong>Store colour</strong><button type="button" className={themeColor==="#4f8cff"?"is-selected":""} aria-label="Blue" aria-pressed={themeColor==="#4f8cff"} style={{background:"#4f8cff"}} onClick={()=>setThemeColor("#4f8cff")}/><button type="button" className={themeColor==="#16866a"?"is-selected":""} aria-label="Emerald" aria-pressed={themeColor==="#16866a"} style={{background:"#16866a"}} onClick={()=>setThemeColor("#16866a")}/><button type="button" className={themeColor==="#b7791f"?"is-selected":""} aria-label="Amber" aria-pressed={themeColor==="#b7791f"} style={{background:"#b7791f"}} onClick={()=>setThemeColor("#b7791f")}/><button type="button" className={themeColor==="#c04467"?"is-selected":""} aria-label="Rose" aria-pressed={themeColor==="#c04467"} style={{background:"#c04467"}} onClick={()=>setThemeColor("#c04467")}/><label>Custom <input aria-label="Choose custom business colour" type="color" value={themeColor} onChange={event=>setThemeColor(event.target.value)}/></label><span className="sd-theme-saved">Saved on this device</span></section></div></section>
      {data.announcement.trim() && <section className="sd-announcement"><div className="sd-wrap"><span>STUDIO NOTE / SPECIAL</span><p>{data.announcement}</p></div></section>}
      <section className="sd-services sd-wrap" id="services"><div className="sd-section-head sd-compact-section-head"><div><span className="sd-kicker">STORE / SERVICES</span><h2>Choose what you need</h2></div><p>Starting prices. Choose a service to open a short request form.</p></div><div className="sd-service-grid">{activeServices.map((service,index)=><article className="sd-service-card" key={service.id}><div className={"sd-service-media sd-media-"+(index%4)} data-label={service.name}>{service.media&&service.mediaType==="video"?<video src={service.media} controls muted playsInline preload="metadata"/>:service.media?<img src={service.media} alt={service.name+" preview"} loading="lazy"/>:<div className="sd-media-placeholder"><span>13STUDIO</span><strong>{service.name}</strong></div>}<span className="sd-service-index">0{index+1}</span></div><div className="sd-service-info"><div className="sd-service-title"><h3>{service.name}</h3><strong>{money(service.price)}</strong></div><p>{service.description}</p><button className="sd-order-button" onClick={()=>beginOrder(service)}>Request <span>↗</span></button></div></article>)}</div></section>
      <section className="sd-order-section sd-compact-order" id="service-order"><div className="sd-wrap sd-order-grid"><div className="sd-order-copy"><span className="sd-kicker">NEXT STEP</span><h2>Send a request</h2><p>Choose a service, tell us your target date and send the brief. Your date is a preference until reviewed.</p><div className="sd-order-note"><span>i</span><p><strong>Demo only.</strong><br/>No payment is taken and no delivery date is confirmed.</p></div></div><form className="sd-order-form" onSubmit={submitOrder}><div className="sd-form-heading"><span>REQUEST DETAILS</span><strong>{selectedService?selectedService.name:"Choose a service"}</strong>{selectedService&&<b>{money(selectedService.price)} <small>starting price</small></b>}</div><label>Service<select value={selected||""} onChange={event=>setSelected(event.target.value||null)} required><option value="">Select a service</option>{activeServices.map(service=><option key={service.id} value={service.id}>{service.name} — {money(service.price)}</option>)}</select></label><div className="sd-form-two"><label>Your name<input value={customerName} onChange={event=>setCustomerName(event.target.value)} autoComplete="name" required placeholder="Name or business"/></label><label>Email<input value={email} onChange={event=>setEmail(event.target.value)} type="email" autoComplete="email" required placeholder="you@example.com"/></label></div><label>Target date<input type="date" value={dueDate} min={localDate()} onChange={event=>setDueDate(event.target.value)} required/><small>Your requested date is reviewed before confirmation.</small></label><label>Project details <span className="sd-optional">OPTIONAL</span><textarea value={brief} onChange={event=>setBrief(event.target.value)} rows={3} placeholder="What would you like to achieve?"/></label><button className="sd-button sd-primary sd-submit" type="submit">Send request →</button><p className="sd-privacy-note">Saved in this browser only · no payment taken</p></form></div></section>
    </>}

    {view === "account" && <AccountWorkspace businessName={businessName.trim() || "Your Business"} orders={data.orders} email={email} setEmail={setEmail} online={online} announcement={data.announcement} onBrowse={() => { setView("shop"); setNotice(""); }} onUpdateOrder={(orderId, update, message) => { commitData(current => ({ ...current, orders: current.orders.map(order => order.id === orderId ? update(order) : order) }), message); }} />}

    {view === "login" && <section className="sd-admin sd-wrap"><div className="sd-admin-panel" style={{maxWidth:480,margin:"clamp(28px,8vh,84px) auto",padding:24}}><span className="sd-kicker">13STUDIO / OWNER ACCESS</span><h1 style={{fontSize:"clamp(1.8rem,5vw,2.5rem)",margin:"8px 0"}}>Open your <em>Briefcase.</em></h1><p className="sd-admin-help">This prototype uses one shared demo word. The real client system will be configured with the authentication methods the business chooses.</p><form className="sd-admin-form" onSubmit={submitAdminLogin}><label>Demo access word<input type="password" autoComplete="off" value={adminPassphrase} onChange={event=>setAdminPassphrase(event.target.value)} placeholder="Enter access word" required /></label><button className="sd-button sd-primary" type="submit">Continue to admin →</button></form><p className="sd-admin-help" style={{marginTop:12}}>Demo word: <strong>admin</strong>. This client-side gate is for demonstration only; it does not protect real data.</p><button className="sd-button sd-outline" type="button" onClick={()=>{setView("shop");setNotice("");}}>← Back to Store</button></div></section>}

    {view === "admin" && adminUnlocked && <section className="sd-admin sd-wrap"><div className="sd-os-heading"><div><span className="sd-kicker">ADMIN HUB / PRIVATE BRIEFCASE</span><h1>Your Business <em>OS</em></h1><p>Store, customers, jobs and records in one place. Demo changes stay in this browser; owner authentication and shared server records are not connected yet.</p></div><span className="sd-os-status">LOCAL DEMO</span></div><section className="sd-business-identity" aria-label="Business identity">
  <div className="sd-business-identity-fields">
    <label>Business name<input value={businessName} onChange={event => setBusinessName(event.target.value.slice(0, 48))} maxLength={48} placeholder="e.g. Metsi Wellness" /></label>
    <small>Use a real or fictional name. Your Store, Account and Briefcase rebrand together instantly.</small>
  </div>
  <div className="sd-business-identity-preview" style={{borderColor:themeColor}}><span className="sd-kicker">LIVE BUSINESS IDENTITY</span><strong>{businessName.trim() || "Your Business"}</strong><small>Store · Account · Briefcase</small></div>
</section>
<div className="sd-theme-control" aria-label="Active business colour"><div><strong>Store colour applied</strong><small>Your Store selection carries through this entire workspace. Change it once in the Store.</small></div><span aria-label={"Active colour "+themeColor} style={{display:"inline-block",width:28,height:28,borderRadius:"50%",background:themeColor,border:"2px solid #fff",boxShadow:"0 0 0 1px #777"}} /></div><nav className="sd-os-nav" aria-label="Business OS sections"><a href="#admin-today">Today</a><a href="#admin-requests-tools">Customers &amp; jobs</a><a href="#admin-finance">Money &amp; receipts</a><a href="#admin-customers">Customers</a><a href="#admin-service-tools">Store design</a><a href="#admin-notes">My Notes</a><a href="#admin-performance">Insights</a></nav><div className="sd-admin-head"><div><span className="sd-kicker">OPERATIONS / LOCAL DEMO</span><h1>Studio control.<br/><em>Keep it moving.</em></h1><p>Manage the service menu, special announcement and incoming demo requests. Changes are stored in this browser only.</p></div><div className="sd-admin-head-actions"><button className="sd-button sd-outline" onClick={() => setView("shop")}>View storefront ↗</button><button className="sd-button sd-outline" onClick={() => setView("account")}>Customer account ↗</button></div></div><div className="sd-admin-quick-actions"><button className="sd-button sd-primary" type="button" onClick={createTestPurchase}>＋ Run a test purchase</button><span>Creates a sample customer, completed job and receipt. No payment is processed.</span></div><div className="sd-stats" id="admin-today"><article><span>Submitted requests</span><strong>{data.orders.length}</strong><small>{data.views > 0 ? Math.round(data.orders.length / data.views * 100) : 0}% visit-to-request rate</small></article><article><span>New requests</span><strong>{statusCounts["New request"] || 0}</strong><small>{data.orders.length ? Math.round((statusCounts["New request"] || 0) / data.orders.length * 100) : 0}% of requests</small></article><article><span>Menu services</span><strong>{data.services.length}</strong><small>{data.services.length ? Math.round(activeServices.length / data.services.length * 100) : 0}% visible</small></article><article><span>Customer emails</span><strong>{new Set(data.orders.map(order => order.email.toLowerCase())).size}</strong><small>{data.orders.length ? Math.round(new Set(data.orders.map(order => order.email.toLowerCase())).size / data.orders.length * 100) : 0}% unique emails per request count</small></article><article><span>Store visits this demo</span><strong>{data.views}</strong><small>Local browser count · not unique visitors</small></article></div><section className="sd-admin-panel sd-finance-panel" id="admin-finance">
<div className="sd-panel-head"><div><span className="sd-kicker">FINANCE / LOCAL DEMO LEDGER</span><h2>Money &amp; receipts</h2></div><span className="sd-local-pill">SIMULATED RECORDS</span></div>
<div className="sd-finance-metrics"><article><small>Payments recorded</small><strong>{money(paidTotal)}</strong></article><article><small>Completed · unpaid</small><strong>{money(completedUnpaid)}</strong></article><article><small>Accepted / in progress</small><strong>{money(activePipeline)}</strong></article><article><small>All request value</small><strong>{money(data.orders.reduce((sum, order) => sum + order.price, 0))}</strong></article></div>
<p className="sd-admin-help">Paid totals include only payments recorded in this demo. Completed-unpaid and active pipeline are estimates, not cash received.</p>
<div className="sd-receipt-profile"><h3>Business details on receipts</h3><p className="sd-admin-help">Use the business's own details and tax references in this prototype document.</p>
<div className="sd-form-two">
<label>Business / legal name<input value={data.receiptProfile?.legalName || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),legalName:event.target.value}}),"Receipt business name saved on this device.")}/></label>
<label>Tax / BURS reference<input value={data.receiptProfile?.registration || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),registration:event.target.value}}),"Tax reference saved on this device.")}/></label>
<label>Business address<input value={data.receiptProfile?.address || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),address:event.target.value}}),"Receipt address saved on this device.")}/></label>
<label>Contact number<input value={data.receiptProfile?.phone || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),phone:event.target.value}}),"Receipt contact saved on this device.")}/></label></div>
<label className="sd-admin-label">Receipt footer / tax note<textarea rows={2} value={data.receiptProfile?.footer || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),footer:event.target.value}}),"Receipt footer saved on this device.")}/></label></div></section>
<section className="sd-admin-panel sd-customers-panel" id="admin-customers"><div className="sd-panel-head"><div><span className="sd-kicker">CUSTOMER DIRECTORY</span><h2>Customers</h2></div><span className="sd-local-pill">{customerRecords.length} DEMO CONTACTS</span></div>
{customerRecords.length ? <div className="sd-customer-list">{customerRecords.map(customer=><article key={customer.email}><div><strong>{customer.name}</strong><span>{customer.email}</span></div><b>{customer.jobs.length} {customer.jobs.length===1?"job":"jobs"}</b><small>{money(customer.jobs.reduce((sum,job)=>sum+job.price,0))} total request value</small></article>)}</div> : <p className="sd-admin-empty">Customer profiles appear here when someone submits a Store request or runs the test purchase.</p>}</section><section className="sd-admin-panel sd-admin-performance"><div className="sd-panel-head"><div><span className="sd-kicker">04 / DEMO PERFORMANCE</span><h2>Conversion &amp; operations</h2></div><span className="sd-local-pill">LOCAL DEMO DATA</span></div><p className="sd-admin-help">Percentages are calculated from this browser’s saved demo counts only. They are directional indicators, not shared production analytics.</p><div className="sd-performance-grid"><article><div><span>Visit to request</span><strong>{data.views > 0 ? Math.round(data.orders.length / data.views * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${Math.min(100, data.views > 0 ? data.orders.length / data.views * 100 : 0)}%`}} /></div><small>{data.orders.length} requests from {data.views} recorded visits</small></article><article><div><span>Visible service menu</span><strong>{data.services.length ? Math.round(activeServices.length / data.services.length * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${data.services.length ? activeServices.length / data.services.length * 100 : 0}%`}} /></div><small>{activeServices.length} of {data.services.length} services visible</small></article><article><div><span>Requests needing attention</span><strong>{data.orders.length ? Math.round((data.orders.length - (statusCounts["Completed"] || 0) - (statusCounts["Declined"] || 0)) / data.orders.length * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${data.orders.length ? (data.orders.length - (statusCounts["Completed"] || 0) - (statusCounts["Declined"] || 0)) / data.orders.length * 100 : 0}%`}} /></div><small>{data.orders.length - (statusCounts["Completed"] || 0) - (statusCounts["Declined"] || 0)} active of {data.orders.length} requests</small></article><article><div><span>New request share</span><strong>{data.orders.length ? Math.round((statusCounts["New request"] || 0) / data.orders.length * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${data.orders.length ? (statusCounts["New request"] || 0) / data.orders.length * 100 : 0}%`}} /></div><small>{statusCounts["New request"] || 0} new of {data.orders.length} requests</small></article></div></section>
      <section className="sd-admin-panel sd-showcase-preview" aria-live="polite">
  <div className="sd-panel-head"><div><span className="sd-kicker">LIVE STOREFRONT / SHOWCASE</span><h2>{businessName.trim() || "Your Business"}</h2></div><span className="sd-local-pill">DISPLAYING IN DEMO STORE</span></div>
  <div className="sd-showcase-preview-head"><div><span>YOUR BUSINESS / CUSTOMER VIEW</span><strong>What customers see</strong><p>Your selected colour, business name and currently visible products or services.</p></div><button className="sd-small-button" type="button" onClick={() => { setView("shop"); window.scrollTo({top:0,behavior:"smooth"}); }}>Open full Store ↗</button></div>
  {data.announcement.trim() && <p className="sd-showcase-announcement">{data.announcement}</p>}
  <div className="sd-showcase-preview-grid">{activeServices.length ? activeServices.map((service,index)=><article key={service.id}><span className="sd-showcase-preview-index">0{index+1}</span><strong>{service.name}</strong><b>{money(service.price)}</b><p>{service.description || "A service from this business."}</p></article>) : <p className="sd-admin-empty">No visible products or services yet. Add one below to populate the Store preview.</p>}</div>
  <p className="sd-admin-help">Preview updates from the same local demo data as your Store. Saving, hiding or deleting a service changes this showcase; it does not publish a live customer website.</p>
</section>
<div className="sd-admin-grid"><section className="sd-admin-panel" id="admin-service-tools"><div className="sd-panel-head"><div><span className="sd-kicker">01 / SERVICE CRUD</span><h2>Service menu</h2></div><button className="sd-small-button" onClick={() => { resetServiceForm(); setNotice("New service form ready."); }}>+ New service</button></div><div className="sd-admin-services">{data.services.map(service => <article key={service.id}><div><strong>{service.name}</strong><span>{money(service.price)} · {service.active ? "Visible" : "Hidden"}</span></div><div className="sd-row-actions"><button onClick={() => { startEdit(service); setNotice(`Editing ${service.name}. Save your changes when ready.`); }}>Edit</button><button onClick={() => toggleService(service)}>{service.active ? "Hide" : "Show"}</button><button className="sd-danger" onClick={() => setPendingConfirm({ kind: "delete-service", serviceId: service.id, serviceName: service.name })}>Delete</button></div></article>)}</div>
      <form className="sd-admin-form" id="admin-service-form" onSubmit={saveService}><h3>{editingId ? "Edit service" : "Add a service"}</h3><label>Service name<input value={serviceName} onChange={event => setServiceName(event.target.value)} required /></label><label>Price in Pula<input type="number" min="0" step="1" value={servicePrice} onChange={event => setServicePrice(event.target.value)} required /></label><label>Description<textarea rows={3} value={serviceDescription} onChange={event => setServiceDescription(event.target.value)} /></label><ServiceMediaPicker value={serviceMedia} type={serviceMediaType} online={online} onChange={(url, type) => { setServiceMedia(url); setServiceMediaType(type); }} onUploadingChange={setServiceMediaUploading} /><label className="sd-check"><input type="checkbox" checked={serviceActive} onChange={event => setServiceActive(event.target.checked)} /> Show on customer storefront</label><div className="sd-form-two"><button className="sd-button sd-primary" type="submit" disabled={serviceMediaUploading}>{serviceMediaUploading ? "Uploading media…" : editingId ? "Save changes" : "Add service"}</button><button className="sd-button sd-outline" type="button" onClick={resetServiceForm}>Cancel</button></div></form></section>
      <section className="sd-admin-panel" id="admin-announcement-tools"><div className="sd-panel-head"><div><span className="sd-kicker">02 / CUSTOMER NOTICE</span><h2>Special announcement</h2></div></div><p className="sd-admin-help">Publish a short promotion or service update. Leave blank to remove it from the storefront.</p><label className="sd-admin-label">Announcement<textarea rows={5} value={announcementDraft} onChange={event => setAnnouncementDraft(event.target.value)} placeholder="Example: Book your next project this month…" /></label><button className="sd-button sd-primary" onClick={() => { commitData(current => ({ ...current, announcement: announcementDraft.trim() }), announcementDraft.trim() ? "Announcement published on this device." : "Announcement cleared from the storefront."); }}>Publish announcement</button><div className="sd-live-preview"><span>STOREFRONT PREVIEW</span><p>{announcementDraft.trim() || "Your announcement will appear here when published."}</p></div><div className="sd-panel-head sd-request-head" id="admin-requests-tools"><div><span className="sd-kicker">03 / INCOMING WORK</span><h2>Customer requests</h2></div></div>{data.orders.length === 0 ? <div className="sd-admin-empty">No requests yet. Submit one from the customer storefront to see the workflow.</div> : <div className="sd-admin-orders">{data.orders.map(order => <article key={order.id}><div className="sd-admin-order-top"><strong>{order.serviceName} · {money(order.price)} {order.isTest && <span className="sd-test-label">TEST</span>}</strong><span>{order.id}</span></div><p>{order.customerName} · {order.email}</p><p>Requested date: <b>{order.dueDate}</b></p><p>Payment: <b>{order.paymentStatus || "Unpaid"}</b></p>{order.brief && <p>{order.brief}</p>}<div className="sd-order-admin-actions">{order.paymentStatus !== "Paid (demo)" && <button className="sd-small-button" type="button" onClick={()=>recordDemoPayment(order.id)}>Record demo payment</button>}<label>Request status<select value={order.status} onChange={event => updateOrder(order.id, event.target.value)}><option>New request</option><option>Reviewing</option><option>Accepted</option><option>In progress</option><option>Completed</option><option>Declined</option></select></label></div>{order.receiptNo && <details className="sd-receipt"><summary>View receipt · {order.receiptNo}</summary><div className="sd-receipt-paper"><span>PAYMENT RECEIPT · {order.isTest ? "DEMO TEST" : "LOCAL DEMO"}</span><h3>{data.receiptProfile?.legalName || businessName}</h3><p>{data.receiptProfile?.address}</p><p>{data.receiptProfile?.phone}</p><p>{data.receiptProfile?.registration ? "Tax / BURS reference: "+data.receiptProfile.registration : "Tax reference not supplied"}</p><hr/><p>Receipt: <b>{order.receiptNo}</b></p><p>Date: {order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}</p><p>Customer: {order.customerName} · {order.email}</p><p>Job: {order.serviceName}</p><h2>{money(order.paidAmount || 0)}</h2><p>Payment status: {order.paymentStatus}</p><hr/><p>{data.receiptProfile?.footer}</p><small>Prototype receipt layout for the business&#39;s own tax and record-keeping setup.</small><button className="sd-small-button" type="button" onClick={()=>window.print()}>Print / Save PDF</button></div></details>}<div className="sd-admin-thread"><strong>Customer conversation · {(order.messages || []).length} messages</strong>{(order.messages || []).map(message => <div className={"sd-admin-thread-message is-" + message.from} key={message.id}><b>{message.from === "customer" ? "Customer" : "Studio / Admin"}</b><small>{new Date(message.createdAt).toLocaleString()}</small>{message.text && <p>{message.text}</p>}{message.attachment && <a href={message.attachment.url} target="_blank" rel="noreferrer">↗ {message.attachment.name}</a>}</div>)}<form onSubmit={event => { event.preventDefault(); replyToOrder(order.id); }}><label>Reply to customer<textarea rows={2} value={adminReplyDrafts[order.id] || ""} onChange={event => setAdminReplyDrafts(current => ({ ...current, [order.id]: event.target.value }))} placeholder="Write a project update or question…" maxLength={1200}/></label><button className="sd-small-button" type="submit" disabled={!(adminReplyDrafts[order.id] || "").trim()}>Save reply to local thread →</button></form></div></article>)}</div>}</section></div><section className="sd-admin-panel sd-capacity-reference"><div className="sd-panel-head"><div><span className="sd-kicker">CAPACITY / BOARD SIGNAL</span><h2>Built for busy days</h2></div><span className="sd-local-pill">REFERENCE BENCHMARK</span></div><div className="sd-capacity-grid"><article><strong>25 GB</strong><span>Monthly server allowance reference</span></article><article><strong>1,000+</strong><span>Customer calls / interactions in a busy day</span></article><article><strong>Day off</strong><span>Storefront and automated workflows remain available</span></article></div><p className="sd-admin-help">Based on the BoardSignal capacity evidence supplied for this product direction. Actual limits depend on the hosting plan, traffic, file sizes, database operations and connected services. The intended positioning is an affordable operating expense below a business&apos;s marketing budget; the actual plan and service costs must be shown transparently. Live metering and plan billing are not connected in this prototype.</p></section><section className="sd-admin-panel sd-owner-notes" id="admin-notes"><div className="sd-panel-head"><div><span className="sd-kicker">PRIVATE BRIEFCASE / NOTES</span><h2>My Notes</h2></div><span className="sd-local-pill">THIS DEVICE</span></div><p className="sd-admin-help">Capture priorities, decisions, reminders and ideas for the business. Notes are private to this browser profile in this demo; they are not synced or encrypted as an owner account.</p><label className="sd-admin-label" htmlFor="owner-notes">Working notes</label><textarea id="owner-notes" rows={8} maxLength={12000} value={ownerNotes} onChange={event => setOwnerNotes(event.target.value)} placeholder="Today’s priorities…&#10;Decisions to revisit…&#10;Ideas to develop…" /><div className="sd-notes-meta"><span>{ownerNotes.length.toLocaleString()} / 12,000 characters</span><span>{notesReady ? "Auto-saves on this device" : "Loading notes…"}</span></div></section><div className="sd-admin-footer"><button className="sd-button sd-outline" onClick={() => setPendingConfirm({ kind: "reset-demo" })}>Reset demo data</button><p>Prototype only · no Firebase · no shared admin/customer records</p></div></section>}

    <ServiceGuide view={view === "admin" ? "admin" : view === "account" ? "account" : "shop"} services={data.services} requestCount={data.orders.length} onChooseService={beginOrder} onOpenAccount={() => { setView("account"); setNotice(""); }} onOpenAdmin={openAdminGuide} onOpenStorefront={() => { setView("shop"); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    <footer className="sd-footer"><div className="sd-wrap sd-footer-inner"><button className="sd-brand sd-owner-entry" onClick={() => { requestAdminLogin(); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Open ${businessName || "Your Business"} owner Briefcase`}><span className="sd-briefcase-mark" aria-hidden="true">💼</span><span className="sd-owner-entry-copy"><strong>13Studio</strong><small>OPEN OWNER BRIEFCASE</small><em>{businessName || "Your Business"}</em></span><span className="sd-owner-entry-arrow" aria-hidden="true">↗</span></button><p>Built to be explored online and offline.</p><div><button onClick={() => { setView("account"); setNotice(""); }}>My account</button><Link href="/patterns">PWA pattern lab</Link></div></div></footer>
    {pendingConfirm && <div className="sd-confirm-backdrop" onClick={() => setPendingConfirm(null)}><section className="sd-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="sd-confirm-title" aria-describedby="sd-confirm-description" onClick={event => event.stopPropagation()}><span className="sd-kicker">CONFIRM ACTION</span><h2 id="sd-confirm-title">{pendingConfirm.kind === "reset-demo" ? "Reset demo data?" : `Delete ${pendingConfirm.serviceName || "this service"}?`}</h2><p id="sd-confirm-description">{pendingConfirm.kind === "reset-demo" ? "This clears local requests, service edits and the announcement, restoring the starter examples on this device." : "This removes the service from this browser demo. Existing requests keep their saved service name and price."}</p><div className="sd-confirm-actions"><button type="button" className="sd-button sd-outline" autoFocus onClick={() => setPendingConfirm(null)}>Keep it</button><button type="button" className="sd-button sd-primary" onClick={() => { const action = pendingConfirm; setPendingConfirm(null); if (action.kind === "reset-demo") { if (commitData(() => ({ ...emptyData, views: data.views }), "Demo data reset on this device.")) { setAnnouncementDraft(""); resetServiceForm(); } } else if (action.serviceId) { if (commitData(current => ({ ...current, services: current.services.filter(item => item.id !== action.serviceId) }), `${action.serviceName || "Service"} deleted from this demo.`) && editingId === action.serviceId) resetServiceForm(); } }}>Confirm</button></div></section></div>}
    {notice && <div className="sd-toast-region"><div className={"sd-toast" + (/^(Choose|Add |Enter |The browser|Local demo storage|Could not save)/i.test(notice) ? " is-error" : " is-success")} role={/^(Choose|Add |Enter |The browser|Local demo storage|Could not save)/i.test(notice) ? "alert" : "status"}><span className="sd-toast-mark" aria-hidden="true">{/^(Choose|Add |Enter |The browser|Local demo storage|Could not save)/i.test(notice) ? "!" : "✓"}</span><p>{notice}</p><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div></div>}
  </main>;
}
