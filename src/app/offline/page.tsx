import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="orderPage">
      <div className="orderWrap">
        <div className="orderHeader">
          <Link href="/" className="logo"><span className="logoMark">D</span><span>Dira Creative</span></Link>
        </div>
        <section className="orderCard confirm">
          <div className="confirmIcon">📶</div>
          <span className="kicker">Offline mode</span>
          <h1>Dira Creative is still here.</h1>
          <p>The public Dira shell, app scripts and styles are cached for offline visits. Images and videos from supported media hosts can also be cached after they have loaded online. Cached content may be out of date, and the browser or device can clear stored data.</p>
          <p><strong>Offline preview:</strong> browser-local preview records and demo changes remain on this device only. They are not uploaded or synchronised to another device.</p>
          <p><strong>Needs a connection:</strong> production enquiries, customer accounts, private messages, quote approvals, owner/admin actions, Firebase records, notifications and new UploadThing uploads. These actions are not queued for later delivery.</p>
          <p><strong>Before going offline:</strong> open the public Store while connected, let its images and videos finish loading, then reload once to activate the latest app shell. Private customer and owner routes intentionally show this offline page instead of replaying cached account or admin content.</p>
          <div className="actions centered">
            <Link className="button buttonPrimary" href="/#service-order">Try customer journey</Link>
            <Link className="button buttonLight" href="/">Open home</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
