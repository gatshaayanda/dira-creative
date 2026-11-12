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
          <p>The Store shell, app scripts and styles are cached for offline visits. Once the Store has loaded online, its current service images and videos from supported media hosts are also prepared for offline viewing. Cached content may be out of date, and browser storage can still be cleared by the device.</p>
          <p>Customer requests, account text messages, service edits, announcement changes, Briefcase notes and demo payment/status changes save in this browser. Customer and owner views use the same local records on this device; nothing is uploaded or synced to another device.</p>
          <p>New UploadThing uploads, external links, remote Firebase features and other server-dependent actions need internet. Offline text and admin changes are saved locally, not queued for server delivery.</p>
          <p><strong>Before going offline:</strong> open the Store while connected, let its images and videos finish loading, then reload once so the latest app shell is active.</p>
          <div className="actions centered">
            <Link className="button buttonPrimary" href="/#service-order">Try customer journey</Link>
            <Link className="button buttonLight" href="/">Open home</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
