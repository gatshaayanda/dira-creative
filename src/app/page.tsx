"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import DiraBrand from "@/components/DiraBrand";
import ServiceGuide from "@/app/ServiceGuide";
import { DEFAULT_DIRA_CATALOGUE } from "@/lib/dira-catalogue";
import { trackDiraJourney } from "@/lib/firebase/journey-analytics";

const packages = [
  {
    id: "package-novice",
    audience: "I’m getting started",
    outcome: "Build a credible first identity.",
    accent: "novice",
  },
  {
    id: "package-elevate",
    audience: "I’m ready to grow",
    outcome: "Bring consistency to a growing business.",
    accent: "elevate",
  },
  {
    id: "package-elite",
    audience: "I’m established",
    outcome: "Connect every part of an established brand.",
    accent: "elite",
  },
] as const;

const stages = [
  ["01", "Define your identity", "Build a recognisable brand system."],
  ["02", "Establish your presence", "Show up clearly across key touchpoints."],
  ["03", "Structure your operations", "Make the business work more effectively."],
  ["04", "Connect with your market", "Reach the people your business serves."],
  ["05", "Optimise for growth", "Find opportunities and move forward."],
] as const;

const catalogue = DEFAULT_DIRA_CATALOGUE.filter((item) => item.published).sort((a, b) => a.sortOrder - b.sortOrder);
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

function requestHref(item: (typeof catalogue)[number]) {
  const key = item.kind === "package" ? "package" : "service";
  return `/request?${key}=${encodeURIComponent(item.name)}`;
}

export default function Home() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"services" | "packages" | "all">("services");

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

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalogue.filter((item) => {
      const matchesType = filter === "all" || item.kind === (filter === "packages" ? "package" : "service");
      const matchesSearch = !query || [item.name, item.category, item.description].some((value) => value.toLowerCase().includes(query));
      return matchesType && matchesSearch;
    });
  }, [filter, search]);

  const packageItems = packages.flatMap((path) => {
    const item = catalogue.find((entry) => entry.id === path.id);
    return item ? [{ ...path, item }] : [];
  });

  return (
    <main className="diraHome">
      <div className="diraHomeTopbar">
        <div className="diraHomeWrap">
          <span>ROYALTY HOLDINGS <i>/</i> DIRA CREATIVE</span>
          <span>BRAND &amp; BUSINESS DEVELOPMENT · GABORONE, BOTSWANA</span>
        </div>
      </div>

      <header className="diraHomeHeader">
        <div className="diraHomeWrap diraHomeNav">
          <Link href="/" className="diraHomeLogo" aria-label="Dira Creative home"><DiraBrand /></Link>
          <nav aria-label="Main navigation">
            <a href="#packages">Packages</a>
            <a href="#services">Services</a>
            <Link href="/account">Client account</Link>
            <Link href="/request" className="diraHomeNavCta">Start a project <span aria-hidden="true">↗</span></Link>
          </nav>
        </div>
      </header>

      <section className="diraHomeHero">
        <div className="diraHomeWrap diraHomeHeroGrid">
          <div className="diraHomeHeroCopy">
            <span className="diraHomeEyebrow"><i /> BRAND &amp; BUSINESS DEVELOPMENT</span>
            <h1>Brands with clarity. <em>Businesses with direction.</em></h1>
            <p>Building brands that communicate clearly, operate efficiently, and scale effectively.</p>
            <div className="diraHomeHeroActions">
              <a className="diraHomePrimary" href="#packages">Find your starting point <span aria-hidden="true">↘</span></a>
              <a className="diraHomeTextLink" href="#services">Explore individual services <span aria-hidden="true">→</span></a>
            </div>
            <div className="diraHomeHeroNote"><span>01—05</span> One connected approach to brand and business development.</div>
          </div>
          <div className="diraHomeHeroVisual" aria-label="Five stages of brand and business development">
            <div className="diraHomeVisualHead"><span>THE DIRA APPROACH</span><strong>From identity to growth</strong></div>
            {stages.map(([number, title], index) => (
              <div className={`diraHomeVisualStep step-${index + 1}`} key={number}>
                <span>{number}</span><strong>{title}</strong><i aria-hidden="true">↗</i>
              </div>
            ))}
            <div className="diraHomeVisualFoot"><span>STRATEGY</span><b>+</b><span>DESIGN</span><b>+</b><span>OPERATIONS</span></div>
          </div>
        </div>
      </section>

      <section className="diraHomePackages" id="packages">
        <div className="diraHomeWrap">
          <div className="diraHomeSectionHeading">
            <div><span className="diraHomeSectionKicker">A CLEAR PLACE TO START</span><h2>Choose the stage you’re at.</h2></div>
            <p>Three practical brand packages. Choose the closest fit; we’ll confirm the right scope together before you approve anything.</p>
          </div>
          <div className="diraHomePackageGrid">
            {packageItems.map(({ item, audience, outcome, accent }, index) => (
              <article className={`diraHomePackage diraHomePackage-${accent}`} key={item.id}>
                <div className="diraHomePackageTop"><span>0{index + 1} / BRAND PACKAGE</span><span>{audience}</span></div>
                <h3>{item.name}</h3>
                <p className="diraHomePackageOutcome">{outcome}</p>
                <p className="diraHomePackageDescription">{item.description}</p>
                <div className="diraHomePackageBottom">
                  <strong>{item.priceLabel}</strong>
                  <Link href={requestHref(item)}>Choose this package <span aria-hidden="true">↗</span></Link>
                </div>
              </article>
            ))}
          </div>
          <p className="diraHomePriceNote">Published package prices are in Botswana pula (BWP). Scope and any price adjustment are discussed and agreed before approval. No payment is taken when you send an enquiry.</p>
        </div>
      </section>

      <section className="diraHomeMethod">
        <div className="diraHomeWrap">
          <div className="diraHomeMethodHeading"><span className="diraHomeSectionKicker">HOW WE CREATE VALUE</span><h2>One connected process.</h2></div>
          <div className="diraHomeStageGrid">
            {stages.map(([number, title, description]) => (
              <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
            ))}
          </div>
        </div>
      </section>

      <section className="diraHomeServices" id="services">
        <div className="diraHomeWrap">
          <div className="diraHomeSectionHeading">
            <div><span className="diraHomeSectionKicker">THE FULL CAPABILITY</span><h2>Individual services.</h2></div>
            <p>Build a focused brief or combine several services into one project enquiry. Every published service remains available below.</p>
          </div>
          <div className="diraHomeCatalogueTools">
            <label className="diraHomeSearch"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services and packages" aria-label="Search services and packages" /></label>
            <div className="diraHomeFilters" role="group" aria-label="Catalogue filter">
              {([["services", "Services"], ["packages", "Packages"], ["all", "All options"]] as const).map(([value, label]) => (
                <button key={value} type="button" className={filter === value ? "is-active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>
              ))}
            </div>
          </div>
          <div className="diraHomeResultLine"><strong>{visibleItems.length} {visibleItems.length === 1 ? "option" : "options"}</strong><span>All prices shown in BWP · final scope agreed before approval</span></div>
          {visibleItems.length ? (
            <div className="diraHomeServiceList">
              {visibleItems.map((item) => (
                <article className="diraHomeService" key={item.id}>
                  <div className="diraHomeServiceCopy"><span>{item.kind === "package" ? "BRAND PACKAGE" : item.category.toUpperCase()}</span><h3>{item.name}</h3><p>{item.description}</p></div>
                  <div className="diraHomeServiceAction"><strong>{item.priceLabel}</strong><Link href={requestHref(item)}>Add to enquiry <span aria-hidden="true">↗</span></Link></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="diraHomeEmpty"><strong>No matching options.</strong><button type="button" onClick={() => { setSearch(""); setFilter("services"); }}>Clear search</button></div>
          )}
          <div className="diraHomeCatalogueFoot"><span>Need a tailored combination?</span><Link href="/request">Build one project enquiry with multiple services <span aria-hidden="true">→</span></Link></div>
        </div>
      </section>

      <section className="diraHomeNext">
        <div className="diraHomeWrap diraHomeNextInner">
          <div><span className="diraHomeSectionKicker">YOUR NEXT STEP</span><h2>Let’s build with intention.</h2><p>Tell us what you’re working towards. We’ll review the brief, confirm the scope and prepare a proposal for your approval.</p></div>
          <Link href="/request" className="diraHomePrimary">Start a project enquiry <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <footer className="diraHomeFooter">
        <div className="diraHomeWrap diraHomeFooterInner">
          <div><DiraBrand /><p>Building brands that communicate clearly, operate efficiently, and scale effectively.</p></div>
          <nav aria-label="Footer navigation"><Link href="/account">Client account</Link><Link href="/patterns">App installation</Link><Link href="/request">Start a project</Link></nav>
          <small>© {new Date().getFullYear()} Dira Creative · Royalty Holdings (Pty) Ltd</small>
        </div>
      </footer>

      <ServiceGuide
        view="shop"
        services={guideServices}
        requestCount={0}
        onChooseService={(service) => {
          const key = service.id.startsWith("package-") ? "package" : "service";
          window.location.assign(`/request?${key}=${encodeURIComponent(service.name)}`);
        }}
        onOpenAccount={() => window.location.assign("/account")}
        onOpenAdmin={() => window.location.assign("/admin")}
        onOpenStorefront={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />
    </main>
  );
}
