import JSZip from "jszip"
import { saveAs } from "file-saver"

export async function exportLandingPageZip(lp) {
  const zip = new JSZip()

  const css = `
:root { --theme: ${lp.content?.theme ?? "#0ea5e9"}; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
*{box-sizing:border-box} body{margin:0;color:#111}
header{padding:24px;background:var(--theme);color:#fff}
.container{max-width:960px;margin:0 auto;padding:24px}
.hero{width:100%;border:1px solid #e5e7eb;border-radius:12px}
.btn{display:inline-block;padding:10px 14px;border:2px solid var(--theme);color:var(--theme);border-radius:10px;text-decoration:none}
.card{border:1px solid #e5e7eb;border-radius:12px;padding:16px}
footer{padding:24px;color:#6b7280}
`
  const html = `
<!doctype html>
<html lang="pt-br">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(lp.titulo)}</title>
<link rel="stylesheet" href="./styles.css"/>
</head>
<body>
<header>
  <div class="container">
    <h1 style="font-size:28px;margin:0 0 4px">${escapeHtml(lp.content?.headline ?? "Título")}</h1>
    <p style="margin:0;opacity:.9">${escapeHtml(lp.content?.subhead ?? "")}</p>
  </div>
</header>
<main class="container">
  ${lp.content?.heroUrl ? `<img class="hero" src="${escapeAttr(lp.content.heroUrl)}" alt="hero"/>` : ""}
  <div class="card" style="margin:16px 0">
    <p style="font-size:18px;line-height:1.5">${escapeHtml(lp.content?.body ?? "")}</p>
  </div>
  <a class="btn" href="${escapeAttr(lp.content?.ctaHref ?? "#")}">${escapeHtml(lp.content?.ctaText ?? "Saiba mais")}</a>
</main>
<footer class="container">© ${new Date().getFullYear()}</footer>
</body>
</html>
`

  zip.file("index.html", html.trim())
  zip.file("styles.css", css.trim())
  const blob = await zip.generateAsync({ type: "blob" })
  saveAs(blob, sanitize(`${lp.titulo || "landing-page"}.zip`))
}

function escapeHtml(s=""){ return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])) }
function escapeAttr(s=""){ return String(s).replace(/"/g,"&quot;") }
function sanitize(s=""){ return s.replace(/[^\p{L}\p{N}\-_. ]/gu,"").replace(/\s+/g,"_").toLowerCase() }