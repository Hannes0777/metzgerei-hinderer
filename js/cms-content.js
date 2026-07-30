/* ============================================================
   cms-content.js  –  Loads JSON content files and populates the
   Metzgerei Hinderer page at runtime.
   The CMS (Sveltia) edits these JSON files via GitHub; the host
   (Cloudflare Pages / GitHub Pages) serves the static result.

   Design note: this site animates sections with GSAP ScrollTrigger
   tied to the elements present at page load. To avoid breaking
   those animations (and to avoid elements getting stuck at
   opacity:0 from the [data-animate] CSS rule), most sections here
   are updated IN PLACE (existing DOM nodes, text/attributes only)
   rather than being fully rebuilt from scratch. Only the
   "Aktuelles & Angebote" list — the one section meant to grow and
   shrink freely — is rebuilt from scratch, and its rendered cards
   intentionally omit the data-animate/data-delay attributes so
   they always render visible even without a fresh GSAP pass.
   ============================================================ */
'use strict';

(async function () {

  // ── Fetch helper ─────────────────────────────────────────
  async function fetchJSON(path) {
    try {
      const r = await fetch(path);
      if (!r.ok) throw new Error(r.status);
      return r.json();
    } catch (e) {
      console.warn('[CMS] Could not load', path, e.message);
      return null;
    }
  }

  // ── Minimal Markdown → HTML (bold, italic only) ──────────
  function md(text) {
    if (!text) return '';
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,     '<em>$1</em>');
  }

  // ── Render an "Angebot" card (Aktuelles & Angebote) ──────
  const BADGE_CLASS = {
    rot:   '',
    gruen: 'angebot-card__badge--green',
    gold:  'angebot-card__badge--gold',
    weiss: 'angebot-card__badge--white',
  };

  function renderAngebotCard(item) {
    const badgeClass = BADGE_CLASS[item.badge_farbe] || '';
    const highlighted = !!item.hervorgehoben;
    const cardClass = highlighted ? 'angebot-card angebot-card--highlight' : 'angebot-card';
    const btnClass  = highlighted ? 'btn btn--outline-light btn--sm' : 'btn btn--secondary btn--sm';

    if (highlighted) {
      return `
<div class="${cardClass}">
  <div class="angebot-card__body">
    <span class="angebot-card__badge ${badgeClass}">${item.badge || ''}</span>
    <h3>${item.titel || ''}</h3>
    <p>${item.text || ''}</p>
    <a href="${item.button_link || 'kontakt.html'}" class="${btnClass}">${item.button_text || ''}</a>
  </div>
</div>`.trim();
    }

    return `
<div class="${cardClass}">
  <div class="angebot-card__top">
    <span class="angebot-card__badge ${badgeClass}">${item.badge || ''}</span>
  </div>
  <div class="angebot-card__img img-placeholder-box">
    <div class="placeholder-label">Ihr Foto hier</div>
  </div>
  <div class="angebot-card__body">
    <h3>${item.titel || ''}</h3>
    <p>${item.text || ''}</p>
    <a href="${item.button_link || 'kontakt.html'}" class="${btnClass}">${item.button_text || ''}</a>
  </div>
</div>`.trim();
  }

  // ── Render an "Anlass" tag (Partyservice occasions) ──────
  function renderOccasionTag(text) {
    return `<span class="occasion-tag">${text}</span>`;
  }

  // ── Fetch everything in parallel ─────────────────────────
  const [siteinfo, hero, produkte, partyservice, ueberuns, aktuelles, kontakt, rechtliches] =
    await Promise.all([
      fetchJSON('content/siteinfo.json'),
      fetchJSON('content/hero.json'),
      fetchJSON('content/produkte.json'),
      fetchJSON('content/partyservice.json'),
      fetchJSON('content/ueberuns.json'),
      fetchJSON('content/aktuelles.json'),
      fetchJSON('content/kontakt.json'),
      fetchJSON('content/rechtliches.json'),
    ]);

  // ── 1. Seiteninfos ────────────────────────────────────────
  // Seitentitel/Meta-Beschreibung aus dem CMS gelten nur für die Startseite
  // (erkennbar am Hero-Bereich #hero) - Impressum/Datenschutz haben ihren
  // eigenen, fest im HTML stehenden <title> bzw. <meta name="description">
  // und sollen hier nicht überschrieben werden.
  if (siteinfo && document.getElementById('hero')) {
    if (siteinfo.site_title) document.title = siteinfo.site_title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && siteinfo.meta_description) desc.setAttribute('content', siteinfo.meta_description);
  }

  // ── 2. Hero ───────────────────────────────────────────────
  if (hero) {
    const eyebrow = document.querySelector('.hero__eyebrow');
    if (eyebrow && hero.eyebrow) eyebrow.textContent = hero.eyebrow;

    const lines = document.querySelectorAll('.hero__title-line');
    if (lines[0] && hero.title_line1) lines[0].textContent = hero.title_line1;
    if (lines[1] && hero.title_line2) lines[1].textContent = hero.title_line2;

    const sub = document.querySelector('.hero__subtitle');
    if (sub && hero.subtitle) sub.textContent = hero.subtitle;
  }

  // ── 3. Produkte (5 feste Kategorie-Karten, per Position) ─
  if (produkte && Array.isArray(produkte.kategorien)) {
    const cards = document.querySelectorAll('.produkt-card:not(.produkt-card--cta)');
    produkte.kategorien.forEach((kat, i) => {
      const card = cards[i];
      if (!card || !kat) return;

      const img = card.querySelector('.produkt-card__img');
      if (img && kat.bild) img.src = kat.bild;

      const tag = card.querySelector('.produkt-card__tag');
      if (tag && kat.tag) tag.textContent = kat.tag;

      const titel = card.querySelector('.produkt-card__title');
      if (titel && kat.titel) titel.textContent = kat.titel;

      const text = card.querySelector('.produkt-card__text');
      if (text && kat.text) text.textContent = kat.text;

      const list = card.querySelector('.produkt-card__list');
      if (list && Array.isArray(kat.punkte)) {
        list.innerHTML = kat.punkte.map(p => `<li>${p}</li>`).join('');
      }
    });
  }

  // ── 4. Partyservice ───────────────────────────────────────
  if (partyservice) {
    const features = document.querySelectorAll('.ps-feature');
    if (Array.isArray(partyservice.merkmale)) {
      partyservice.merkmale.forEach((m, i) => {
        const feature = features[i];
        if (!feature || !m) return;
        const icon  = feature.querySelector('.ps-feature__icon');
        const titel = feature.querySelector('h4');
        const text  = feature.querySelector('p');
        if (icon && m.icon)   icon.textContent = m.icon;
        if (titel && m.titel) titel.textContent = m.titel;
        if (text && m.text)   text.textContent = m.text;
      });
    }

    const occasions = document.getElementById('occasion-tags');
    if (occasions && Array.isArray(partyservice.anlaesse) && partyservice.anlaesse.length) {
      occasions.innerHTML = partyservice.anlaesse.map(renderOccasionTag).join('');
    }
  }

  // ── 5. Über uns ───────────────────────────────────────────
  if (ueberuns) {
    const paras = document.querySelectorAll('.ueber-uns__text > p');
    const texts = [ueberuns.absatz1, ueberuns.absatz2, ueberuns.absatz3];
    paras.forEach((p, i) => { if (texts[i]) p.innerHTML = md(texts[i]); });

    const values = document.querySelectorAll('.value-item');
    if (Array.isArray(ueberuns.werte)) {
      ueberuns.werte.forEach((w, i) => {
        const item = values[i];
        if (!item || !w) return;
        const icon  = item.querySelector('.value-item__icon');
        const titel = item.querySelector('h4');
        const text  = item.querySelector('p');
        if (icon && w.icon)   icon.textContent = w.icon;
        if (titel && w.titel) titel.textContent = w.titel;
        if (text && w.text)   text.textContent = w.text;
      });
    }

    const timelineItems = document.querySelectorAll('.timeline-item');
    if (Array.isArray(ueberuns.zeitleiste)) {
      ueberuns.zeitleiste.forEach((e, i) => {
        const item = timelineItems[i];
        if (!item || !e) return;
        const jahr = item.querySelector('strong');
        const text = item.querySelector('p');
        if (jahr && e.jahr) jahr.textContent = e.jahr;
        if (text && e.text) text.textContent = e.text;
      });
    }
  }

  // ── 6. Aktuelles & Angebote ───────────────────────────────
  if (aktuelles && Array.isArray(aktuelles.angebote)) {
    const grid = document.getElementById('aktuelles-grid');
    if (grid && aktuelles.angebote.length) {
      grid.innerHTML = aktuelles.angebote.map(renderAngebotCard).join('\n');
    }
  }

  // ── 7. Kontakt & Öffnungszeiten ───────────────────────────
  if (kontakt) {
    const addr = document.getElementById('kontakt-address');
    if (addr) {
      addr.innerHTML = `${kontakt.name || ''}<br>${kontakt.zusatz || ''}<br>${kontakt.strasse || ''}<br>${kontakt.ort || ''}`;
    }

    const footerAddr = document.getElementById('footer-address');
    if (footerAddr && kontakt.strasse && kontakt.ort) {
      footerAddr.innerHTML = `${kontakt.strasse}<br>${kontakt.ort}`;
    }

    if (kontakt.telefon_href) {
      // Every tel: link should dial the right number - including the "Jetzt
      // anrufen" / "Vorbestellen" CTA buttons in Aktuelles - but only the
      // links that actually display the number as text get their text swapped;
      // otherwise those CTA labels would be silently overwritten.
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = `tel:${kontakt.telefon_href}`;
      });
    }
    if (kontakt.telefon) {
      document.querySelectorAll('.kontakt__link[href^="tel:"], .footer__contact a[href^="tel:"]').forEach(a => {
        a.textContent = kontakt.telefon;
      });
    }

    if (kontakt.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        a.href = `mailto:${kontakt.email}`;
        a.textContent = kontakt.email;
      });
    }

    const socialLinks = document.querySelectorAll('.social-links .social-link');
    if (Array.isArray(kontakt.social)) {
      kontakt.social.forEach((s, i) => {
        const link = socialLinks[i];
        if (!link || !s) return;
        if (s.url) link.href = s.url;
        const span = link.querySelector('span');
        if (span && s.plattform) span.textContent = s.plattform;
        if (s.plattform) link.setAttribute('aria-label', `Metzgerei Hinderer auf ${s.plattform}`);
      });
    }

    const iframe = document.querySelector('.kontakt__map iframe');
    if (iframe && kontakt.map_embed_url) iframe.src = kontakt.map_embed_url;

    const mapLink = document.querySelector('.btn--map');
    if (mapLink && kontakt.map_link_url) mapLink.href = kontakt.map_link_url;

    const hoursRows = document.querySelectorAll('.hours-row');
    if (Array.isArray(kontakt.oeffnungszeiten)) {
      kontakt.oeffnungszeiten.forEach((h, i) => {
        const row = hoursRows[i];
        if (!row || !h) return;
        const day  = row.querySelector('.hours-day');
        const time = row.querySelector('.hours-time');
        if (day && h.tag)  day.textContent = h.tag;
        if (time && h.zeit) time.textContent = h.zeit;
      });
    }
  }

  // ── 8. Rechtliches (Impressum-Felder, die nur der Kunde kennt) ──
  // Wirkt nur, wenn die jeweilige ID auf der aktuellen Seite existiert
  // (aktuell nur impressum.html). Ist ein Feld im CMS noch leer, bleibt
  // der auffällig gestylte Platzhalter aus dem HTML unverändert stehen.
  function fillLegalField(id, value) {
    const el = document.getElementById(id);
    if (!el || !value || !String(value).trim()) return;
    el.textContent = value;
    el.classList.remove('legal-placeholder');
  }
  if (rechtliches) {
    fillLegalField('impressum-vertretung',        rechtliches.vertretungsberechtigte_person);
    fillLegalField('impressum-ustid',              rechtliches.ust_id);
    fillLegalField('impressum-hr-gericht',         rechtliches.handelsregister_gericht);
    fillLegalField('impressum-hr-nummer',          rechtliches.handelsregister_nummer);
    fillLegalField('impressum-kammer',             rechtliches.kammer);
    fillLegalField('impressum-berufsbezeichnung',  rechtliches.berufsbezeichnung);
  }

  // ── Re-observe any newly added .reveal elements ──────────
  if (typeof window.cmsObserveReveal === 'function') {
    window.cmsObserveReveal();
  }

  // ── Signal other scripts that content is in the DOM ──────
  document.dispatchEvent(new CustomEvent('cms-ready'));

})();
