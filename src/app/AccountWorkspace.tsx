"use client";

import { useEffect, useMemo, useState } from "react";
import ReceiptDocument, { type ReceiptProfile } from "@/app/ReceiptDocument";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

export type AccountAttachment = { name: string; url: string; type: string; size: number };
export type AccountMessage = { id: string; from: "customer" | "studio"; text: string; createdAt: string; attachment?: AccountAttachment };
export type WorkspaceOrder = { id: string; serviceId: string; serviceName: string; price: number; originalPrice?: number; discountAmount?: number; discountCode?: string; receiptNo?: string; paidAmount?: number; paidAt?: string; paymentStatus?: "Unpaid" | "Partially paid (demo)" | "Paid (demo)"; dueDate: string; customerName: string; email: string; brief: string; status: string; createdAt: string; tasks?: { id: string; title: string; done: boolean }[]; quoteAmount?: number; quoteStatus?: "Not prepared" | "Sent" | "Approved" | "Declined"; messages?: AccountMessage[] };

type DiscountClaim = { id: string; email: string; code: string; amount: number; createdAt: string; status: "Available" | "Redeemed" };
type Props = {
  businessName: string;
  orders: WorkspaceOrder[];
  discountClaims: DiscountClaim[];
  receiptProfile?: ReceiptProfile;
  accentColor: string;
  email: string;
  setEmail: (email: string) => void;
  online: boolean;
  announcement: string;
  onBrowse: () => void;
  onUpdateOrder: (orderId: string, update: (order: WorkspaceOrder) => WorkspaceOrder, notice: string) => void;
};

const money = (amount: number) => "P" + amount.toLocaleString("en-BW", { maximumFractionDigits: 2 });
const prettyDate = (value: string) => {
  try { return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }
  catch { return value; }
};

export default function AccountWorkspace({ businessName, orders, discountClaims, receiptProfile, accentColor, email, setEmail, online, announcement, onBrowse, onUpdateOrder }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [uploadingOrder, setUploadingOrder] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadNotice, setUploadNotice] = useState("");
  const [gardenSeeds, setGardenSeeds] = useState(0); // Retained only to read older browser-local demo state.
  const [projectSteps, setProjectSteps] = useState<string[]>([]);
  const [journal, setJournal] = useState("");
  const [savedJournal, setSavedJournal] = useState("");
  const [extrasReady, setExtrasReady] = useState(false);
  const [projectTips, setProjectTips] = useState(true);
  const [studioNotes, setStudioNotes] = useState(true);
  const [openThread, setOpenThread] = useState<string | null>(null);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("dira-creative:account-extras:v1");
      if (saved) {
        const parsed = JSON.parse(saved) as { gardenSeeds?: number; projectSteps?: string[]; savedJournal?: string; projectTips?: boolean; studioNotes?: boolean };
        setGardenSeeds(Number.isFinite(parsed.gardenSeeds) ? Math.max(0, Number(parsed.gardenSeeds)) : 0);
        setProjectSteps(Array.isArray(parsed.projectSteps) ? parsed.projectSteps.filter((step): step is string => typeof step === "string") : []);
        setJournal(typeof parsed.savedJournal === "string" ? parsed.savedJournal.slice(0, 500) : "");
        setSavedJournal(typeof parsed.savedJournal === "string" ? parsed.savedJournal.slice(0, 500) : "");
        setProjectTips(parsed.projectTips !== false);
        setStudioNotes(parsed.studioNotes !== false);
      }
    } catch { /* Account extras are optional when browser storage is blocked. */ }
    setExtrasReady(true);
  }, []);

  useEffect(() => {
    if (!extrasReady) return;
    try { window.localStorage.setItem("dira-creative:account-extras:v1", JSON.stringify({ gardenSeeds, projectSteps, savedJournal, projectTips, studioNotes })); }
    catch { /* Order history and messages remain usable if optional extras cannot be saved. */ }
  }, [extrasReady, gardenSeeds, projectSteps, savedJournal, projectTips, studioNotes]);

  const { startUpload, isUploading } = useUploadThing("fileUploader", {
    onUploadProgress: progress => setUploadProgress(Math.max(0, Math.min(100, Math.round(progress)))),
    onUploadError: error => { setUploadNotice(error.message || "Upload failed. Your message has not been sent."); setUploadingOrder(null); setUploadProgress(0); },
  });

  const filteredOrders = useMemo(() => orders.filter(order => !email.trim() || order.email.toLowerCase() === email.trim().toLowerCase()), [orders, email]);
  const totalMessages = filteredOrders.reduce((total, order) => total + (order.messages?.length || 0), 0);
  const openOrders = filteredOrders.filter(order => !["Completed", "Declined"].includes(order.status)).length;
  const fileCount = filteredOrders.reduce((total, order) => total + (order.messages || []).filter(message => Boolean(message.attachment)).length, 0);

  function sendMessage(order: WorkspaceOrder, attachment?: AccountAttachment) {
    const text = (drafts[order.id] || "").trim();
    if (!text && !attachment) { setUploadNotice("Write a message or attach a file before sending."); return; }
    const message: AccountMessage = { id: "MSG-" + Date.now().toString(36), from: "customer", text, createdAt: new Date().toISOString(), ...(attachment ? { attachment } : {}) };
    onUpdateOrder(order.id, current => ({ ...current, messages: [...(current.messages || []), message] }), "Message saved in this browser's demo thread. Dira Creative can see it in the owner workspace on this device.");
    setDrafts(current => ({ ...current, [order.id]: "" }));
    setUploadNotice("Message added to this local demo thread.");
    setOpenThread(order.id);
  }

  async function attachFile(order: WorkspaceOrder, event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const accepted = file.type.startsWith("image/") || file.type.startsWith("video/") || file.type === "application/pdf";
    if (!accepted) { setUploadNotice("Choose an image, video or PDF file."); event.target.value = ""; return; }
    const max = file.type.startsWith("video/") ? 16 * 1024 * 1024 : 4 * 1024 * 1024;
    if (file.size > max) { setUploadNotice(file.type.startsWith("video/") ? "Videos must be 16 MB or smaller." : "Images and PDFs must be 4 MB or smaller."); event.target.value = ""; return; }
    if (!online || !navigator.onLine) { setUploadNotice("Offline: you can still send a text message, but file uploads need internet. Nothing was uploaded."); event.target.value = ""; return; }
    setUploadingOrder(order.id); setUploadProgress(0); setUploadNotice("Uploading attachment. Keep this page open.");
    try {
      const uploaded = await startUpload([file]);
      const result = uploaded?.[0];
      const url = result?.ufsUrl || result?.url;
      if (!url) { setUploadNotice("Upload completed without a file link. Please try again."); setUploadingOrder(null); return; }
      sendMessage(order, { name: file.name, url, type: file.type, size: file.size });
      setUploadNotice("Attachment uploaded and added to the local demo thread.");
    } catch {
      setUploadNotice("Upload failed. Check your connection and try again; the message was not sent.");
    } finally {
      setUploadingOrder(null); setUploadProgress(0); event.target.value = "";
    }
  }

  return <section className="sd-account sd-wrap">
    <div className="sd-account-head">
      <span className="sd-kicker">{businessName.toUpperCase()} / CUSTOMER ACCOUNT</span>
      <h1>Your projects.<br/><em>All here.</em></h1>
      <p>Track requests, share files, and keep project messages together. This prototype stores account activity in this browser, not in a shared customer account.</p>
      <button className="sd-button sd-outline" onClick={onBrowse}>＋ Make another request</button>
    </div>
    <div className="sd-account-content"><section className="sd-account-rewards"><div><span className="sd-kicker">CUSTOMER DISCOUNTS</span><h2>Your discounts</h2><p>Dira Creative may issue a one-use discount code for this email. Apply an available code when you submit your next request.</p></div>{discountClaims.filter(claim=>claim.email.toLowerCase()===email.trim().toLowerCase()).length ? discountClaims.filter(claim=>claim.email.toLowerCase()===email.trim().toLowerCase()).map(claim=><article key={claim.id}><strong>{claim.code}</strong><b>{money(claim.amount)} off</b><span>{claim.status}</span></article>) : <p>No discount codes have been issued to this email yet.</p>}</section>
      <div className="sd-account-filter"><label>Find your requests by email<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="The email used on your order" autoComplete="email" /></label><span>{filteredOrders.length} {filteredOrders.length === 1 ? "project" : "projects"} found</span></div>
      <div className="sd-account-stats"><article><span>Active projects</span><strong>{openOrders}</strong><small>Not completed or declined</small></article><article><span>Conversation</span><strong>{totalMessages}</strong><small>Saved local messages</small></article><article><span>Shared files</span><strong>{fileCount}</strong><small>Attachments in your threads</small></article></div>
      {filteredOrders.length === 0 ? <div className="sd-empty"><span>↗</span><h2>Your next project starts here.</h2><p>No matching requests on this browser yet. Use the same browser and email you entered when submitting a service request.</p><button className="sd-button sd-primary" onClick={onBrowse}>Browse services →</button></div> : <div className="sd-orders">{filteredOrders.map(order => {
        const messages = order.messages || [];
        const expanded = openThread === order.id;
        return <article className="sd-order-card sd-workspace-order" key={order.id}>
          <div className="sd-order-card-top"><span>{order.id}</span><b>{order.status}</b></div>
          <div className="sd-order-card-main"><div><h2>{order.serviceName}</h2><p>Requested timeline: <strong>{order.dueDate}</strong></p><p>{order.brief || "No extra brief added."}</p>{order.discountAmount ? <p className="sd-account-discount">Client promotion · {money(order.discountAmount)} off (regular {money(order.originalPrice || order.price + order.discountAmount)})</p> : null}<small>Submitted {prettyDate(order.createdAt)}</small></div><strong className="sd-order-price">{money(order.price)}</strong></div>
          <div className="sd-client-task-list">{(order.tasks || []).length > 0 && <><div><strong>Project progress</strong><small>{(order.tasks || []).filter(task=>task.done).length} of {(order.tasks || []).length} tasks complete</small></div>{(order.tasks || []).map(task=><div key={task.id} className={task.done?"is-done":""}><span aria-hidden="true">{task.done?"✓":"○"}</span>{task.title}</div>)}</>}</div>
          {order.quoteStatus === "Sent" && Number(order.quoteAmount) > 0 && <section className="sd-client-quote"><div><span className="sd-kicker">PROPOSAL READY FOR REVIEW</span><strong>{money(Number(order.quoteAmount))}</strong></div><p>Review the proposed amount and scope with Dira Creative. Approving confirms this quote for the project; no payment is taken here.</p><div><button className="sd-button sd-primary" type="button" onClick={()=>onUpdateOrder(order.id,current=>({...current,price:Number(current.quoteAmount)||current.price,quoteStatus:"Approved",status:"Accepted",messages:[...(current.messages||[]),{id:"MSG-"+Date.now().toString(36),from:"customer",text:"I approve the quote of "+money(Number(current.quoteAmount)||current.price)+".",createdAt:new Date().toISOString()}]}),"Quote approved. This request is now marked Accepted in this browser preview.")}>Approve quote</button><button className="sd-button sd-outline" type="button" onClick={()=>onUpdateOrder(order.id,current=>({...current,quoteStatus:"Declined",status:"Declined",messages:[...(current.messages||[]),{id:"MSG-"+Date.now().toString(36),from:"customer",text:"I decline the current quote. Please contact me if we should discuss a revised scope.",createdAt:new Date().toISOString()}]}),"Quote declined. Dira Creative can follow up in the local conversation.")}>Decline</button></div></section>}
          {order.quoteStatus === "Approved" && <p className="sd-client-quote-status">✓ Quote approved · {money(Number(order.quoteAmount)||order.price)}</p>}
          {order.quoteStatus === "Declined" && <p className="sd-client-quote-status">Quote declined · contact Dira Creative if you want to discuss a revised scope.</p>}
          <div className="sd-workspace-meta"><span>{messages.length} {messages.length === 1 ? "message" : "messages"}</span><span>{messages.filter(message => message.from === "studio").length ? "Dira Creative replied" : "Awaiting Dira Creative reply"}</span><button className="sd-small-button" onClick={() => setOpenThread(expanded ? null : order.id)}>{expanded ? "Close conversation" : "Messages & files →"}</button></div><ReceiptDocument businessName={businessName} accentColor={accentColor} receiptProfile={receiptProfile} order={order} />
          {expanded && <div className="sd-thread">
            <div className="sd-thread-heading"><div><span className="sd-kicker">PROJECT / CONVERSATION</span><h3>Talk about {order.serviceName}</h3></div><span className="sd-local-pill">LOCAL DEMO</span></div>
            <p className="sd-admin-help">Messages are saved to this browser and appear in the Admin demo on the same device. They are not emailed or sent to a remote team.</p>
            <div className="sd-thread-messages" aria-live="polite">{messages.length ? messages.map(message => <article key={message.id} className={"sd-thread-message is-" + message.from}><div><strong>{message.from === "customer" ? "You" : "Dira Creative / Admin"}</strong><time>{prettyDate(message.createdAt)}</time></div>{message.text && <p>{message.text}</p>}{message.attachment && <a href={message.attachment.url} target="_blank" rel="noreferrer">↗ {message.attachment.name} · Open attachment</a>}</article>) : <p className="sd-thread-empty">No messages yet. Add a question or share a file for the Dira Creative to review in this demo.</p>}</div>
            <form className="sd-thread-composer" onSubmit={event => { event.preventDefault(); sendMessage(order); }}>
              <label htmlFor={"message-" + order.id}>Message the Dira Creative<textarea id={"message-" + order.id} rows={3} maxLength={1200} value={drafts[order.id] || ""} onChange={event => setDrafts(current => ({ ...current, [order.id]: event.target.value }))} placeholder="Ask a question, clarify your brief, or share the next step…" /></label>
              <div className="sd-thread-actions"><label className="sd-file-button">＋ Attach file<input type="file" accept="image/*,video/*,application/pdf" disabled={isUploading || !online} onChange={event => attachFile(order, event)} /></label><button className="sd-button sd-primary" type="submit" disabled={isUploading || !(drafts[order.id] || "").trim()}>Send message →</button></div>
              {uploadingOrder === order.id && <div className="sd-media-progress" role="status"><div className="sd-media-progress-copy"><strong>Uploading attachment</strong><span>{uploadProgress}%</span></div><div className="sd-media-progress-track" role="progressbar" aria-label="Attachment upload progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={uploadProgress}><span style={{ width: uploadProgress + "%" }} /></div></div>}
            </form>
          </div>}
        </article>;
      })}</div>}
      {uploadNotice && <p className="sd-media-status" role="status">{uploadNotice}</p>}
      <div className="sd-account-extras">
        <section className="sd-account-extra"><span className="sd-kicker">01 / PROJECT CHECKLIST</span><h2>Get the brief ready.</h2><p>Use this practical checklist to prepare a clearer request. Tick off steps as you complete them; your checklist is saved in this browser.</p><div className="sd-project-checklist">
          {[
            { id: "brief", title: "Clarify the outcome", body: "Write down what you need the website, app, support or game to achieve." },
            { id: "reference", title: "Gather a reference", body: "Save a link, screenshot or example that shows the direction you have in mind." },
            { id: "scope", title: "List the essentials", body: "Separate must-haves from ideas that can wait for a later version." },
            { id: "timeline", title: "Discuss the timeline", body: "Your requested date is a preference until scope and delivery are agreed." }
          ].map(step => (
            <label className="sd-project-check" key={step.id}>
              <input
                type="checkbox"
                checked={projectSteps.includes(step.id)}
                onChange={event => setProjectSteps(current => event.target.checked ? [...current, step.id] : current.filter(item => item !== step.id))}
              />
              <span className="sd-project-check-copy">
                <strong className="sd-project-check-title">{step.title}</strong>
                <small className="sd-project-check-description">{step.body}</small>
              </span>
            </label>
          ))}
        </div><p className="sd-account-note">{projectSteps.length}/4 preparation steps checked. This is a planning aid, not a delivery status or score.</p></section>
        <section className="sd-account-extra"><span className="sd-kicker">02 / PROJECT NOTES</span><h2>Keep the details together.</h2><p>Save a short idea, question or requirement you want to remember before the next conversation. This note stays in this browser and is not a secure private vault.</p><label className="sd-journal-label" htmlFor="Dira Creative-journal">Note for your next discussion<textarea id="Dira Creative-journal" rows={4} maxLength={500} value={journal} onChange={event => setJournal(event.target.value)} placeholder="A feature idea, reference link, question or detail to confirm…" /></label><div className="sd-journal-actions"><span>{journal.length}/500 characters</span><button className="sd-small-button" onClick={() => setSavedJournal(journal.trim())}>Save note</button></div>{savedJournal && <p className="sd-saved-note"><strong>Saved note</strong>{savedJournal}</p>}</section>
      </div>
      <div className="sd-account-extras sd-account-followup">
        <section className="sd-account-extra"><span className="sd-kicker">03 / STUDIO UPDATES</span><h2>{announcement.trim() && studioNotes ? "Latest from the Dira Creative." : "Updates for your project."}</h2>{announcement.trim() && studioNotes ? <div className="sd-published-note"><span>STUDIO ANNOUNCEMENT</span><p>{announcement}</p></div> : <p>{studioNotes ? "There are no Dira Creative announcements right now. When the demo admin publishes an update or offer, it will appear here." : "Dira Creative updates are hidden by your local preferences."}</p>}<p>General planning guidance</p><div className="sd-Dira Creative-feed">{(projectTips ? [
          { title: "Start with the outcome", body: "Describe what should be easier or possible when the project is finished." },
          { title: "Keep the first version focused", body: "Prioritise the essential customer action before adding optional features." },
          { title: "Agree scope before delivery", body: "Review requirements and the requested date together before treating a timeline as confirmed." }
        ] : []).map((item, index) => <article key={item.title}><span>TIP / 0{index + 1}</span><strong>{item.title}</strong><p>{item.body}</p></article>)}</div></section>
        <section className="sd-account-extra"><span className="sd-kicker">04 / ACCOUNT PREFERENCES</span><h2>Choose what you see.</h2><p>Control the planning tips and Dira Creative announcements shown in this account view. These settings do not send emails or system notifications.</p><label className="sd-preference-toggle"><input type="checkbox" checked={projectTips} onChange={event => setProjectTips(event.target.checked)} /><span><strong>Project planning tips</strong><small>Show short guidance for preparing and discussing your project.</small></span></label><label className="sd-preference-toggle"><input type="checkbox" checked={studioNotes} onChange={event => setStudioNotes(event.target.checked)} /><span><strong>Dira Creative announcements</strong><small>Show the latest announcement or offer published in this demo.</small></span></label><p className="sd-account-note">Preferences are saved in this browser. Real push notifications, email updates and account sync are not configured.</p></section>
      </div>
      <section className="sd-account-extra sd-account-guide"><span className="sd-kicker">05 / NEXT STEPS</span><h2>Keep your project moving.</h2><div className="sd-next-steps"><article><b>01</b><strong>Check your request</strong><p>Review your brief, requested date and current status above.</p></article><article><b>02</b><strong>Message the Dira Creative</strong><p>Open the conversation on your request to ask a question or share a reference file while online.</p></article><article><b>03</b><strong>Return for an update</strong><p>Check the same browser for saved messages and any status change in this demo.</p></article></div></section>
      <p className="sd-local-warning">Offline ready for local browsing and text messages after the app shell is cached. Requests, messages and status updates remain on this browser only. Attachments need internet and upload to UploadThing; they are not queued for offline upload.</p>
    </div>
  </section>;
}
