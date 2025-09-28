/*
  Módulo responsável por exportar a landing page como um arquivo zip
  contendo o HTML, CSS e assets (imagens).
  Cada template tem sua própria função de construção do HTML.
*/

import JSZip from "jszip"
import { saveAs } from "file-saver"

import saasDefault from "../templates/saas/data"
import eventoDefault from "../templates/evento/data"
import d2cDefault from "../templates/d2c/data"
import portfolioDefault from "../templates/portfolio/data"
import waitlistDefault from "../templates/waitlist/data"
import plansDefault from "../templates/plans/data"

// Utilitários
const BASE_CSS = `
:root {
  color-scheme: light;
  font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #f8fafc;
  color: #0f172a;
  font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  line-height: 1.6;
}
img {
  max-width: 100%;
  height: auto;
  display: block;
}
a {
  color: inherit;
  text-decoration: none;
}
.lp-navbar {
  background: #ffffff;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}
.lp-navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 0;
}
.lp-logo {
  font-weight: 600;
  font-size: 1rem;
}
.lp-nav-links {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: rgba(15, 23, 42, 0.7);
}
.lp-hero {
  background: var(--accent, #0ea5e9);
  color: #ffffff;
  padding: 80px 0;
}
.lp-hero-inner {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  align-items: center;
}
.lp-hero-text {
  flex: 1 1 320px;
}
.lp-hero-text h1 {
  font-size: clamp(2rem, 3vw + 1rem, 3.1rem);
  margin: 0 0 16px;
}
.lp-hero-text p {
  margin: 0 0 20px;
}
.lp-hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.lp-hero-media {
  flex: 1 1 280px;
  display: flex;
  justify-content: center;
}
.lp-hero-media img {
  width: 100%;
  max-width: 480px;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.22);
}
.lp-container {
  width: min(1100px, 90%);
  margin: 0 auto;
}
.lp-section {
  padding: 72px 0;
}
.lp-section h2 {
  font-size: 2rem;
  margin: 0 0 24px;
  color: #0f172a;
}
.lp-section-muted {
  background: #ffffff;
}
.lp-section-alt {
  background: #eef2ff;
}
.lp-section-dark {
  background: #0f172a;
  color: #ffffff;
}
.lp-section-dark h2 {
  color: #ffffff;
}
.lp-lead {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 28px;
}
.lp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 22px;
  border-radius: 999px;
  border: 2px solid transparent;
  font-weight: 600;
  font-size: 0.95rem;
  background: #ffffff;
  color: var(--accent, #0ea5e9);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.lp-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 24px rgba(15, 23, 42, 0.18);
}
.lp-button-outline {
  background: transparent;
  border-color: rgba(15, 23, 42, 0.15);
  color: #0f172a;
}
.lp-button-outline:hover {
  border-color: var(--accent, #0ea5e9);
  color: var(--accent, #0ea5e9);
  box-shadow: none;
  transform: none;
}
.lp-grid {
  display: grid;
  gap: 24px;
}
.lp-grid-3 {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}
.lp-grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.lp-card {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}
.lp-card h3 {
  margin: 0 0 12px;
  font-size: 1.1rem;
  color: #0f172a;
}
.lp-card p {
  margin: 0;
  color: rgba(15, 23, 42, 0.7);
  font-size: 0.95rem;
}
.lp-list {
  padding-left: 20px;
  margin: 0;
  display: grid;
  gap: 12px;
  color: rgba(15, 23, 42, 0.75);
}
.lp-steps {
  counter-reset: step;
  display: grid;
  gap: 24px;
}
.lp-step {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  position: relative;
  padding-left: 70px;
}
.lp-step::before {
  counter-increment: step;
  content: counter(step);
  position: absolute;
  top: 24px;
  left: 24px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #0f172a;
}
.lp-screenshots {
  display: flex;
  gap: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}
.lp-screenshots img {
  height: 240px;
  width: auto;
  border-radius: 18px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 20px 30px rgba(15, 23, 42, 0.12);
  background: #ffffff;
}
.lp-testimonials {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.lp-testimonials blockquote {
  margin: 0;
  font-size: 1rem;
  color: rgba(15, 23, 42, 0.78);
}
.lp-testimonials cite {
  display: block;
  margin-top: 12px;
  font-style: normal;
  font-weight: 600;
  color: #0f172a;
}
.lp-faq {
  display: grid;
  gap: 16px;
}
.lp-faq details {
  background: #ffffff;
  border-radius: 16px;
  padding: 18px 22px;
  border: 1px solid rgba(15, 23, 42, 0.08);
}
.lp-faq summary {
  cursor: pointer;
  font-weight: 600;
  color: #0f172a;
}
.lp-faq p {
  margin: 12px 0 0;
  color: rgba(15, 23, 42, 0.7);
}
.lp-banner {
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 48px;
  color: #ffffff;
}
.lp-banner img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.45);
}
.lp-banner-content {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
}
.lp-pricing {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.lp-pricing-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  padding: 28px;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
}
.lp-pricing-card.lp-featured {
  border-color: var(--accent, #0ea5e9);
  box-shadow: 0 22px 38px rgba(14, 165, 233, 0.22);
}
.lp-pricing-card h3 {
  margin: 0 0 12px;
  font-size: 1.2rem;
}
.lp-price {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 18px;
  color: #0f172a;
}
.lp-price span {
  font-size: 1rem;
  color: rgba(15, 23, 42, 0.55);
  margin-left: 4px;
}
.lp-feature-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: grid;
  gap: 10px;
  color: rgba(15, 23, 42, 0.7);
}
.lp-feature-list li::before {
  content: "\\2022";
  margin-right: 8px;
  color: var(--accent, #0ea5e9);
}
.lp-table-wrapper {
  overflow-x: auto;
  border-radius: 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #ffffff;
}
.lp-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}
.lp-table th {
  text-align: left;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 16px 20px;
  background: rgba(15, 23, 42, 0.03);
}
.lp-table td {
  padding: 16px 20px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  font-size: 0.95rem;
  color: rgba(15, 23, 42, 0.75);
}
.lp-form {
  display: grid;
  gap: 16px;
  max-width: 420px;
}
.lp-form-field {
  display: grid;
  gap: 6px;
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.7);
}
.lp-form-field input,
.lp-form-field textarea {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.12);
  font-size: 1rem;
  font-family: inherit;
  background: #ffffff;
  transition: border 0.2s ease, box-shadow 0.2s ease;
}
.lp-form-field input:focus,
.lp-form-field textarea:focus {
  border-color: var(--accent, #0ea5e9);
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.12);
  outline: none;
}
.lp-footer {
  padding: 48px 0;
  text-align: center;
  font-size: 0.9rem;
  color: rgba(15, 23, 42, 0.6);
  background: #ffffff;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  margin-top: 80px;
}
.lp-meta {
  font-size: 0.85rem;
  color: rgba(15, 23, 42, 0.5);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
@media (max-width: 720px) {
  .lp-navbar-inner {
    flex-direction: column;
    align-items: flex-start;
  }
  .lp-nav-links {
    width: 100%;
    justify-content: flex-start;
  }
  .lp-hero {
    padding: 64px 0;
  }
  .lp-hero-inner {
    flex-direction: column;
  }
  .lp-hero-media img {
    max-width: 100%;
  }
  .lp-section {
    padding: 56px 0;
  }
}
`

// Sanitize filename (basic)
const TEMPLATE_BUILDERS = {
  saas: buildSaasExport,
  evento: buildEventoExport,
  d2c: buildD2CExport,
  portfolio: buildPortfolioExport,
  waitlist: buildWaitlistExport,
  plans: buildPlansExport,
}

// Construção do zip garantindo que
// os assets são incluídos no zip
export async function exportLandingPageZip(lp) {
  const safeLp = lp || {}
  const { html, css, assets } = buildDocument(safeLp)

  const zip = new JSZip()
  let finalHtml = html

  // Download dos assets e inclusão no zip
  if (Array.isArray(assets) && assets.length > 0) {
    const downloads = await Promise.all(
      assets.map(async (asset) => {
        try {
          const response = await fetch(asset.url)
          if (!response.ok) throw new Error(`status ${response.status}`)
          const blob = await response.blob()
          return { ...asset, blob }
        } catch (error) {
          console.warn(`[exporter] Failed to fetch asset ${asset.url}`, error)
          return { ...asset, error }
        }
      })
    )
    // Mapeia os assets baixados para seus respectivos caminhos
    downloads.forEach((asset) => {
      if (asset.blob && !asset.error) {
        zip.file(asset.path, asset.blob)
      } else {
        finalHtml = finalHtml.split(asset.path).join(escapeAttr(asset.url))
      }
    })
  }

  zip.file("index.html", finalHtml)
  zip.file("styles.css", css)

  const blob = await zip.generateAsync({ type: "blob" })
  saveAs(blob, sanitize(`${safeLp.titulo || "landing-page"}.zip`))
}

// Constrói o HTML da landing page conforme o template
function buildDocument(lp) {
  const assets = []
  const assetMap = new Map()
  let assetIncrement = 0

  const addAsset = (url, hint = "asset") => {
    if (!isNonEmptyString(url)) return null
    const normalized = url.trim()
    if (normalized.startsWith("data:")) return normalized
    if (assetMap.has(normalized)) return assetMap.get(normalized).path

    const extension = guessExtension(normalized)
    const baseName = sanitizeFilename(hint || `asset-${assetIncrement + 1}`)
    let filename = baseName || `asset-${assetIncrement + 1}`
    if (extension) filename = `${filename}.${extension}`

    let path = `assets/${filename}`
    let attempt = 2

    // Garantir que o nome do arquivo seja único
    while (assets.some(item => item.path === path)) {
      const candidateBase = `${baseName}-${attempt}`
      path = `assets/${candidateBase}${extension ? `.${extension}` : ""}`
      attempt += 1
    }

    const asset = { url: normalized, path }
    assets.push(asset)
    assetMap.set(normalized, asset)
    assetIncrement += 1
    return path
  }

  // Seleciona o builder conforme o template
  const builder = TEMPLATE_BUILDERS[lp.id_template] || buildDefaultExport
  const { body, css: extraCss = "", title, description, accentColor } = builder(lp, { addAsset })
  const css = [BASE_CSS, extraCss].filter(Boolean).join("\n\n").trim()
  const pageTitle = escapeHtml(title || lp.titulo || "Landing Page")
  const metaDescription = escapeHtml(description || plainText(lp.content?.subhead || lp.content?.body || ""))
  const accent = safeColor(accentColor || lp.content?.theme, "#0ea5e9")

  const formHelperScript = `<script>(function(){document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll("form[data-export-form]").forEach(function(form){form.addEventListener("submit",function(ev){ev.preventDefault();form.reset();alert("Formulario enviado! Personalize o envio quando publicar.");});});});})();</script>`

  const html = `<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${pageTitle}</title>
<meta name="description" content="${metaDescription}" />
<link rel="stylesheet" href="./styles.css" />
</head>
<body style="--accent: ${escapeAttr(accent)};">
${body}
${formHelperScript}
</body>
</html>`

  return { html: html.trim(), css, assets }
}

// Constrói o HTML do template padrão (fallback)
function buildDefaultExport(lp, ctx = {}) {
  const addAsset = ctx.addAsset || (() => null)
  const content = lp.content || {}
  const accent = safeColor(content.theme, "#0ea5e9")
  const title = content.headline || lp.titulo || "Landing Page"
  const heroImageSrc = addAsset(content.heroUrl, `${lp.id || "lp"}-hero`)
  const heroImage = heroImageSrc ? `<div class="lp-hero-media"><img src="${escapeAttr(heroImageSrc)}" alt="Imagem em destaque" /></div>` : ""
  const ctaText = content.ctaText || "Saiba mais"
  const sections = []

  const hero = `
<header class="lp-hero">
  <div class="lp-container lp-hero-inner">
    <div class="lp-hero-text">
      <h1>${escapeHtml(title)}</h1>
      ${content.subhead ? `<p class="lp-lead">${escapeHtml(content.subhead)}</p>` : ""}
      ${content.body ? `<p>${escapeHtml(content.body)}</p>` : ""}
      <div class="lp-hero-actions">
        <a class="lp-button" href="${escapeAttr(content.ctaHref || "#")}">${escapeHtml(ctaText)}</a>
      </div>
    </div>
    ${heroImage}
  </div>
</header>`
  sections.push(hero)

  if (Array.isArray(content.highlights) && content.highlights.length > 0) {
    sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <h2>Destaques</h2>
    <ul class="lp-list">
      ${content.highlights.map(item => `<li>${escapeHtml(item)}</li>`).join("\n")}
    </ul>
  </div>
</section>`)
  }

  sections.push(`
<footer class="lp-footer">
  <div class="lp-container">&copy; ${new Date().getFullYear()} ${escapeHtml(lp.titulo || "Landing Page")}</div>
</footer>`)

  return {
    body: sections.join("\n"),
    title,
    description: content.subhead || content.body || "",
    accentColor: accent,
  }
}
// Constrói o HTML do template SaaS
function buildSaasExport(lp, ctx = {}) {
  const addAsset = ctx.addAsset || (() => null)
  const source = lp.content || {}
  const base = saasDefault || {}
  const accent = safeColor(source.theme ?? base.theme, "#0ea5e9")

  const navbar = {
    logo: source.navbar?.logo ?? base.navbar?.logo ?? (lp.titulo || "Seu SaaS"),
    links: Array.isArray(source.navbar?.links) ? source.navbar.links : Array.isArray(base.navbar?.links) ? base.navbar.links : [],
    cta: source.navbar?.cta || base.navbar?.cta || null,
  }
  const hero = { ...(base.hero || {}), ...(source.hero || {}) }
  const features = pickArray(source.features, base.features)
  const banner = { ...(base.banner || {}), ...(source.banner || {}) }
  const steps = pickArray(source.steps, base.steps)
  const screenshots = pickArray(source.screenshots, base.screenshots)
  const pricing = { ...(base.pricing || {}), ...(source.pricing || {}) }
  const testimonials = pickArray(source.testimonials, base.testimonials)
  const faq = pickArray(source.faq, base.faq)
  const footerNote = source.footer?.note ?? base.footer?.note ?? "Copyright Perfect Landing Page"
  const leadForm = source.leadForm || base.leadForm || {}

  const sections = []
  sections.push(`
<header class="lp-navbar">
  <div class="lp-container lp-navbar-inner">
    <div class="lp-logo">${escapeHtml(navbar.logo || lp.titulo || "Logo")}</div>
    <div class="lp-nav-links">
      ${navbar.links.map(link => `<a href="${escapeAttr(link?.href || "#")}">${escapeHtml(link?.label || "Link")}</a>`).join("")}
    </div>
    ${navbar.cta ? `<a class="lp-button lp-button-outline" href="${escapeAttr(navbar.cta.href || "#")}">${escapeHtml(navbar.cta.label || "Comecar")}</a>` : ""}
  </div>
</header>`)

  const heroImagePath = addAsset(hero.img, `${lp.id || "lp"}-saas-hero`)
  const heroImage = heroImagePath ? `<div class="lp-hero-media"><img src="${escapeAttr(heroImagePath)}" alt="Imagem do produto" /></div>` : ""
  sections.push(`
<section class="lp-hero">
  <div class="lp-container lp-hero-inner">
    <div class="lp-hero-text">
      <h1>${escapeHtml(hero.title || lp.titulo || "SaaS incrivel")}</h1>
      ${hero.subtitle ? `<p class="lp-lead">${escapeHtml(hero.subtitle)}</p>` : ""}
      ${(hero.bullets && Array.isArray(hero.bullets)) ? `<ul class="lp-list">${hero.bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      <div class="lp-hero-actions">
        ${hero.ctaText ? `<a class="lp-button" href="${escapeAttr(hero.ctaHref || "#")}">${escapeHtml(hero.ctaText)}</a>` : ""}
      </div>
    </div>
    ${heroImage}
  </div>
</section>`)

  const bannerImagePath = addAsset(banner.img, `${lp.id || "lp"}-banner`)
  if (bannerImagePath || banner.btnText || banner.text) {
    sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <div class="lp-banner" style="background: linear-gradient(120deg, var(--accent, #0ea5e9), rgba(14,165,233,0.6));">
      ${bannerImagePath ? `<img src="${escapeAttr(bannerImagePath)}" alt="Banner" />` : ""}
      <div class="lp-banner-content">
        ${banner.text ? `<h2>${escapeHtml(banner.text)}</h2>` : `<h2>${escapeHtml(hero.title || lp.titulo || "Apresente seu SaaS")}</h2>`}
        ${banner.btnText ? `<a class="lp-button" href="${escapeAttr(banner.btnHref || "#")}">${escapeHtml(banner.btnText)}</a>` : ""}
      </div>
    </div>
  </div>
</section>`)
  }

  if (features.length > 0) {
    sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <h2>Recursos</h2>
    <div class="lp-grid lp-grid-3">
      ${features.map(feat => `<div class="lp-card"><h3>${escapeHtml(feat?.title || "Recurso")}</h3><p>${escapeHtml(feat?.text || "Descreva o beneficio")}</p></div>`).join("")}
    </div>
  </div>
</section>`)
  }

  if (steps.length > 0) {
    sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Como funciona</h2>
    <div class="lp-steps">
      ${steps.map(step => `<div class="lp-step"><h3>${escapeHtml(step?.title || "Passo")}</h3><p>${escapeHtml(step?.text || "Explique o processo")}</p></div>`).join("")}
    </div>
  </div>
</section>`)
  }

  if (screenshots.length > 0) {
    const shotPaths = screenshots
      .map((src, index) => addAsset(src, `${lp.id || "lp"}-screenshot-${index + 1}`))
      .filter(Boolean)
    if (shotPaths.length > 0) {
      sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <h2>Screenshots</h2>
    <div class="lp-screenshots">
      ${shotPaths.map(src => `<img src="${escapeAttr(src)}" alt="Screenshot" />`).join("")}
    </div>
  </div>
</section>`)
    }
  }

  const plans = Array.isArray(pricing.plans) ? pricing.plans : []
  if (plans.length > 0) {
    sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Planos</h2>
    ${pricing.subtitle ? `<p style="max-width:620px;color:rgba(15,23,42,0.7);margin:0 0 32px;">${escapeHtml(pricing.subtitle)}</p>` : ""}
    <div class="lp-pricing">
      ${plans.map(plan => `<div class="lp-pricing-card${plan?.featured ? " lp-featured" : ""}"><h3>${escapeHtml(plan?.name || "Plano")}</h3><div class="lp-price">${escapeHtml(plan?.price || "")}${plan?.period ? `<span>${escapeHtml(plan.period)}</span>` : ""}</div><ul class="lp-feature-list">${(plan?.features || []).map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul><a class="lp-button" href="${escapeAttr(plan?.href || "#")}">Escolher plano</a></div>`).join("")}
    </div>
  </div>
</section>`)
  }

  sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    ${leadForm.title ? `<h2>${escapeHtml(leadForm.title)}</h2>` : `<h2>Fale com a equipe</h2>`}
    ${leadForm.subtitle ? `<p style="max-width:520px;margin:0 0 24px;color:rgba(15,23,42,0.7);">${escapeHtml(leadForm.subtitle)}</p>` : ""}
    ${renderLeadForm({ submitLabel: leadForm.ctaText || "Enviar" })}
  </div>
</section>`)

  if (testimonials.length > 0) {
    sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Depoimentos</h2>
    <div class="lp-testimonials">
      ${testimonials.map(test => `<div class="lp-card"><blockquote>"${escapeHtml(test?.text || "Excelente resultado.")}"</blockquote><cite>${escapeHtml(test?.name || "Cliente feliz")}</cite></div>`).join("")}
    </div>
  </div>
</section>`)
  }

  if (faq.length > 0) {
    sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <h2>Perguntas frequentes</h2>
    <div class="lp-faq">
      ${faq.map(item => `<details><summary>${escapeHtml(item?.q || "Pergunta")}</summary><p>${escapeHtml(item?.a || "Resposta.")}</p></details>`).join("")}
    </div>
  </div>
</section>`)
  }

  sections.push(`
<footer class="lp-footer">
  <div class="lp-container">${escapeHtml(footerNote)}</div>
</footer>`)

  return {
    body: sections.join("\n"),
    title: hero.title || lp.titulo || "Landing Page SaaS",
    description: hero.subtitle || pricing.subtitle || "",
    accentColor: accent,
  }
}

// Constrói o HTML do template Waitlist
function buildEventoExport(lp) {
  const source = lp.content || {}
  const base = eventoDefault || {}
  const accent = safeColor(source.theme ?? base.theme, "#7c3aed")
  const hero = { ...(base.hero || {}), ...(source.hero || {}) }
  const highlights = pickArray(source.highlights, base.highlights)
  const speakers = pickArray(source.speakers, base.speakers)
  const footerNote = source.footer?.note ?? base.footer?.note ?? "Reserve sua vaga."

  const sections = []

  sections.push(`
<section class="lp-hero">
  <div class="lp-container lp-hero-inner">
    <div class="lp-hero-text">
      <span class="lp-meta">Evento</span>
      <h1>${escapeHtml(hero.title || lp.titulo || "Workshop")}</h1>
      ${hero.subtitle ? `<p class="lp-lead">${escapeHtml(hero.subtitle)}</p>` : ""}
      <p>${escapeHtml([hero.date, hero.place].filter(Boolean).join(" - "))}</p>
      <div class="lp-hero-actions">
        ${hero.ctaText ? `<a class="lp-button" href="${escapeAttr(hero.ctaHref || "#inscricao")}">${escapeHtml(hero.ctaText)}</a>` : ""}
      </div>
    </div>
  </div>
</section>`)

  if (highlights.length > 0) {
    sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <h2>O que esperar</h2>
    <ul class="lp-list">
      ${highlights.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  </div>
</section>`)
  }

  if (speakers.length > 0) {
    sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Palestrantes</h2>
    <div class="lp-grid lp-grid-2">
      ${speakers.map(sp => `<div class="lp-card"><h3>${escapeHtml(sp?.name || "Convidado")}</h3><p>${escapeHtml(sp?.role || "Especialista")}</p></div>`).join("")}
    </div>
  </div>
</section>`)
  }

  sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Garanta sua vaga</h2>
    ${renderLeadForm({ submitLabel: hero.ctaText || "Inscrever" })}
  </div>
</section>`)

  sections.push(`
<footer class="lp-footer">
  <div class="lp-container">${escapeHtml(footerNote)}</div>
</footer>`)

  return {
    body: sections.join("\n"),
    title: hero.title || lp.titulo || "Evento",
    description: hero.subtitle || "",
    accentColor: accent,
  }
}

// Constrói o HTML do template D2C
function buildD2CExport(lp) {
  const source = lp.content || {}
  const base = d2cDefault || {}
  const accent = safeColor(source.theme ?? base.theme, "#ef4444")
  const product = { ...(base.product || {}), ...(source.product || {}) }
  const footerNote = source.footer?.note ?? base.footer?.note ?? ""

  const bullets = pickArray(product.bullets, base.product?.bullets)
  const productImage = isNonEmptyString(product.img) ? `<div class="lp-hero-media"><img src="${escapeAttr(product.img)}" alt="${escapeAttr(product.name || "Produto")}" /></div>` : ""

  const sections = []

  sections.push(`
<section class="lp-hero">
  <div class="lp-container lp-hero-inner">
    <div class="lp-hero-text">
      <h1>${escapeHtml(product.name || lp.titulo || "Produto")}</h1>
      ${product.tagline ? `<p class="lp-lead">${escapeHtml(product.tagline)}</p>` : ""}
      ${bullets.length ? `<ul class="lp-list">${bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      <div class="lp-hero-actions">
        <div class="lp-price">${escapeHtml(product.price || "")}</div>
        ${product.ctaText ? `<a class="lp-button" href="${escapeAttr(product.ctaHref || "#comprar")}">${escapeHtml(product.ctaText)}</a>` : ""}
      </div>
    </div>
    ${productImage}
  </div>
</section>`)

  if (footerNote) {
    sections.push(`
<footer class="lp-footer">
  <div class="lp-container">${escapeHtml(footerNote)}</div>
</footer>`)
  }

  return {
    body: sections.join("\n"),
    title: product.name || lp.titulo || "Produto",
    description: product.tagline || "",
    accentColor: accent,
  }
}

// Constrói o HTML do template Portfolio
function buildPortfolioExport(lp) {
  const source = lp.content || {}
  const base = portfolioDefault || {}
  const accent = safeColor(source.theme ?? base.theme, "#22c55e")
  const hero = { ...(base.hero || {}), ...(source.hero || {}) }
  const services = pickArray(source.services, base.services)
  const showcase = pickArray(source.showcase, base.showcase)
  const footerNote = source.footer?.note ?? base.footer?.note ?? ""

  const sections = []

  sections.push(`
<section class="lp-hero">
  <div class="lp-container lp-hero-inner">
    <div class="lp-hero-text">
      <h1>${escapeHtml(hero.title || lp.titulo || "Portfolio")}</h1>
      ${hero.subtitle ? `<p class="lp-lead">${escapeHtml(hero.subtitle)}</p>` : ""}
    </div>
  </div>
</section>`)

  if (services.length > 0) {
    sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <h2>Servicos</h2>
    <div class="lp-grid lp-grid-3">
      ${services.map(service => `<div class="lp-card"><h3>${escapeHtml(service?.title || "Servico")}</h3><p>${escapeHtml(service?.text || "Detalhe do servico")}</p></div>`).join("")}
    </div>
  </div>
</section>`)
  }

  if (showcase.length > 0) {
    sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Projetos</h2>
    <div class="lp-grid lp-grid-2">
      ${showcase.map(item => `<div class="lp-card"><h3>${escapeHtml(item?.name || "Projeto")}</h3><p>${escapeHtml(item?.role || "Resultado")}</p></div>`).join("")}
    </div>
  </div>
</section>`)
  }

  sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Fale comigo</h2>
    ${renderLeadForm({ submitLabel: "Enviar mensagem" })}
  </div>
</section>`)

  if (footerNote) {
    sections.push(`
<footer class="lp-footer">
  <div class="lp-container">${escapeHtml(footerNote)}</div>
</footer>`)
  }

  return {
    body: sections.join("\n"),
    title: hero.title || lp.titulo || "Portfolio",
    description: hero.subtitle || "",
    accentColor: accent,
  }
}

// Constrói o HTML do template Waitlist
function buildWaitlistExport(lp) {
  const source = lp.content || {}
  const base = waitlistDefault || {}
  const accent = safeColor(source.theme ?? base.theme, "#06b6d4")
  const hero = { ...(base.hero || {}), ...(source.hero || {}) }
  const bullets = pickArray(source.bullets, base.bullets)
  const footerNote = source.footer?.note ?? base.footer?.note ?? ""

  const sections = []

  sections.push(`
<section class="lp-hero">
  <div class="lp-container lp-hero-inner">
    <div class="lp-hero-text">
      <h1>${escapeHtml(hero.title || lp.titulo || "Lista de espera")}</h1>
      ${hero.subtitle ? `<p class="lp-lead">${escapeHtml(hero.subtitle)}</p>` : ""}
    </div>
  </div>
</section>`)

  if (bullets.length > 0) {
    sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <ul class="lp-list">
      ${bullets.map(item => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  </div>
</section>`)
  }

  sections.push(`
<section class="lp-section">
  <div class="lp-container">
    <h2>Entre na lista</h2>
    ${renderLeadForm({ submitLabel: "Quero participar", fields: [
      { label: "Nome", type: "text", name: "nome", placeholder: "Seu nome" },
      { label: "E-mail", type: "email", name: "email", placeholder: "Seu melhor e-mail" },
    ] })}
  </div>
</section>`)

  if (footerNote) {
    sections.push(`
<footer class="lp-footer">
  <div class="lp-container">${escapeHtml(footerNote)}</div>
</footer>`)
  }

  return {
    body: sections.join("\n"),
    title: hero.title || lp.titulo || "Lista de espera",
    description: hero.subtitle || "",
    accentColor: accent,
  }
}

// Constrói o HTML do template Plans
function buildPlansExport(lp) {
  const source = lp.content || {}
  const base = plansDefault || {}
  const accent = safeColor(source.theme ?? base.theme, "#f59e0b")
  const hero = { ...(base.hero || {}), ...(source.hero || {}) }
  const features = pickArray(source.features, base.features)
  const plans = pickArray(source.plans, base.plans)
  const footerNote = source.footer?.note ?? base.footer?.note ?? ""

  const sections = []

  sections.push(`
<section class="lp-hero">
  <div class="lp-container lp-hero-inner">
    <div class="lp-hero-text">
      <h1>${escapeHtml(hero.title || lp.titulo || "Planos")}</h1>
      ${hero.subtitle ? `<p class="lp-lead">${escapeHtml(hero.subtitle)}</p>` : ""}
    </div>
  </div>
</section>`)

  if (features.length && plans.length) {
    const headerRow = plans.map(plan => `<th>${escapeHtml(plan?.name || "Plano")}<div style="font-weight:400;font-size:0.8rem;color:rgba(15,23,42,0.6);margin-top:6px;">${escapeHtml(plan?.price || "")}</div></th>`).join("")
    const rows = features.map((featureName, rowIndex) => {
      const values = plans.map(plan => `<td>${escapeHtml(plan?.values?.[rowIndex] || "-")}</td>`).join("")
      return `<tr><td style="font-weight:600;color:#0f172a;">${escapeHtml(featureName)}</td>${values}</tr>`
    }).join("\n")

    const actions = plans.map(plan => `<td><a class="lp-button" href="${escapeAttr(plan?.href || "#")}">Escolher ${escapeHtml(plan?.name || "")}</a></td>`).join("")

    sections.push(`
<section class="lp-section lp-section-muted">
  <div class="lp-container">
    <div class="lp-table-wrapper">
      <table class="lp-table">
        <thead><tr><th></th>${headerRow}</tr></thead>
        <tbody>
          ${rows}
          <tr><td></td>${actions}</tr>
        </tbody>
      </table>
    </div>
  </div>
</section>`)
  }

  if (footerNote) {
    sections.push(`
<footer class="lp-footer">
  <div class="lp-container">${escapeHtml(footerNote)}</div>
</footer>`)
  }

  return {
    body: sections.join("\n"),
    title: hero.title || lp.titulo || "Planos",
    description: hero.subtitle || "",
    accentColor: accent,
  }
}

// Renderiza um formulário de lead gen simples
function renderLeadForm({ submitLabel = "Enviar", fields } = {}) {
  const fallbackFields = [
    { label: "Nome", type: "text", name: "nome", placeholder: "Seu nome" },
    { label: "E-mail", type: "email", name: "email", placeholder: "Seu melhor e-mail" },
    { label: "Mensagem", type: "textarea", name: "mensagem", placeholder: "Conte mais sobre sua necessidade" },
    { label: "Telefone", type: "tel", name: "telefone", placeholder: "Seu telefone" },
    { type: "note", text: "Retorno em até 24 horas" },
  ]
  const list = Array.isArray(fields) && fields.length ? fields : fallbackFields

  const inputs = list.map(field => {
    const label = escapeHtml(field.label || "Campo")
    const name = escapeAttr(field.name || "campo")
    const placeholder = escapeAttr(field.placeholder || "")
    if (field.type === "note") {
      return `<p class="lp-form-note">Retorno em 24 horas comerciais.</p>`
    }
    if (field.type === "textarea") {
      return `<label class="lp-form-field"><span>${label}</span><textarea name="${name}" rows="4" placeholder="${placeholder}"></textarea></label>`
    }
    const type = escapeAttr(field.type || "text")
    return `<label class="lp-form-field"><span>${label}</span><input type="${type}" name="${name}" placeholder="${placeholder}" /></label>`
  }).join("\n")

  return `<form class="lp-form" data-export-form="true">
${inputs}
<button type="submit" class="lp-button">${escapeHtml(submitLabel)}</button>
</form>`
}

// Funções de sanity check e escape
function guessExtension(url) {
  try {

    // Extrai a extensão do URL, ignorando query strings e hashes
    const clean = String(url || "").split(/[?#]/)[0]
    // Pega a última parte do caminho
    const lastPart = clean.split("/").pop() || ""
    // Procura o último ponto para extrair a extensão
    const dotIndex = lastPart.lastIndexOf(".")
    // Se não encontrar, retorna null
    if (dotIndex === -1) return null
    const ext = lastPart.slice(dotIndex + 1).toLowerCase()
    return /^[a-z0-9]{2,8}$/.test(ext) ? ext : null
  } catch {
    return null
  }
}

function sanitizeFilename(name) {
  const base = String(name || "asset").toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "")
  return base || "asset"
}

function pickArray(primary, fallback = []) {
  if (Array.isArray(primary) && primary.length) return primary
  if (Array.isArray(fallback)) return fallback
  return []
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0
}

function plainText(input) {
  if (Array.isArray(input)) return input.map(plainText).join(" ")
  return String(input || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
}

function safeColor(value, fallback) {
  if (!isNonEmptyString(value)) return fallback
  const trimmed = value.trim()
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed) || /^[a-zA-Z]+$/.test(trimmed) || /^rgba?\([^)]{1,50}\)$/.test(trimmed)) {
    return trimmed
  }
  return fallback
}

function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]))
}

function escapeAttr(s = "") {
  return String(s).replace(/"/g, "&quot;")
}

function sanitize(s = "") {
  return s.replace(/[^\p{L}\p{N}\-_. ]/gu, "").replace(/\s+/g, "_").toLowerCase()
}
