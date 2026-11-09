"use client";

import type { CSSProperties } from "react";

export type ReceiptProfile = {
  legalName: string;
  registration: string;
  address: string;
  phone: string;
  footer: string;
};

export type ReceiptOrder = {
  id: string;
  receiptNo?: string;
  serviceName: string;
  price: number;
  originalPrice?: number;
  discountAmount?: number;
  discountCode?: string;
  dueDate: string;
  customerName: string;
  email: string;
  brief: string;
  status: string;
  createdAt: string;
  paymentStatus?: "Unpaid" | "Partially paid (demo)" | "Paid (demo)";
  paidAmount?: number;
  paidAt?: string;
};

type Props = {
  businessName: string;
  accentColor: string;
  receiptProfile?: ReceiptProfile;
  order: ReceiptOrder;
};

const money = (amount: number) => "P" + amount.toLocaleString("en-BW", { maximumFractionDigits: 2 });
const accentInk = (hex: string) => {
  const values = hex.match(/[0-9a-f]{2}/gi)?.map(value => parseInt(value, 16) / 255) || [0.3, 0.3, 0.3];
  const luminance = values.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.179 ? "#111827" : "#ffffff";
};
const dateLabel = (value?: string) => {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-BW", { dateStyle: "medium", timeStyle: "short" });
};

export default function ReceiptDocument({ businessName, accentColor, receiptProfile, order }: Props) {
  const total = Math.max(0, Number(order.price) || 0);
  const paid = Math.min(total, Math.max(0, Number(order.paidAmount) || 0));
  const balance = Math.max(0, total - paid);
  const paymentState = paid <= 0 ? "No payment recorded" : balance > 0 ? "Partially paid" : "Paid in full";
  const receiptNumber = order.receiptNo || "REQ-" + order.id;
  const brand = businessName.trim() || receiptProfile?.legalName?.trim() || "Your Business";
  const registeredName = receiptProfile?.legalName?.trim();
  const showRegisteredName = Boolean(registeredName && registeredName.toLowerCase() !== "your business" && registeredName.toLowerCase() !== brand.toLowerCase());
  const printReceipt = (event: React.MouseEvent<HTMLButtonElement>) => {
    const current = event.currentTarget.closest("details");
    if (!current) return;
    document.querySelectorAll<HTMLDetailsElement>(".sd-receipt[open]").forEach(item => {
      if (item !== current) item.open = false;
    });
    current.open = true;
    window.print();
  };

  return <details className="sd-receipt">
    <summary>Receipt / payment record · {receiptNumber}</summary>
    <div className="sd-receipt-paper" style={{ "--receipt-accent": accentColor, "--receipt-accent-ink": accentInk(accentColor) } as CSSProperties}>
      <header className="sd-receipt-brand">
        <span className="sd-receipt-mark" aria-hidden="true">{brand.slice(0, 1).toUpperCase()}</span>
        <div><strong>{brand}</strong><small>Customer receipt &amp; job record</small></div>
        <span className="sd-receipt-state">{paymentState}</span>
      </header>
      {showRegisteredName ? <p className="sd-receipt-registered">Registered name: {registeredName}</p> : null}
      <div className="sd-receipt-heading"><span>{paid > 0 ? "PAYMENT RECORD" : "REQUEST RECORD"}</span><h2>{paymentState === "Paid in full" ? "Paid in full" : paymentState === "Partially paid" ? "Part payment" : "Payment outstanding"}</h2><p>{paymentState === "Paid in full" ? "The recorded demo balance is settled." : paymentState === "Partially paid" ? "A payment has been recorded; the remaining balance is shown below." : "This request is recorded. No payment has been recorded."}</p></div>
      <dl className="sd-receipt-meta">
        <div><dt>Record number</dt><dd>{receiptNumber}</dd></div>
        <div><dt>Request date</dt><dd>{dateLabel(order.createdAt)}</dd></div>
        <div><dt>Requested timeline</dt><dd>{order.dueDate || "Not supplied"}</dd></div>
        <div><dt>Job status</dt><dd>{order.status}</dd></div>
      </dl>
      <div className="sd-receipt-parties">
        <div><span>PREPARED FOR</span><strong>{order.customerName}</strong><small>{order.email}</small></div>
        <div><span>BUSINESS CONTACT</span><strong>{receiptProfile?.phone || "Not supplied"}</strong><small>{receiptProfile?.address || "Address not supplied"}</small></div>
      </div>
      <div className="sd-receipt-line"><span>{order.serviceName}</span><strong>{money(order.originalPrice ?? total)}</strong></div>
      {order.discountAmount ? <div className="sd-receipt-line is-discount"><span>Discount {order.discountCode ? "(" + order.discountCode + ")" : ""}</span><strong>−{money(order.discountAmount)}</strong></div> : null}
      <div className="sd-receipt-line is-total"><span>Agreed demo total</span><strong>{money(total)}</strong></div>
      <div className="sd-receipt-payment">
        <div><span>Payment recorded</span><strong>{money(paid)}</strong></div>
        <div><span>Balance outstanding</span><strong>{money(balance)}</strong></div>
        <div><span>Payment status</span><strong>{paymentState}</strong></div>
        <div><span>Last payment recorded</span><strong>{dateLabel(order.paidAt)}</strong></div>
      </div>
      {receiptProfile?.registration ? <p className="sd-receipt-tax">Business reference: {receiptProfile.registration}</p> : null}
      {order.brief ? <div className="sd-receipt-brief"><span>REQUEST NOTES</span><p>{order.brief}</p></div> : null}
      <footer className="sd-receipt-footer"><strong>{receiptProfile?.footer || "Thank you for your business."}</strong><small>Local prototype record only. This app does not process or independently verify payments. Keep this document with the related job record.</small><button className="sd-small-button sd-receipt-download" type="button" onClick={printReceipt}>Download / print PDF</button></footer>
    </div>
  </details>;
}
