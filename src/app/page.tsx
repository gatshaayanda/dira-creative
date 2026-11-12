"use client";

import Link from "next/link";
import ServiceGuide from "@/app/ServiceGuide";
import ServiceMediaPicker from "@/app/ServiceMediaPicker";
import AnnouncementImagePicker from "@/app/AnnouncementImagePicker";
import AccountWorkspace, { type AccountMessage } from "@/app/AccountWorkspace";
import ReceiptDocument from "@/app/ReceiptDocument";
import DiraBrand from "@/components/DiraBrand";
import { hasFirebaseWebConfig } from "@/lib/firebase/client";
import { subscribeToPublishedDiraServices } from "@/lib/firebase/dira-services";
import { DEFAULT_DIRA_CATALOGUE } from "@/lib/dira-catalogue";
import { useEffect, useMemo, useState } from "react";

type Service = { id: string; name: string; price: number; description: string; media: string; mediaType: "image" | "video"; active: boolean; priceLabel?: string; category?: string; featured?: boolean; kind?: "service" | "package" };
type ProjectTask = { id: string; title: string; done: boolean };
type DemoOrder = { id: string; serviceId: string; serviceName: string; price: number; dueDate: string; customerName: string; email: string; brief: string; status: string; createdAt: string; tasks?: ProjectTask[]; messages?: AccountMessage[]; paymentStatus?: "Unpaid" | "Partially paid (demo)" | "Paid (demo)"; originalPrice?: number; discountAmount?: number; discountCode?: string; paidAmount?: number; paidAt?: string; receiptNo?: string; isTest?: boolean; completedAt?: string; quoteAmount?: number; quoteStatus?: "Not prepared" | "Sent" | "Approved" | "Declined"; priceIsStarting?: boolean };
type DemoEvent = { id: string; kind: "visit" | "request" | "completed" | "payment" | "promotion" | "task" | "quote"; label: string; at: string; test?: boolean };
type DiscountClaim = { id: string; email: string; code: string; amount: number; createdAt: string; status: "Available" | "Redeemed" };
type DemoData = { services: Service[]; orders: DemoOrder[]; announcement: string; announcementImage?: string; views: number; events?: DemoEvent[]; discountAmount?: number; discountClaims?: DiscountClaim[]; receiptProfile?: { legalName: string; registration: string; address: string; phone: string; footer: string } };
const STORAGE_KEY = "dira-creative:business-os:v1";
const seedServices: Service[] = DEFAULT_DIRA_CATALOGUE.map(item => ({
  id: item.id,
  name: item.name,
  price: item.priceFrom ?? 0,
  description: item.description,
  media: item.imageUrl || "",
  mediaType: "image",
  active: item.published,
  priceLabel: item.priceLabel,
  category: item.category,
  featured: item.featured,
  kind: item.kind,
}));
const emptyData: DemoData = { services: seedServices, orders: [], announcement: "", announcementImage: "", views: 0, events: [], discountAmount: 10, discountClaims: [], receiptProfile: { legalName: "Royalty Holdings (Pty) Ltd", registration: "UIN BW 00001917522", address: "Gaborone, Botswana", phone: "+267 74 343 719", footer: "Dira Creative · Building brands that communicate clearly, operate efficiently, and scale effectively." } };
const money = (amount: number) => "P" + amount.toLocaleString("en-BW", { maximumFractionDigits: 2 });
const servicePriceLabel = (service: Service) => service.priceLabel || (service.id.startsWith("package-") ? "From " + money(service.price) : money(service.price));
const serviceEmoji = (name: string) => {
  const label = name.toLowerCase();
  if (/website|web|site|digital|design/.test(label)) return "🌐";
  if (/app|mobile|software/.test(label)) return "📱";
  if (/support|maintenance|care|help/.test(label)) return "🛠️";
  if (/game|phaser|race/.test(label)) return "🎮";
  if (/product|shop|store|retail/.test(label)) return "🛍️";
  if (/consult|strategy|business|service/.test(label)) return "💼";
  return "✨";
};
const accentInk = (hex: string) => {
  const values = hex.match(/[0-9a-f]{2}/gi)?.map(value => parseInt(value, 16) / 255) || [0.3, 0.3, 0.3];
  const luminance = values.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.179 ? "#111827" : "#ffffff";
};
const accentText = (hex: string) => {
  const values = hex.match(/[0-9a-f]{2}/gi)?.map(value => parseInt(value, 16)) || [79, 140, 255];
  const luminance = (rgb: number[]) => rgb.map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  let rgb = values;
  while (luminance(rgb) > 0.179) rgb = rgb.map(value => Math.max(0, Math.round(value * 0.88)));
  return "#" + rgb.map(value => value.toString(16).padStart(2, "0")).join("");
};
const localDate = () => { const now = new Date(); return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-"); };

export default function Home() {
  const [data, setData] = useState<DemoData>(emptyData);
  const [ready, setReady] = useState(false);
  const [remoteServices, setRemoteServices] = useState<Service[] | null>(null);
  const [online, setOnline] = useState(true);
  const [view, setView] = useState<"shop" | "account" | "login" | "admin">("shop");
  const [adminTab, setAdminTab] = useState<"today" | "work" | "money" | "store" | "notes" | "insights" | "calendar">("today");
  const [promoAssignEmail, setPromoAssignEmail] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPassphrase, setAdminPassphrase] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [catalogueView, setCatalogueView] = useState<"featured" | "all" | "identity" | "packages">("featured");
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [brief, setBrief] = useState("");
  const [promoCode, setPromoCode] = useState("");
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
  const [announcementImageDraft, setAnnouncementImageDraft] = useState("");
  const [announcementImageUploading, setAnnouncementImageUploading] = useState(false);
  const [discountAmountDraft, setDiscountAmountDraft] = useState("10");
  const [adminReplyDrafts, setAdminReplyDrafts] = useState<Record<string, string>>({});
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, string>>({});
  const [taskDrafts, setTaskDrafts] = useState<Record<string, string>>({});
  const [quoteDrafts, setQuoteDrafts] = useState<Record<string, string>>({});
  const [pendingConfirm, setPendingConfirm] = useState<{ kind: "delete-service" | "reset-demo"; serviceId?: string; serviceName?: string } | null>(null);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [notesReady, setNotesReady] = useState(false);
  const [themeColor, setThemeColor] = useState("#0097b2");
  const [themeReady, setThemeReady] = useState(false);
  const [businessName, setBusinessName] = useState("Dira Creative");
  const [businessNameReady, setBusinessNameReady] = useState(false);

  useEffect(() => {
    try {
      const savedName = window.localStorage.getItem("dira-creative:business-name:v1");
      if (savedName) setBusinessName(savedName.slice(0, 48));
    } catch { /* use the demo business name */ }
    setBusinessNameReady(true);
  }, []);

  useEffect(() => {
    if (!businessNameReady) return;
    try { window.localStorage.setItem("dira-creative:business-name:v1", businessName.trim().slice(0, 48) || "Dira Creative"); }
    catch { setNotice("Business name could not be saved on this device."); }
  }, [businessName, businessNameReady]);

  useEffect(() => {
    try {
      const savedTheme = window.localStorage.getItem("dira-creative:store-theme:v1");
      if (savedTheme && /^#[0-9a-f]{6}$/i.test(savedTheme)) setThemeColor(savedTheme);
    } catch { /* theme remains at the accessible default */ }
    setThemeReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--studio-accent", themeColor);
    if (!themeReady) return;
    try { window.localStorage.setItem("dira-creative:store-theme:v1", themeColor); }
    catch { setNotice("Theme could not be saved on this device."); }
  }, [themeColor, themeReady]);

  useEffect(() => {
    try { setOwnerNotes(window.localStorage.getItem("dira-creative:owner-notes:v1") || ""); }
    catch { setNotice("My Notes could not be loaded from this browser."); }
    setNotesReady(true);
  }, []);

  useEffect(() => {
    if (!notesReady) return;
    try { window.localStorage.setItem("dira-creative:owner-notes:v1", ownerNotes); }
    catch { setNotice("My Notes could not be saved on this device."); }
  }, [ownerNotes, notesReady]);

  useEffect(() => {
    if (!hasFirebaseWebConfig) { setRemoteServices(null); return; }
    return subscribeToPublishedDiraServices(items => setRemoteServices(items.map(item => ({
      id: item.kind === "package" ? "package-" + item.id : item.id,
      name: item.name,
      price: item.priceFrom ?? 0,
      description: item.description,
      media: item.imageUrl || "",
      mediaType: "image" as const,
      active: item.published,
      priceLabel: item.priceLabel,
      category: item.category,
      featured: item.featured,
      kind: item.kind,
    }))), error => setNotice(error.message));
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<DemoData>;
        setData({ ...emptyData, ...parsed, services: Array.isArray(parsed.services) ? parsed.services : seedServices, orders: Array.isArray(parsed.orders) ? parsed.orders : [], announcement: typeof parsed.announcement === "string" ? parsed.announcement : "", views: (Number(parsed.views) || 0) + 1, events: [...(Array.isArray(parsed.events) ? parsed.events : []), { id: "EV-"+Date.now().toString(36), kind: "visit", label: "Store visited", at: new Date().toISOString() }], receiptProfile: { ...emptyData.receiptProfile!, ...(parsed.receiptProfile || {}) } });
        setAnnouncementDraft(typeof parsed.announcement === "string" ? parsed.announcement : "");
        setAnnouncementImageDraft(typeof parsed.announcementImage === "string" ? parsed.announcementImage : "");
        setDiscountAmountDraft(String(Number(parsed.discountAmount) > 0 ? Number(parsed.discountAmount) : 10));
      } else setData(current => ({ ...current, views: 1, events: [{ id: "EV-"+Date.now().toString(36), kind: "visit", label: "Store visited", at: new Date().toISOString() }] }));
    } catch { setNotice("Local demo storage is unavailable in this browser. You can explore, but changes may not persist."); }
    setReady(true);
    setOnline(navigator.onLine);
    const syncOnline = () => setOnline(navigator.onLine);
    window.addEventListener("online", syncOnline);
    window.addEventListener("offline", syncOnline);
    const params = new URLSearchParams(window.location.search);
    if (params.get("view") === "account") { if (hasFirebaseWebConfig) window.location.replace("/account"); else setView("account"); }
    if (window.location.hash === "#admin" || window.location.hash === "#login") { if (hasFirebaseWebConfig) window.location.replace("/admin"); else setView("login"); }
    return () => { window.removeEventListener("online", syncOnline); window.removeEventListener("offline", syncOnline); };
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { setNotice("The browser could not save this change locally. Check available storage."); }
  }, [data, ready]);

  useEffect(() => {
    if (!ready || !("serviceWorker" in navigator)) return;
    const mediaUrls = [
      ...servicesForDisplay.map(service => service.media),
      data.announcementImage || "",
      ...data.orders.flatMap(order => (order.messages || []).map(message => message.attachment?.url || "")),
    ].filter((url): url is string => typeof url === "string" && /^https:\/\//i.test(url));
    const prepareOfflineMedia = () => {
      navigator.serviceWorker.controller?.postMessage({ type: "CACHE_MEDIA", urls: mediaUrls });
    };
    prepareOfflineMedia();
    navigator.serviceWorker.addEventListener("controllerchange", prepareOfflineMedia);
    void navigator.serviceWorker.ready.then(registration => {
      (navigator.serviceWorker.controller || registration.active)?.postMessage({ type: "CACHE_MEDIA", urls: mediaUrls });
    }).catch(() => {
      // Local demo actions remain available even when the browser blocks service workers.
    });
    return () => navigator.serviceWorker.removeEventListener("controllerchange", prepareOfflineMedia);
  }, [remoteServices, data.services, data.announcementImage, data.orders, ready]);

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

  const servicesForDisplay = remoteServices ?? data.services;
  const activeServices = servicesForDisplay.filter(service => service.active);
  const paidTotal = data.orders.reduce((sum, order) => sum + (order.paidAmount || 0), 0);
  const completedUnpaid = data.orders.filter(order => order.status === "Completed").reduce((sum, order) => sum + Math.max(0, order.price - (order.paidAmount || 0)), 0);
  
  const requestedValue = data.orders.filter(order => order.status !== "Declined").reduce((sum, order) => sum + order.price, 0);
  const projectedValue = data.orders.filter(order => ["Accepted", "In progress"].includes(order.status)).reduce((sum, order) => sum + order.price, 0);
  const completedValue = data.orders.filter(order => order.status === "Completed").reduce((sum, order) => sum + order.price, 0);
  const customerRecords = Array.from(new Map(data.orders.map(order => [order.email.toLowerCase(), { name: order.customerName, email: order.email, jobs: data.orders.filter(item => item.email.toLowerCase() === order.email.toLowerCase()) }] as const)).values());
  const selectedService = servicesForDisplay.find(service => service.id === selected && service.active);
  const catalogueMatches = activeServices.filter(service => { const query = catalogueSearch.trim().toLowerCase(); const matchesQuery = !query || [service.name, service.description, service.category || ""].some(value => value.toLowerCase().includes(query)); const matchesView = catalogueView === "all" || (catalogueView === "identity" && service.category === "Brand Identity & Visual Systems") || (catalogueView === "packages" && service.kind === "package") || (catalogueView === "featured" && service.featured); return matchesQuery && matchesView; });
  const packageFor = (id: string) => activeServices.find(service => service.id === id);
  const statusCounts = useMemo(() => data.orders.reduce<Record<string, number>>((acc, order) => { acc[order.status] = (acc[order.status] || 0) + 1; return acc; }, {}), [data.orders]);

  function beginOrder(service: Service) {
    if (!service.active) return;
    if (hasFirebaseWebConfig) { window.location.assign("/request?service=" + encodeURIComponent(service.name) + (service.id.startsWith("package-") ? "&package=" + encodeURIComponent(service.name) : "")); return; }
    setSelected(service.id); setOrderFormOpen(true); setView("shop"); setNotice(`${service.name} selected. Add your details and requested date below.`); setDueDate(""); setBrief("");
    window.setTimeout(() => document.getElementById("service-order")?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);
  }
  function openRequestForm() {
    if (hasFirebaseWebConfig) { window.location.assign("/request"); return; }
    setOrderFormOpen(true); setView("shop");
    window.setTimeout(() => document.getElementById("service-order")?.scrollIntoView({ behavior: "smooth", block: "start" }), 90);
  }

  function requestAdminLogin() {
    if (hasFirebaseWebConfig) { window.location.assign("/admin"); return; }
    if (adminUnlocked) { setView("admin"); return; }
    setAdminPassphrase("");
    setView("login");
    setNotice("Enter the prototype access word to preview the owner workspace.");
  }
  function submitAdminLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (adminPassphrase.trim().toLowerCase() !== "admin") {
      setNotice("That access word is not correct.");
      return;
    }
    setAdminUnlocked(true);
    setAdminPassphrase("");
    setView("admin");
    setNotice("Prototype owner workspace opened. This is not production authentication.");
  }
  function openAdminGuide(target?: "services" | "announcement" | "requests") {
    if (!adminUnlocked) { requestAdminLogin(); return; }
    setView("admin");
    setAdminTab(target === "requests" ? "work" : target === "services" || target === "announcement" ? "store" : "today");
    const targetId = target === "services" ? "admin-service-tools" : target === "announcement" ? "admin-announcement-tools" : target === "requests" ? "admin-requests-tools" : "admin-tools";
    window.setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }
  function submitOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedService) { setNotice("Choose a service first."); return; }
    if (!customerName.trim() || !email.trim() || !dueDate) { setNotice("Add your name, email and requested timeline date."); return; }
    const claim = (data.discountClaims || []).find(item => item.code.toLowerCase() === promoCode.trim().toLowerCase() && item.email.toLowerCase() === email.trim().toLowerCase() && item.status === "Available");
    if (promoCode.trim() && !claim) { setNotice("That discount code is not available for this customer account."); return; }
    const discountAmount = claim ? Math.min(claim.amount, selectedService.price) : 0;
    if (dueDate < localDate()) { setNotice("Choose today or a future date for your requested timeline."); return; }
    const createdAt = new Date().toISOString();
    const id = "DEMO-" + Date.now().toString(36).toUpperCase();
    const order: DemoOrder = { id, receiptNo: "RCP-" + createdAt.slice(0, 10).replaceAll("-", "") + "-" + id.slice(-5), serviceId: selectedService.id, serviceName: selectedService.name, price: Math.max(0, selectedService.price - discountAmount), ...(discountAmount ? { originalPrice: selectedService.price, discountAmount, discountCode: claim!.code } : {}), dueDate, customerName: customerName.trim(), email: email.trim(), brief: brief.trim(), status: "New request", createdAt, paymentStatus: "Unpaid", paidAmount: 0, tasks: [], quoteStatus: "Not prepared", priceIsStarting: selectedService.id.startsWith("package-") };
    if (!commitData(current => ({ ...current, orders: [order, ...current.orders], discountClaims: claim ? (current.discountClaims || []).map(item => item.id === claim.id ? { ...item, status: "Redeemed" as const } : item) : current.discountClaims, events: [{ id: "EV-"+Date.now().toString(36), kind: "request", label: "Customer request received · "+order.serviceName, at: new Date().toISOString() }, ...(current.events || [])] }), "Order request saved on this device. No payment was taken.")) return;
    setView("account"); setSelected(null); setPromoCode("");
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
  function sendQuote(orderId: string, requestedAmount: number) {
    const order = data.orders.find(item => item.id === orderId);
    if (!order) return;
    const amount = Math.round(requestedAmount * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0 || amount > 100000000) { setNotice("Enter a valid quote amount greater than zero."); return; }
    const now = new Date().toISOString();
    const message: AccountMessage = { id: "MSG-" + Date.now().toString(36), from: "studio", text: "Dira Creative has prepared a quote for " + money(amount) + " for " + order.serviceName + ". Review the proposal in your account and approve or decline it. No payment has been taken.", createdAt: now };
    if (commitData(current => ({
      ...current,
      orders: current.orders.map(item => item.id === orderId ? { ...item, quoteAmount: amount, quoteStatus: "Sent" as const, messages: [...(item.messages || []), message] } : item),
      events: [{ id: "EV-" + Date.now().toString(36), kind: "quote", label: "Quote sent · " + money(amount) + " · " + order.serviceName, at: now }, ...(current.events || [])]
    }), "Quote sent to the customer account in this browser preview.")) setQuoteDrafts(current => ({ ...current, [orderId]: String(amount) }));
  }

  function addProjectTask(orderId: string) {
    const title = (taskDrafts[orderId] || "").trim();
    if (!title) { setNotice("Write a task before adding it to the project."); return; }
    const task: ProjectTask = { id: "TASK-" + Date.now().toString(36), title, done: false };
    const order = data.orders.find(item => item.id === orderId);
    if (commitData(current => ({
      ...current,
      orders: current.orders.map(item => item.id === orderId ? { ...item, tasks: [...(item.tasks || []), task] } : item),
      events: [{ id: "EV-" + Date.now().toString(36), kind: "task", label: "Project task added · " + (order?.serviceName || "Client project"), at: new Date().toISOString() }, ...(current.events || [])]
    }), "Project task added and saved on this device.")) setTaskDrafts(current => ({ ...current, [orderId]: "" }));
  }
  function toggleProjectTask(orderId: string, taskId: string) {
    const order = data.orders.find(item => item.id === orderId);
    const task = order?.tasks?.find(item => item.id === taskId);
    if (!task) return;
    const done = !task.done;
    commitData(current => ({
      ...current,
      orders: current.orders.map(item => item.id === orderId ? { ...item, tasks: (item.tasks || []).map(entry => entry.id === taskId ? { ...entry, done } : entry) } : item),
      events: [{ id: "EV-" + Date.now().toString(36), kind: "task", label: (done ? "Project task completed · " : "Project task reopened · ") + task.title, at: new Date().toISOString() }, ...(current.events || [])]
    }), done ? "Project task marked complete." : "Project task reopened.");
  }

  function recordDemoPayment(id: string, amount: number) {
    const order = data.orders.find(item => item.id === id);
    if (!order) return;
    if (!["Accepted", "In progress", "Completed"].includes(order.status) || order.priceIsStarting) { setNotice("Approve a final quote before recording a payment for this request."); return; }
    const alreadyPaid = Math.max(0, order.paidAmount || 0);
    const outstanding = Math.max(0, order.price - alreadyPaid);
    const payment = Math.round(amount * 100) / 100;
    if (!Number.isFinite(payment) || payment <= 0) { setNotice("Enter a payment amount greater than zero."); return; }
    if (outstanding <= 0) { setNotice("This request is already fully paid in the local demo."); return; }
    if (payment > outstanding) { setNotice("The payment cannot exceed the remaining balance of " + money(outstanding) + "."); return; }
    const now = new Date().toISOString();
    const paidAmount = Math.min(order.price, alreadyPaid + payment);
    const paymentStatus = paidAmount >= order.price ? "Paid (demo)" as const : "Partially paid (demo)" as const;
    const receiptNo = order.receiptNo || "RCP-" + now.slice(0, 10).replaceAll("-", "") + "-" + id.slice(-5);
    if (commitData(current => ({
      ...current,
      orders: current.orders.map(item => item.id === id ? { ...item, paymentStatus, paidAmount, paidAt: now, receiptNo } : item),
      events: [{ id: "EV-" + Date.now().toString(36), kind: "payment", label: "Demo payment recorded · " + money(payment) + " · " + order.serviceName, at: now, test: order.isTest }, ...(current.events || [])]
    }), money(payment) + " recorded on this device. Remaining balance: " + money(Math.max(0, order.price - paidAmount)) + ". No money moved.")) {
      setPaymentDrafts(current => ({ ...current, [id]: "" }));
    }
  }

  function assignPromoReward() {
    const normalized = promoAssignEmail.trim().toLowerCase();
    if (!normalized || !normalized.includes("@")) { setNotice("Enter a valid customer email for this promotion."); return; }
    const existing = (data.discountClaims || []).find(item => item.email.toLowerCase() === normalized && item.status === "Available");
    if (existing) { setNotice("This customer already has an unused discount code: " + existing.code); return; }
    const code = "PROMO-" + Math.random().toString(36).slice(2,7).toUpperCase();
    const amount = Number(discountAmountDraft);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) { setNotice("Enter a discount amount between P0.01 and P5,000."); return; }
    const claim: DiscountClaim = { id: "DISC-" + Date.now().toString(36), email: normalized, code, amount, createdAt: new Date().toISOString(), status: "Available" };
    if (commitData(current => ({ ...current, discountClaims: [claim, ...(current.discountClaims || [])], events: [{ id: "EV-" + Date.now().toString(36), kind: "promotion", label: "Customer discount issued · " + money(claim.amount), at: new Date().toISOString() }, ...(current.events || [])] }), "Customer discount issued to " + normalized + ": " + code)) setPromoAssignEmail("");
  }
  function replyToOrder(id: string) {
    const text = (adminReplyDrafts[id] || "").trim();
    if (!text) { setNotice("Write a reply before sending it."); return; }
    const message: AccountMessage = { id: "MSG-" + Date.now().toString(36), from: "studio", text, createdAt: new Date().toISOString() };
    if (commitData(current => ({ ...current, orders: current.orders.map(order => order.id === id ? { ...order, messages: [...(order.messages || []), message] } : order) }), "Dira Creative reply saved in this browser preview.")) setAdminReplyDrafts(current => ({ ...current, [id]: "" }));
  }

  return <main className="serviceDemo" style={{ "--studio-accent": themeColor, "--studio-accent-ink": accentInk(themeColor), "--studio-accent-text": accentText(themeColor) } as React.CSSProperties}>
    <div className="sd-topline"><div className="sd-wrap"><span>DIRA CREATIVE <i className="sd-topline-divider">/</i> BRAND &amp; BUSINESS DEVELOPMENT</span><span className={online ? "sd-connect" : "sd-connect is-offline"}><i />{!online ? (hasFirebaseWebConfig ? "Offline · cached workspace" : "Offline · local preview") : remoteServices !== null ? "Live service catalogue" : hasFirebaseWebConfig ? "Connecting to services…" : "Preview only"}</span></div></div>
    <header className="sd-header"><div className="sd-wrap sd-nav"><button className="sd-brand" onClick={() => { setView("shop"); setNotice(""); window.scrollTo({top:0,behavior:"smooth"}); }} aria-label="Back to services"><DiraBrand name={businessName || "Dira Creative"} subtitle="BRAND & BUSINESS DEVELOPMENT"/></button><nav aria-label="Main navigation"><button onClick={() => { setView("shop"); setNotice(""); }}>Store</button><button onClick={() => { if (hasFirebaseWebConfig) window.location.assign("/account"); else { setView("account"); setNotice(""); } }}>Account <span className="sd-count">{data.orders.length}</span></button></nav></div></header>
    {(view === "shop" || view === "account" || view === "login") && <nav className="sd-mobile-nav" aria-label="Quick navigation">
      <button type="button" className={view === "shop" ? "is-active" : ""} onClick={() => { setView("shop"); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><span aria-hidden="true">⌂</span>Store</button>
      <button type="button" onClick={() => { setView("shop"); document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}><span aria-hidden="true">▦</span>Services</button>
      <button type="button" className={view === "account" ? "is-active" : ""} onClick={() => { if (hasFirebaseWebConfig) window.location.assign("/account"); else { setView("account"); setNotice(""); } }}><span aria-hidden="true">◉</span>Account</button>
    </nav>}
    {!online && <aside className="sd-offline-notice" role="status"><strong>{hasFirebaseWebConfig ? "Offline mode · cached workspace" : "Offline mode · local preview"}</strong><span>{hasFirebaseWebConfig ? "Previously loaded service and account data may remain available from this device. New submissions and uploads need an internet connection." : "Preview changes remain local to this browser. New uploads and remote services need internet."}</span></aside>}


    {view === "shop" && <>
      <section className="sd-store-home">
        <div className="sd-wrap">
          <div className="sd-store-intro">
            <div className="sd-store-copy">
              <span className="sd-kicker"><span aria-hidden="true">🏪</span> {businessName.trim() || "DIRA CREATIVE"} / BRAND & BUSINESS DEVELOPMENT</span>
              <h1>Brands with clarity. Businesses with direction.</h1>
              <p>Building brands that communicate clearly, operate efficiently, and scale effectively.</p>
              <div className="sd-hero-actions">
                <button type="button" className="sd-hero-primary" onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth", block: "start" })}>Explore services <span aria-hidden="true">↘</span></button>
                <button type="button" className="sd-hero-secondary" onClick={openRequestForm}>Start a request <span aria-hidden="true">↗</span></button>
              </div>
            </div>
            <div className="sd-store-visual" aria-label="Dira Creative brand and business development">
              <div className="sd-hero-art">
                <div className="sd-hero-art-top"><span>ROYALTY HOLDINGS</span><span>01 — 05</span></div>
                <div className="sd-hero-art-main"><span className="sd-hero-art-kicker">IDEAS INTO OPERATING BUSINESSES</span><strong>MAKE<br/><em>IT</em> CLEAR.</strong><span className="sd-hero-art-line"/></div>
                <div className="sd-hero-art-bottom"><span>IDENTITY</span><span>PRESENCE</span><span>OPERATIONS</span><span>GROWTH</span></div>
                <span className="sd-hero-art-orbit" aria-hidden="true">D</span>
              </div>
            </div>
          </div>
          <div className="sd-store-proof" aria-label="Dira Creative principles">
            <span><b>Clarity</b><small>Know what matters</small></span>
            <span><b>Excellence</b><small>Work with intention</small></span>
            <span><b>Functionality</b><small>Built to work</small></span>
          </div>
          <section className="sd-starting-points" aria-labelledby="sd-starting-title">
            <div className="sd-starting-heading"><span className="sd-kicker">A GOOD PLACE TO START</span><h2 id="sd-starting-title">Where is your business now?</h2><p>Choose the level that feels closest. We can shape the right scope together.</p></div>
            <div className="sd-starting-grid">
              {[
                {id:"package-novice",label:"I’m getting started",detail:"Build a clear, credible foundation.",price:"P2,100–P3,200"},
                {id:"package-elevate",label:"I’m ready to grow",detail:"Bring your brand and business into alignment.",price:"P3,400–P5,200"},
                {id:"package-elite",label:"I’m established",detail:"Create a complete, connected brand system.",price:"P9,500–P12,500"}
              ].map(item=>{const service=packageFor(item.id);return <article key={item.id}><span>{item.label}</span><p>{item.detail}</p><strong>{item.price}</strong><button type="button" disabled={!service} onClick={()=>service&&beginOrder(service)}>Explore this package <span>↗</span></button></article>;})}
            </div>
          </section>
          
        </div>
      </section>
      {(data.announcement.trim() || data.announcementImage) && <section className="sd-announcement"><div className="sd-wrap"><span><span aria-hidden="true">📣</span> DIRA CREATIVE / ANNOUNCEMENT</span>{data.announcementImage && <img className="sd-announcement-thumb" src={data.announcementImage} alt={data.announcement.slice(0, 120) || "Announcement image"} loading="lazy" />}<p>{data.announcement}</p></div></section>}
      <section className="sd-services sd-wrap" id="services">
        <div className="sd-section-head sd-compact-section-head"><div><span className="sd-kicker">DIRA CREATIVE / SERVICES</span><h2>Find the right starting point.</h2></div><p>Clear scope and visible pricing. All prices are in Botswana pula (BWP); final scope is confirmed before work begins.</p></div>
        <div className="sd-catalogue-tools">
          <label className="sd-catalogue-search"><span aria-hidden="true">⌕</span><input type="search" value={catalogueSearch} onChange={event=>{setCatalogueSearch(event.target.value);if(event.target.value.trim())setCatalogueView("all");}} placeholder="Search logos, websites, operations…" aria-label="Search services"/></label>
          <div className="sd-catalogue-filters" role="group" aria-label="Service categories">
            {[["featured","Recommended"],["all","All services"],["identity","Brand identity"],["packages","Brand packages"]].map(([value,label])=><button key={value} type="button" className={catalogueView===value?"is-active":""} aria-pressed={catalogueView===value} onClick={()=>setCatalogueView(value as typeof catalogueView)}>{label}</button>)}
          </div>
        </div>
        <div className="sd-catalogue-resultline"><strong>{catalogueMatches.length} {catalogueMatches.length===1?"option":"options"}</strong><span>{catalogueView==="featured"?"A focused starting selection. Browse all services to see every option.":"Choose a service to carry it directly into your project enquiry."}</span></div>
        {catalogueMatches.length?<div className="sd-service-grid">{catalogueMatches.map((service,index)=><article className="sd-service-card" key={service.id}><div className={"sd-service-media sd-media-"+(index%4)} data-label={service.name}>{service.media&&service.mediaType==="video"?<video src={service.media} controls muted playsInline preload="metadata"/>:service.media?<img src={service.media} alt={service.name+" preview"} loading="lazy"/>:<div className="sd-media-placeholder"><span>DIRA CREATIVE · {service.kind==="package"?"PACKAGE":"SERVICE"}</span><strong>{service.name}</strong></div>}{service.featured&&<span className="sd-service-featured">Featured</span>}</div><div className="sd-service-info"><div className="sd-service-title"><h3>{service.name}</h3><strong>{servicePriceLabel(service)}</strong></div><p>{service.description}</p><button className="sd-order-button" onClick={()=>beginOrder(service)}>Choose this service <span>↗</span></button></div></article>)}</div>:<div className="sd-catalogue-empty"><strong>No matching services</strong><p>Try a different search or view all services.</p><button type="button" onClick={()=>{setCatalogueSearch("");setCatalogueView("all");}}>Show all services</button></div>}
      </section>
      <section className="sd-ultimate-package sd-wrap"><div><span className="sd-kicker">ULTIMATE / CUSTOM SCOPE</span><h3>Build a package around your goals.</h3><p>Tailored combinations of services, deliverables, strategic scope and budget. Pricing is confirmed after a discovery conversation.</p></div><a href="mailto:info.diracreative@gmail.com?subject=Ultimate%20Brand%20Package%20Enquiry">Discuss a custom package ↗</a></section>
      <section className="sd-approach sd-wrap" id="approach">
        <div className="sd-section-head sd-compact-section-head"><div><span className="sd-kicker">HOW WE BUILD</span><h2>Five stages. One direction.</h2></div><p>From a clear identity to stronger operations and sustainable growth.</p></div>
        <div className="sd-approach-grid">
          <article><span>01</span><h3>Define your identity</h3><p>Logo, colour, typography, iconography, graphic elements, imagery, illustration and layout.</p><small>A consistent, recognisable brand.</small></article>
          <article><span>02</span><h3>Establish your presence</h3><p>Company profiles, proposals, portfolios, pitch decks, business cards, websites, applications and maintenance.</p><small>Professional tools for communication.</small></article>
          <article><span>03</span><h3>Structure your operations</h3><p>Workflows, team structures, function mapping and practical operational support.</p><small>Clear roles and organised work.</small></article>
          <article><span>04</span><h3>Connect with your market</h3><p>Print, advertising, social media, promotional video, motion graphics and campaign assets.</p><small>Visibility and meaningful engagement.</small></article>
          <article><span>05</span><h3>Optimise for growth</h3><p>Asset management, revenue optimisation, gap analysis and strategic problem-solving.</p><small>Better decisions and sustainable performance.</small></article>
        </div>
      </section>
      <section className="sd-contact sd-wrap" id="contact">
        <div><span className="sd-kicker">START A CONVERSATION</span><h2>Let&apos;s build with intention.</h2><p>Tell us where your business is today and what you want to make possible next.</p></div>
        <div className="sd-contact-actions"><a href="mailto:info.diracreative@gmail.com">info.diracreative@gmail.com</a><a href="tel:+26774343719">+267 74 343 719</a><span>Gaborone, Botswana</span></div>
      </section>
      {orderFormOpen && <section className="sd-order-section sd-compact-order" id="service-order"><div className="sd-wrap sd-order-grid"><div className="sd-order-copy"><span className="sd-kicker">NEXT STEP</span><h2>Send a request</h2><p>Choose a service, tell us your target date and send the brief. Your date is a preference until reviewed.</p><div className="sd-order-note"><span>i</span><p><strong>Demo only.</strong><br/>No payment is taken and no delivery date is confirmed.</p></div></div><form className="sd-order-form" onSubmit={submitOrder}><div className="sd-form-heading"><button type="button" className="sd-form-close" onClick={() => setOrderFormOpen(false)} aria-label="Close request form">×</button><span>REQUEST DETAILS</span><strong>{selectedService?selectedService.name:"Choose a service"}</strong>{selectedService&&<b>{servicePriceLabel(selectedService)} <small>listed price</small></b>}</div><label>Service<select value={selected||""} onChange={event=>setSelected(event.target.value||null)} required><option value="">Select a service</option>{activeServices.map(service=><option key={service.id} value={service.id}>{service.name} — {servicePriceLabel(service)}</option>)}</select></label><div className="sd-form-two"><label>Your name<input value={customerName} onChange={event=>setCustomerName(event.target.value)} autoComplete="name" required placeholder="Name or business"/></label><label>Email<input value={email} onChange={event=>setEmail(event.target.value)} type="email" autoComplete="email" required placeholder="you@example.com"/></label></div><label>Target date<input type="date" value={dueDate} min={localDate()} onChange={event=>setDueDate(event.target.value)} required/><small>Your requested date is reviewed before confirmation.</small></label><label>Discount code <span className="sd-optional">OPTIONAL</span><input value={promoCode} onChange={event=>setPromoCode(event.target.value.toUpperCase())} placeholder="Enter a game reward code" /></label><label>Project details <span className="sd-optional">OPTIONAL</span><textarea value={brief} onChange={event=>setBrief(event.target.value)} rows={3} placeholder="What would you like to achieve?"/></label><button className="sd-button sd-primary sd-submit" type="submit">Send request →</button><p className="sd-privacy-note">Saved in this browser only · no payment taken</p></form></div></section>}
    </>}

    {view === "account" && <AccountWorkspace businessName={businessName.trim() || "Dira Creative"} orders={data.orders} discountClaims={data.discountClaims || []} receiptProfile={data.receiptProfile} accentColor={themeColor} email={email} setEmail={setEmail} online={online} announcement={data.announcement} onBrowse={() => { setView("shop"); setNotice(""); }} onUpdateOrder={(orderId, update, message) => { const at = new Date().toISOString(); commitData(current => ({ ...current, orders: current.orders.map(order => order.id === orderId ? update(order) : order), events: [{ id: "EV-" + Date.now().toString(36), kind: "request", label: message, at }, ...(current.events || [])] }), message); }} />}

    {view === "login" && <section className="sd-admin sd-wrap"><div className="sd-admin-panel sd-admin-login-card" style={{maxWidth:480,margin:"clamp(28px,8vh,84px) auto",padding:24}}><span className="sd-kicker">DIRA CREATIVE / OWNER ACCESS</span><h1 style={{fontSize:"clamp(1.8rem,5vw,2.5rem)",margin:"8px 0"}}>Open your <em>Briefcase.</em></h1><p className="sd-admin-help">This owner workspace is currently a local prototype. Production access controls and shared records will be connected after the approved database and authentication configuration is supplied.</p><form className="sd-admin-form" onSubmit={submitAdminLogin}><label>Demo access word<input type="password" autoComplete="off" value={adminPassphrase} onChange={event=>setAdminPassphrase(event.target.value)} placeholder="Enter access word" required /></label><button className="sd-button sd-primary" type="submit">Continue to admin →</button></form><p className="sd-admin-help" style={{marginTop:12}}>Prototype access word: <strong>admin</strong>. This browser-only gate is not production authentication and must not be used for confidential records.</p><button className="sd-button sd-outline" type="button" onClick={()=>{setView("shop");setNotice("");}}>← Back to Store</button></div></section>}

    {view === "admin" && adminUnlocked && <section className="sd-admin sd-wrap" data-admin-current={adminTab}><div className="sd-os-heading"><div><span className="sd-kicker">ROYALTY HOLDINGS / OWNER BRIEFCASE</span><h1>{businessName.trim() || "Dira Creative"}</h1><p>Owner operations · customer requests · money</p></div><span className="sd-os-status">LOCAL PREVIEW</span></div><section className="sd-business-identity" data-admin-tab="store" aria-label="Business identity">
  <div className="sd-business-identity-fields">
    <label>Operating brand name<input value={businessName} onChange={event => setBusinessName(event.target.value.slice(0, 48))} maxLength={48} autoComplete="organization" /></label>
    <small>This workspace is configured for Dira Creative under Royalty Holdings (Pty) Ltd. Change the operating brand name only when the organisation identity changes.</small>
  </div>
  <div className="sd-business-identity-preview" style={{borderColor:themeColor}}><span className="sd-kicker">LIVE BUSINESS IDENTITY</span><strong>{businessName.trim() || "Dira Creative"}</strong><small>Store · Account · Briefcase</small></div>
</section>
<div className="sd-theme-control" aria-label="Active business colour"><div><strong>Dira brand colour</strong><small>Primary dark-turquoise accent from the approved Dira Creative identity.</small></div><span aria-label={"Active colour "+themeColor} style={{display:"inline-block",width:28,height:28,borderRadius:"50%",background:themeColor,border:"2px solid #fff",boxShadow:"0 0 0 1px #777"}} /></div><nav className="sd-os-nav" aria-label="Business OS sections"><button type="button" aria-pressed={adminTab==="today"} onClick={()=>setAdminTab("today")}>Today</button><button type="button" aria-pressed={adminTab==="work"} onClick={()=>setAdminTab("work")}>Customers &amp; jobs</button><button type="button" aria-pressed={adminTab==="money"} onClick={()=>setAdminTab("money")}>Money</button><button type="button" aria-pressed={adminTab==="store"} onClick={()=>setAdminTab("store")}>Store design</button><button type="button" aria-pressed={adminTab==="notes"} onClick={()=>setAdminTab("notes")}>My Notes</button><button type="button" aria-pressed={adminTab==="insights"} onClick={()=>setAdminTab("insights")}>Insights</button><button type="button" aria-pressed={adminTab==="calendar"} onClick={()=>setAdminTab("calendar")}>Calendar</button></nav><div className="sd-admin-head"><div><span className="sd-kicker">OPERATIONS / LOCAL DEMO</span><h2>Today at a glance</h2><p>Review work, customer activity and money. Changes stay on this device.</p></div><div className="sd-admin-head-actions"><button className="sd-button sd-outline" onClick={() => setView("shop")}>View storefront ↗</button><button className="sd-button sd-outline" onClick={() => { if (hasFirebaseWebConfig) window.location.assign("/account"); else setView("account"); }}>Customer account ↗</button></div></div><div className="sd-stats" id="admin-today" data-admin-tab="today"><article><span>Submitted requests</span><strong>{data.orders.length}</strong><small>{data.views > 0 ? Math.round(data.orders.length / data.views * 100) : 0}% visit-to-request rate</small></article><article><span>New requests</span><strong>{statusCounts["New request"] || 0}</strong><small>{data.orders.length ? Math.round((statusCounts["New request"] || 0) / data.orders.length * 100) : 0}% of requests</small></article><article><span>Menu services</span><strong>{data.services.length}</strong><small>{data.services.length ? Math.round(activeServices.length / data.services.length * 100) : 0}% visible</small></article><article><span>Customer emails</span><strong>{new Set(data.orders.map(order => order.email.toLowerCase())).size}</strong><small>{data.orders.length ? Math.round(new Set(data.orders.map(order => order.email.toLowerCase())).size / data.orders.length * 100) : 0}% unique emails per request count</small></article><article><span>Store visits this demo</span><strong>{data.views}</strong><small>Local browser count · not unique visitors</small></article></div><section className="sd-admin-panel sd-finance-panel" id="admin-finance" data-admin-tab="money"><div className="sd-discount-admin"><div className="sd-panel-head"><div><span className="sd-kicker">CLIENT RELATIONSHIPS</span><h3>Customer discounts</h3><p className="sd-admin-help">Issue a one-use discount code for a specific customer email. Codes are saved in this browser preview.</p></div><span className="sd-local-pill">OWNER CONTROLLED</span></div><div className="sd-reward-editor"><label>Discount amount · BWP<input type="number" min="0.01" max="5000" step="0.01" value={discountAmountDraft} onChange={event=>setDiscountAmountDraft(event.target.value)} /></label><label>Customer email<input type="email" value={promoAssignEmail} onChange={event=>setPromoAssignEmail(event.target.value)} placeholder="customer@example.com" /></label><button className="sd-small-button" type="button" onClick={assignPromoReward}>Issue one-use discount code →</button><div className="sd-discount-claims">{(data.discountClaims || []).length ? (data.discountClaims || []).slice(0,8).map(claim=><article key={claim.id}><strong>{claim.code}</strong><span>{claim.email}</span><b>{money(claim.amount)} · {claim.status}</b></article>) : <p className="sd-admin-empty">No customer discounts issued yet.</p>}</div></div></div>
<div className="sd-panel-head"><div><span className="sd-kicker">FINANCE / LOCAL DEMO LEDGER</span><h2>Money &amp; receipts</h2></div><span className="sd-local-pill">SIMULATED RECORDS</span></div>
<div className="sd-finance-metrics"><article><small>Payments received</small><strong>{money(paidTotal)}</strong></article><article><small>Completed value</small><strong>{money(completedValue)}</strong></article><article><small>Projected · accepted / active</small><strong>{money(projectedValue)}</strong></article><article><small>Requested value · excluding declined</small><strong>{money(requestedValue)}</strong></article><article><small>Completed · unpaid</small><strong>{money(completedUnpaid)}</strong></article></div>
<p className="sd-admin-help">Paid totals include only payments recorded in this demo. Completed-unpaid and active pipeline are estimates, not cash received.</p>
<div className="sd-receipt-profile"><h3>Business details on receipts</h3><p className="sd-admin-help">Use the business&apos;s own details and tax references in this prototype document.</p>
<div className="sd-form-two">
<label>Registered / legal name (if different)<input value={data.receiptProfile?.legalName || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),legalName:event.target.value}}),"Receipt business name saved on this device.")}/></label>
<label>Tax / BURS reference<input value={data.receiptProfile?.registration || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),registration:event.target.value}}),"Tax reference saved on this device.")}/></label>
<label>Business address<input value={data.receiptProfile?.address || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),address:event.target.value}}),"Receipt address saved on this device.")}/></label>
<label>Contact number<input value={data.receiptProfile?.phone || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),phone:event.target.value}}),"Receipt contact saved on this device.")}/></label></div>
<label className="sd-admin-label">Receipt footer / tax note<textarea rows={2} value={data.receiptProfile?.footer || ""} onChange={event=>commitData(current=>({...current,receiptProfile:{...emptyData.receiptProfile!,...(current.receiptProfile||{}),footer:event.target.value}}),"Receipt footer saved on this device.")}/></label></div></section>
<section className="sd-admin-panel sd-calendar-panel" id="admin-calendar" data-admin-tab="calendar"><div className="sd-panel-head"><div><span className="sd-kicker">CLIENT TIMELINES</span><h2>Calendar</h2></div><span className="sd-local-pill">{data.orders.length} REQUESTED DATES</span></div><p className="sd-admin-help">These are customer-requested timeline dates, not confirmed delivery commitments. Review each request before agreeing a schedule.</p>{data.orders.length ? <div className="sd-calendar-list">{data.orders.slice().sort((a,b)=>a.dueDate.localeCompare(b.dueDate)).map(order=><article key={order.id}><div><strong>{order.serviceName}</strong><small>{order.customerName} · {order.email}</small></div><time dateTime={order.dueDate}>{new Date(order.dueDate+"T12:00:00").toLocaleDateString("en-BW",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}</time><span>{order.status}</span></article>)}</div> : <p className="sd-admin-empty">Requested dates appear here after a customer submits a service enquiry.</p>}<button className="sd-button sd-outline" type="button" onClick={()=>setAdminTab("work")}>Review customer requests →</button></section><section className="sd-admin-panel sd-customers-panel" id="admin-customers" data-admin-tab="work"><div className="sd-panel-head"><div><span className="sd-kicker">CUSTOMER DIRECTORY</span><h2>Customers</h2></div><span className="sd-local-pill">{customerRecords.length} DEMO CONTACTS</span></div>
{customerRecords.length ? <div className="sd-customer-list">{customerRecords.map(customer=><article key={customer.email}><div><strong>{customer.name}</strong><span>{customer.email}</span></div><b>{customer.jobs.length} {customer.jobs.length===1?"job":"jobs"}</b><small>{money(customer.jobs.reduce((sum,job)=>sum+job.price,0))} total request value</small></article>)}</div> : <p className="sd-admin-empty">Customer profiles appear here when someone submits a Store request.</p>}</section><section className="sd-admin-panel sd-activity-panel" id="admin-activity" data-admin-tab="insights"><div className="sd-panel-head"><div><span className="sd-kicker">ACTIVITY / DEMO EVENT LOG</span><h2>What happened</h2></div><span className="sd-local-pill">THIS BROWSER</span></div><div className="sd-activity-summary"><span><strong>{data.views}</strong> Store visits recorded</span><span><strong>{data.orders.length}</strong> requests / jobs</span><span><strong>{data.events?.length || 0}</strong> recent events</span></div><div className="sd-event-list">{(data.events || []).slice(0,8).map(event=><article key={event.id}><i className={"sd-event-dot "+(event.test?"is-test":"")}/><div><strong>{event.label}</strong><small>{new Date(event.at).toLocaleString()} {event.test?"· TEST":""}</small></div></article>)}</div><p className="sd-admin-help">Vercel Analytics and Speed Insights are included at application level. This prototype shows the local event trail tied to the demo customer and job records; it does not fetch private Vercel dashboard analytics or connect Firebase Analytics.</p></section><section className="sd-admin-panel sd-admin-performance" data-admin-tab="insights"><div className="sd-panel-head"><div><span className="sd-kicker">04 / DEMO PERFORMANCE</span><h2>Conversion &amp; operations</h2></div><span className="sd-local-pill">LOCAL DEMO DATA</span></div><p className="sd-admin-help">Percentages are calculated from this browser’s saved demo counts only. They are directional indicators, not shared production analytics.</p><div className="sd-performance-grid"><article><div><span>Visit to request</span><strong>{data.views > 0 ? Math.round(data.orders.length / data.views * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${Math.min(100, data.views > 0 ? data.orders.length / data.views * 100 : 0)}%`}} /></div><small>{data.orders.length} requests from {data.views} recorded visits</small></article><article><div><span>Visible service menu</span><strong>{data.services.length ? Math.round(activeServices.length / data.services.length * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${data.services.length ? activeServices.length / data.services.length * 100 : 0}%`}} /></div><small>{activeServices.length} of {data.services.length} services visible</small></article><article><div><span>Requests needing attention</span><strong>{data.orders.length ? Math.round((data.orders.length - (statusCounts["Completed"] || 0) - (statusCounts["Declined"] || 0)) / data.orders.length * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${data.orders.length ? (data.orders.length - (statusCounts["Completed"] || 0) - (statusCounts["Declined"] || 0)) / data.orders.length * 100 : 0}%`}} /></div><small>{data.orders.length - (statusCounts["Completed"] || 0) - (statusCounts["Declined"] || 0)} active of {data.orders.length} requests</small></article><article><div><span>New request share</span><strong>{data.orders.length ? Math.round((statusCounts["New request"] || 0) / data.orders.length * 100) : 0}%</strong></div><div className="sd-performance-track"><span style={{width: `${data.orders.length ? (statusCounts["New request"] || 0) / data.orders.length * 100 : 0}%`}} /></div><small>{statusCounts["New request"] || 0} new of {data.orders.length} requests</small></article></div></section>
      <section className="sd-admin-panel sd-showcase-preview" data-admin-tab="store" aria-live="polite">
  <div className="sd-panel-head"><div><span className="sd-kicker"><span aria-hidden="true">🏪</span> LIVE STOREFRONT / SHOWCASE</span><h2>{businessName.trim() || "Dira Creative"}</h2></div><span className="sd-local-pill">DISPLAYING IN LOCAL PREVIEW</span></div>
  <div className="sd-showcase-preview-head"><div><span>DIRA CREATIVE / CUSTOMER VIEW</span><strong>What customers see</strong><p>Dira&apos;s brand colour, operating name and currently visible services.</p></div><button className="sd-small-button" type="button" onClick={() => { setView("shop"); window.scrollTo({top:0,behavior:"smooth"}); }}>Open full Store ↗</button></div>
  {(data.announcement.trim() || data.announcementImage) && <section className="sd-announcement sd-showcase-announcement"><div className="sd-wrap"><span><span aria-hidden="true">📣</span> DIRA CREATIVE / ANNOUNCEMENT</span>{data.announcementImage && <img className="sd-announcement-thumb" src={data.announcementImage} alt={data.announcement.slice(0, 120) || "Announcement image"} />}<p>{data.announcement}</p></div></section>}
  <div className="sd-showcase-preview-grid">{activeServices.length ? activeServices.map((service,index)=><article key={service.id}><div className="sd-showcase-preview-media sd-service-media">{service.media&&service.mediaType==="video"?<video src={service.media} muted playsInline controls preload="metadata"/>:service.media?<img src={service.media} alt={service.name+" preview"} loading="lazy"/>:<div className="sd-showcase-media-fallback"><span>{serviceEmoji(service.name)}</span></div>}<span className="sd-service-emoji" aria-hidden="true">{serviceEmoji(service.name)}</span></div><div className="sd-showcase-preview-copy"><span className="sd-showcase-preview-index">0{index+1}</span><strong>{service.name}</strong><b>{money(service.price)}</b><p>{service.description || "A service from this business."}</p></div></article>) : <p className="sd-admin-empty">No visible products or services yet. Add one below to populate the Store preview.</p>}</div>
  <div className="sd-showcase-footer"><button className="sd-brand sd-owner-entry" type="button" disabled aria-label="Preview of the owner Briefcase footer link"><span className="sd-briefcase-mark" aria-hidden="true">💼</span><span className="sd-owner-entry-copy"><strong>Dira Creative</strong><small>OPEN OWNER BRIEFCASE</small><em>{businessName || "Dira Creative"}</em></span><span className="sd-owner-entry-arrow" aria-hidden="true">↗</span></button><p>Built to be explored online and offline.</p><div><span>My account</span><span>Store links</span></div></div><p className="sd-admin-help">Preview updates from the same local demo data as your Store. The footer Briefcase card matches the customer-facing Store. Saving, hiding or deleting a service changes this showcase; it does not publish a live customer website.</p>
</section>
<div className="sd-admin-grid"><section className="sd-admin-panel" id="admin-service-tools"><div className="sd-panel-head"><div><span className="sd-kicker">01 / SERVICE CRUD</span><h2>Service menu</h2></div><button className="sd-small-button" onClick={() => { resetServiceForm(); setNotice("New service form ready."); }}>+ New service</button></div><div className="sd-admin-services">{data.services.map(service => <article key={service.id}><div><strong>{service.name}</strong><span>{money(service.price)} · {service.active ? "Visible" : "Hidden"}</span></div><div className="sd-row-actions"><button onClick={() => { startEdit(service); setNotice(`Editing ${service.name}. Save your changes when ready.`); }}>Edit</button><button onClick={() => toggleService(service)}>{service.active ? "Hide" : "Show"}</button><button className="sd-danger" onClick={() => setPendingConfirm({ kind: "delete-service", serviceId: service.id, serviceName: service.name })}>Delete</button></div></article>)}</div>
      <form className="sd-admin-form" id="admin-service-form" onSubmit={saveService}><h3>{editingId ? "Edit service" : "Add a service"}</h3><label>Service name<input value={serviceName} onChange={event => setServiceName(event.target.value)} required /></label><label>Price in Pula<input type="number" min="0" step="1" value={servicePrice} onChange={event => setServicePrice(event.target.value)} required /></label><label>Description<textarea rows={3} value={serviceDescription} onChange={event => setServiceDescription(event.target.value)} /></label><ServiceMediaPicker value={serviceMedia} type={serviceMediaType} online={online} onChange={(url, type) => { setServiceMedia(url); setServiceMediaType(type); }} onUploadingChange={setServiceMediaUploading} /><label className="sd-check"><input type="checkbox" checked={serviceActive} onChange={event => setServiceActive(event.target.checked)} /> Show on customer storefront</label><div className="sd-form-two"><button className="sd-button sd-primary" type="submit" disabled={serviceMediaUploading}>{serviceMediaUploading ? "Uploading media…" : editingId ? "Save changes" : "Add service"}</button><button className="sd-button sd-outline" type="button" onClick={resetServiceForm}>Cancel</button></div></form></section>
      <section className="sd-admin-panel" id="admin-announcement-tools"><div className="sd-panel-head"><div><span className="sd-kicker">02 / CUSTOMER NOTICE</span><h2>Special announcement</h2></div></div><p className="sd-admin-help">Publish a short promotion or service update. Leave both fields empty to remove it from the storefront.</p><label className="sd-admin-label">Announcement<textarea rows={4} value={announcementDraft} onChange={event => setAnnouncementDraft(event.target.value)} placeholder="Example: Book your next project this month…" /></label><AnnouncementImagePicker value={announcementImageDraft} online={online} onChange={setAnnouncementImageDraft} onUploadingChange={setAnnouncementImageUploading} /><button className="sd-button sd-primary" disabled={announcementImageUploading} onClick={() => { const announcement = announcementDraft.trim(); const announcementImage = announcementImageDraft.trim(); if (announcementImage) { try { const parsed = new URL(announcementImage); if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Unsupported protocol"); } catch { setNotice("Enter a valid image URL or upload the thumbnail before publishing."); return; } } commitData(current => ({ ...current, announcement, announcementImage }), announcement || announcementImage ? "Announcement published on this device." : "Announcement cleared from the storefront."); }}>{announcementImageUploading ? "Uploading thumbnail…" : "Publish announcement"}</button><div className="sd-live-preview"><span>STOREFRONT PREVIEW</span>{(announcementDraft.trim() || announcementImageDraft.trim()) ? <div className="sd-announcement sd-announcement-preview"><div className="sd-wrap"><span><span aria-hidden="true">📣</span> DIRA CREATIVE / ANNOUNCEMENT</span>{announcementImageDraft.trim() && <img className="sd-announcement-thumb" src={announcementImageDraft} alt={announcementDraft.slice(0, 120) || "Announcement image"} />}<p>{announcementDraft.trim()}</p></div></div> : <p>Your announcement banner will appear here when published.</p>}</div><div className="sd-panel-head sd-request-head" id="admin-requests-tools"><div><span className="sd-kicker">03 / INCOMING WORK</span><h2>Customer requests</h2></div></div>{data.orders.length === 0 ? <div className="sd-admin-empty">No requests yet. Submit a customer request from the Store to see it appear here.</div> : <div className="sd-admin-orders">{data.orders.map(order => <article key={order.id}><div className="sd-admin-order-top"><strong>{order.serviceName} · {order.priceIsStarting ? "From " : ""}{money(order.price)} {order.isTest && <span className="sd-test-label">TEST</span>}</strong><span>{order.id}</span></div><p>{order.customerName} · {order.email}</p><p>Requested date: <b>{order.dueDate}</b></p><p>Payment: <b>{order.paymentStatus || "Unpaid"}</b> · {money(order.paidAmount || 0)} received · {money(Math.max(0,order.price-(order.paidAmount||0)))} due</p>{order.discountAmount ? <p>Discount: <b>{money(order.discountAmount)} off · {order.discountCode}</b> (regular {money(order.originalPrice || order.price + order.discountAmount)})</p> : null}{order.brief && <p>{order.brief}</p>}<div className="sd-project-task-list"><div><strong>Project tasks</strong><small>{(order.tasks || []).filter(task=>task.done).length} of {(order.tasks || []).length} complete</small></div>{(order.tasks || []).map(task=><label key={task.id}><input type="checkbox" checked={task.done} onChange={()=>toggleProjectTask(order.id,task.id)}/><span className={task.done?"is-done":""}>{task.title}</span></label>)}<form onSubmit={event=>{event.preventDefault();addProjectTask(order.id);}}><input value={taskDrafts[order.id] || ""} onChange={event=>setTaskDrafts(current=>({...current,[order.id]:event.target.value}))} placeholder="Add a project task" aria-label={"New project task for "+order.serviceName}/><button className="sd-small-button" type="submit">Add task</button></form></div><div className="sd-quote-editor"><div><strong>Proposal / quote</strong><small>{order.quoteStatus || "Not prepared"}{order.quoteAmount ? " · " + money(order.quoteAmount) : ""}</small></div><div><input type="number" min="0.01" max="100000000" step="0.01" value={quoteDrafts[order.id] ?? String(order.quoteAmount ?? order.price)} onChange={event=>setQuoteDrafts(current=>({...current,[order.id]:event.target.value}))} aria-label={"Quote amount for "+order.serviceName}/><button className="sd-small-button" type="button" onClick={()=>sendQuote(order.id,Number(quoteDrafts[order.id] ?? order.quoteAmount ?? order.price))}>Send quote</button></div><small>Customer can approve or decline the proposal from their account.</small></div><div className="sd-order-admin-actions">{["Accepted", "In progress", "Completed"].includes(order.status) && !order.priceIsStarting && Math.max(0, order.price - (order.paidAmount || 0)) > 0 && <label className="sd-payment-entry">Record payment (demo)<span><input type="number" min="0.01" max={Math.max(0, order.price - (order.paidAmount || 0))} step="0.01" value={paymentDrafts[order.id] ?? String(Math.max(0, order.price - (order.paidAmount || 0)))} onChange={event=>setPaymentDrafts(current=>({...current,[order.id]:event.target.value}))} aria-label={"Payment amount for "+order.serviceName}/><button className="sd-small-button" type="button" onClick={()=>recordDemoPayment(order.id,Number(paymentDrafts[order.id] ?? Math.max(0, order.price - (order.paidAmount || 0))))}>Record amount</button></span></label>}<label>Request status<select value={order.status} onChange={event => updateOrder(order.id, event.target.value)}><option>New request</option><option>Reviewing</option><option>Accepted</option><option>In progress</option><option>Completed</option><option>Declined</option></select></label></div><ReceiptDocument businessName={businessName.trim() || "Dira Creative"} accentColor={themeColor} receiptProfile={data.receiptProfile} order={order}/><div className="sd-admin-thread"><strong>Customer conversation · {(order.messages || []).length} messages</strong>{(order.messages || []).map(message => <div className={"sd-admin-thread-message is-" + message.from} key={message.id}><b>{message.from === "customer" ? "Customer" : "Dira Creative"}</b><small>{new Date(message.createdAt).toLocaleString()}</small>{message.text && <p>{message.text}</p>}{message.attachment && <a href={message.attachment.url} target="_blank" rel="noreferrer">↗ {message.attachment.name}</a>}</div>)}<form onSubmit={event => { event.preventDefault(); replyToOrder(order.id); }}><label>Reply to customer<textarea rows={2} value={adminReplyDrafts[order.id] || ""} onChange={event => setAdminReplyDrafts(current => ({ ...current, [order.id]: event.target.value }))} placeholder="Write a project update or question…" maxLength={1200}/></label><button className="sd-small-button" type="submit" disabled={!(adminReplyDrafts[order.id] || "").trim()}>Save reply to local thread →</button></form></div></article>)}</div>}</section></div><section className="sd-admin-panel sd-owner-notes" id="admin-notes" data-admin-tab="notes"><div className="sd-panel-head"><div><span className="sd-kicker">PRIVATE BRIEFCASE / NOTES</span><h2>My Notes</h2></div><span className="sd-local-pill">THIS DEVICE</span></div><p className="sd-admin-help">Capture priorities, decisions, reminders and ideas for the business. Notes are private to this browser profile in this demo; they are not synced or encrypted as an owner account.</p><label className="sd-admin-label" htmlFor="owner-notes">Working notes</label><textarea id="owner-notes" rows={8} maxLength={12000} value={ownerNotes} onChange={event => setOwnerNotes(event.target.value)} placeholder="Today’s priorities…&#10;Decisions to revisit…&#10;Ideas to develop…" /><div className="sd-notes-meta"><span>{ownerNotes.length.toLocaleString()} / 12,000 characters</span><span>{notesReady ? "Auto-saves on this device" : "Loading notes…"}</span></div></section><div className="sd-admin-footer"><button className="sd-button sd-outline" onClick={() => setPendingConfirm({ kind: "reset-demo" })}>Reset demo data</button><p>Prototype only · no Firebase · no shared admin/customer records</p></div></section>}

    <ServiceGuide view={view === "admin" ? "admin" : view === "account" ? "account" : "shop"} services={servicesForDisplay} requestCount={data.orders.length} onChooseService={beginOrder} onOpenAccount={() => { if (hasFirebaseWebConfig) window.location.assign("/account"); else { setView("account"); setNotice(""); } }} onOpenAdmin={openAdminGuide} onOpenStorefront={() => { setView("shop"); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
    <footer className="sd-footer"><div className="sd-wrap sd-footer-inner"><button className="sd-brand sd-owner-entry" onClick={() => { requestAdminLogin(); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-label={`Open ${businessName || "Dira Creative"} owner Briefcase`}><span className="sd-briefcase-mark" aria-hidden="true">💼</span><span className="sd-owner-entry-copy"><strong>Dira Creative</strong><small>OPEN OWNER BRIEFCASE</small><em>{businessName || "Dira Creative"}</em></span><span className="sd-owner-entry-arrow" aria-hidden="true">↗</span></button><p>Built to be explored online and offline.</p><div><button onClick={() => { if (hasFirebaseWebConfig) window.location.assign("/account"); else { setView("account"); setNotice(""); } }}>My account</button><Link href="/patterns">App installation</Link></div></div></footer>
    {pendingConfirm && <div className="sd-confirm-backdrop" onClick={() => setPendingConfirm(null)}><section className="sd-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="sd-confirm-title" aria-describedby="sd-confirm-description" onClick={event => event.stopPropagation()}><span className="sd-kicker">CONFIRM ACTION</span><h2 id="sd-confirm-title">{pendingConfirm.kind === "reset-demo" ? "Reset demo data?" : `Delete ${pendingConfirm.serviceName || "this service"}?`}</h2><p id="sd-confirm-description">{pendingConfirm.kind === "reset-demo" ? "This clears local requests, service edits and the announcement, restoring the starter examples on this device." : "This removes the service from this browser demo. Existing requests keep their saved service name and price."}</p><div className="sd-confirm-actions"><button type="button" className="sd-button sd-outline" autoFocus onClick={() => setPendingConfirm(null)}>Keep it</button><button type="button" className="sd-button sd-primary" onClick={() => { const action = pendingConfirm; setPendingConfirm(null); if (action.kind === "reset-demo") { if (commitData(() => ({ ...emptyData, views: data.views }), "Demo data reset on this device.")) { setAnnouncementDraft(""); setAnnouncementImageDraft(""); resetServiceForm(); } } else if (action.serviceId) { if (commitData(current => ({ ...current, services: current.services.filter(item => item.id !== action.serviceId) }), `${action.serviceName || "Service"} deleted from this demo.`) && editingId === action.serviceId) resetServiceForm(); } }}>Confirm</button></div></section></div>}
    {notice && <div className="sd-toast-region"><div className={"sd-toast" + (/^(Choose|Add |Enter |The browser|Local demo storage|Could not save)/i.test(notice) ? " is-error" : " is-success")} role={/^(Choose|Add |Enter |The browser|Local demo storage|Could not save)/i.test(notice) ? "alert" : "status"}><span className="sd-toast-mark" aria-hidden="true">{/^(Choose|Add |Enter |The browser|Local demo storage|Could not save)/i.test(notice) ? "!" : "✓"}</span><p>{notice}</p><button type="button" aria-label="Dismiss message" onClick={() => setNotice("")}>×</button></div></div>}
  </main>;
}
