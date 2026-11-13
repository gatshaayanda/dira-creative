"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DiraBrand from "@/components/DiraBrand";
import ServiceGuide from "@/app/ServiceGuide";
import { DEFAULT_DIRA_CATALOGUE } from "@/lib/dira-catalogue";
import { trackDiraJourney } from "@/lib/firebase/journey-analytics";

const catalogue = DEFAULT_DIRA_CATALOGUE.filter((item) => item.published).sort((a, b) => a.sortOrder - b.sortOrder);
const packages = [
  {
    id: "package-novice",
    name: "Novice Brand Package",
    description: "For startups and small businesses: basic logo, colour, font pairing and simple layout. Published price P3,200; scope and any price adjustment can be discussed and agreed before approval.",
    price: 3200,
  },
  {
    id: "package-elevate",
    name: "Elevate Brand Package",
    description: "For growing businesses: standard logo, colour, typography, basic icon set, graphic elements and layout guide. Published price P5,200; scope and any price adjustment can be discussed and agreed before approval.",
    price: 5200,
  },
  {
    id: "package-elite",
    name: "Elite Brand Package",
    description: "For established businesses: full logo suite, colour and typography systems, custom iconography, graphic system, photography direction, applicable illustration and full layout/composition. Published price P12,500; scope and any price adjustment can be discussed and agreed before approval.",
    price: 12500,
  },
] as const;

const services = catalogue.filter((item) => item.kind === "service");
const guideServices = catalogue.map((item) => ({
  id: item.id,
  name: item.name,
  price: item.priceFrom ?? 0,
  description: item.description,
  media: item.imageUrl ?? "",
  mediaType: "image" as const,
  active: item.published,
  priceLabel: item.priceLabel,
  featured: item.featured,
}));

const money = (amount: number) => "P" + amount.toLocaleString("en-BW");

export default function Home() {
  const [customOpen, setCustomOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  useEffect(() => {
    void trackDiraJourney("public_visit");
    void trackDiraJourney("catalogue_view");
  }, []);

  useEffect(() => {
    const urls = catalogue.map((item) => item.imageUrl).filter((url): url is string => Boolean(url));
    if (!urls.length || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({ type: "CACHE_MEDIA", urls });
    }).catch(() => {
      // Offline media preparation is progressive enhancement; browsing remains available.
    });
  }, []);

  const selectedTotal = useMemo(
    () => services.filter((service) => selectedServices.includes(service.id)).reduce((sum, service) => sum + (service.priceFrom ?? 0), 0),
    [selectedServices],
  );

  function toggleService(id: string) {
    setSelectedServices((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  function continueToAccount() {
    if (!selectedServices.length) return;
    const query = new URLSearchParams({ services: selectedServices.join(",") });
    window.location.assign("/account?" + query.toString() + "#project-builder");
  }

  return (
    <main className="diraCompactStore">
      <header className="diraCompactHeader">
        <Link href="/" aria-label="Dira Creative home" className="diraCompactLogo"><DiraBrand /></Link>
        <Link href="/account" className="diraCompactAccount">Client account <span aria-hidden="true">↗</span></Link>
      </header>

      <section className="diraCompactIntro">
        <span>DIRA CREATIVE · BRAND &amp; BUSINESS DEVELOPMENT</span>
        <h1>Build a brand with direction.</h1>
        <p>Choose a brand package or build your own from individual services.</p>
      </section>

      <section className="diraCompactOffers" aria-label="Brand packages">
        <div className="diraCompactMeta">Prices in BWP · scope agreed before approval</div>
        <div className="diraCompactPackageGrid">
          {packages.map((item, index) => (
            <article className={"diraCompactPackage diraCompactPackage" + (index + 1)} key={item.id}>
              <div className="diraCompactPackageLabel">BRAND PACKAGE <span>0{index + 1}</span></div>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <div className="diraCompactPackageAction">
                <strong>{money(item.price)}</strong>
                <Link href={"/account?package=" + item.id + "#project-builder"}>Add to enquiry <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
        <button type="button" className="diraCompactCustomButton" onClick={() => setCustomOpen(true)}>
          <span><small>CREATE YOUR OWN</small><strong>Build a custom package</strong><em>Select individual services and combine them into one proposal.</em></span>
          <b aria-hidden="true">↗</b>
        </button>
        <p className="diraCompactScopeNote">Your selections and indicative total continue into your private client account. Dira reviews the scope and confirms any agreed adjustment before approval. No payment is taken here.</p>
      </section>

      {customOpen && (
        <div className="diraCustomBackdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCustomOpen(false); }}>
          <section className="diraCustomModal" role="dialog" aria-modal="true" aria-labelledby="dira-custom-title">
            <header className="diraCustomModalHeader">
              <div><span>INDIVIDUAL SERVICES</span><h2 id="dira-custom-title">Build your package.</h2><p>Select the services you need. Your running total updates as you choose.</p></div>
              <button type="button" aria-label="Close custom package builder" onClick={() => setCustomOpen(false)}>×</button>
            </header>
            <div className="diraCustomServiceList">
              {services.map((service) => {
                const checked = selectedServices.includes(service.id);
                return (
                  <label className={checked ? "isSelected" : ""} key={service.id}>
                    <input type="checkbox" checked={checked} onChange={() => toggleService(service.id)} />
                    <span className="diraCustomServiceText"><strong>{service.name}</strong><small>{service.description}</small></span>
                    <b>{service.priceLabel}</b>
                  </label>
                );
              })}
            </div>
            <footer className="diraCustomModalFooter">
              <div><small>{selectedServices.length} service{selectedServices.length === 1 ? "" : "s"} selected</small><strong>{money(selectedTotal)}</strong></div>
              <button type="button" disabled={!selectedServices.length} onClick={continueToAccount}>Continue in my account <span aria-hidden="true">↗</span></button>
            </footer>
          </section>
        </div>
      )}

      <footer className="diraStoreFooter">
        <Link href="/admin" className="diraOwnerBriefcase" aria-label="Open Dira Creative owner Briefcase">
          <span className="diraOwnerBriefcaseIcon" aria-hidden="true">💼</span>
          <span className="diraOwnerBriefcaseCopy"><strong>Dira Creative</strong><small>PRIVATE BRIEFCASE · OWNER ACCESS</small><em>Open your workspace</em></span>
          <span className="diraOwnerBriefcaseArrow" aria-hidden="true">↗</span>
        </Link>
        <span className="diraStoreFooterNote">Brand &amp; business development</span>
      </footer>

      <ServiceGuide
        view="shop"
        services={guideServices}
        requestCount={0}
        onChooseService={(service) => window.location.assign("/account?services=" + encodeURIComponent(service.id) + "#project-builder")}
        onOpenAccount={() => window.location.assign("/account")}
        onOpenAdmin={() => window.location.assign("/admin")}
        onOpenStorefront={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </main>
  );
}
