// Builds the QFoundry asset set (direction A, Crucible).
// usage: node build.mjs <outDir> <playwrightPackageDir> <mandaram.ttf>
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import opentype from 'opentype.js'

const require = createRequire(import.meta.url)
const HERE = path.dirname(fileURLToPath(import.meta.url))
const [OUT, PW_DIR, MANDARAM] = process.argv.slice(2)
const { chromium } = require(PW_DIR)

// ---------- palette ----------
const C = {
  indigo: '#432dd7', indigo600: '#5f57ee', indigo400: '#9b9cff', lilac: '#CBC8FF',
  molten: '#F2551B', moltenLight: '#FF8A50', ink: '#1B1446', navy: '#121e28',
  wash: '#F6F4FF', white: '#ffffff', black: '#000000', muted: '#5A5878', border: '#E6E3F5',
}
const LIGHT = { ring: C.indigo, drop: C.molten, text: C.ink, qual: C.indigo600 }
const REVERSED = { ring: C.white, drop: C.moltenLight, text: C.white, qual: C.lilac }

// ---------- fonts ----------
const FDIR = path.join(HERE, 'node_modules/@fontsource/plus-jakarta-sans/files')
const load = (f) => { const b = fs.readFileSync(f); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)) }
const XB = load(path.join(FDIR, 'plus-jakarta-sans-latin-800-normal.woff'))
const MD = load(path.join(FDIR, 'plus-jakarta-sans-latin-500-normal.woff'))
const capH = (font, size) => font.tables.os2.sCapHeight * size / font.unitsPerEm
const r2 = (n) => Math.round(n * 100) / 100

function text(font, str, x, y, size, ls = -0.025) {
  const glyphs = font.stringToGlyphs(str)
  const scale = size / font.unitsPerEm
  let cx = x, d = '', x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
  glyphs.forEach((g, i) => {
    const p = g.getPath(cx, y, size)
    if (p.commands.length) {
      d += p.toPathData(2)
      const b = p.getBoundingBox()
      x1 = Math.min(x1, b.x1); y1 = Math.min(y1, b.y1); x2 = Math.max(x2, b.x2); y2 = Math.max(y2, b.y2)
    }
    let adv = g.advanceWidth * scale
    if (i < glyphs.length - 1) adv += font.getKerningValue(g, glyphs[i + 1]) * scale + ls * size
    cx += adv
  })
  return { d, advance: cx - x, x1, y1, x2, y2 }
}
const width = (font, str, size, ls) => text(font, str, 0, 0, size, ls).advance

function wrap(font, str, size, maxW, ls) {
  const words = str.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w
    if (width(font, t, size, ls) > maxW && cur) { lines.push(cur); cur = w } else cur = t
  }
  if (cur) lines.push(cur)
  return lines
}

// ---------- the mark ----------
// Drawn in a 64-unit grid; its ink box is x 5..58, y 5..58 (centre 31.5, size 53).
function mark(ring, drop, cx, cy, size, cls = false) {
  const k = size / 53
  const rc = cls ? ' class="r"' : ''
  const dc = cls ? ' class="d"' : ''
  return `<g transform="translate(${r2(cx - 31.5 * k)} ${r2(cy - 31.5 * k)}) scale(${+k.toFixed(4)})">` +
    `<path${rc} d="M35.18 49.32A20 20 0 1 1 49.32 35.18" fill="none" stroke="${ring}" stroke-width="10" stroke-linecap="round"/>` +
    `<circle${dc} cx="51.5" cy="51.5" r="6.5" fill="${drop}"/></g>`
}

const doc = (vb, body, w, h, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${extra}${body}</svg>`

function fit(g, pad = 0) {
  const x = g.x1 - pad, y = g.y1 - pad, w = g.x2 - g.x1 + pad * 2, h = g.y2 - g.y1 + pad * 2
  return doc(`${r2(x)} ${r2(y)} ${r2(w)} ${r2(h)}`, g.body, Math.ceil(w), Math.ceil(h))
}
const place = (g, x, y) => `<g transform="translate(${r2(x - g.x1)} ${r2(y - g.y1)})">${g.body}</g>`

// ---------- lockups ----------
function lockupH(F, col, qualifier) {
  const M = 1.4 * F, gap = 0.32 * F, midY = -capH(XB, F) / 2
  const t = text(XB, 'QFoundry', M + gap, 0, F)
  let body = mark(col.ring, col.drop, M / 2, midY, M) + `<path d="${t.d}" fill="${col.text}"/>`
  let x2 = t.x2, y1 = Math.min(midY - M / 2, t.y1), y2 = Math.max(midY + M / 2, t.y2)
  if (qualifier) {
    const q = text(MD, qualifier, M + gap + t.advance + 0.26 * F, 0, F, -0.015)
    body += `<path d="${q.d}" fill="${col.qual}"/>`
    x2 = q.x2; y1 = Math.min(y1, q.y1); y2 = Math.max(y2, q.y2)
  }
  return { body, x1: 0, y1, x2, y2 }
}
function lockupStacked(F, col) {
  const t = text(XB, 'QFoundry', 0, 0, F)
  const M = 2.6 * F, gap = 0.34 * F, cx = (t.x1 + t.x2) / 2, cy = t.y1 - gap - M / 2
  const body = mark(col.ring, col.drop, cx, cy, M) + `<path d="${t.d}" fill="${col.text}"/>`
  return { body, x1: Math.min(t.x1, cx - M / 2), y1: cy - M / 2, x2: Math.max(t.x2, cx + M / 2), y2: t.y2 }
}
function wordmark(F, color) {
  const t = text(XB, 'QFoundry', 0, 0, F)
  return { body: `<path d="${t.d}" fill="${color}"/>`, x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2 }
}
function pdfFooter(F) {
  const M = 1.25 * F, gap = 0.3 * F, midY = -capH(MD, F) / 2
  const a = text(MD, 'Prepared with ', M + gap, 0, F, 0)
  const b = text(XB, 'QFoundry', M + gap + a.advance, 0, F, -0.02)
  const body = mark(C.black, C.black, M / 2, midY, M) + `<path d="${a.d}${b.d}" fill="${C.black}"/>`
  return { body, x1: 0, y1: Math.min(midY - M / 2, a.y1, b.y1), x2: b.x2, y2: Math.max(midY + M / 2, a.y2, b.y2) }
}

// Lines of text, left-aligned or centred, returned as one group with a y cursor.
function lines(font, strs, x, baseline, size, lh, color, { ls = -0.015, align = 'left', boxW = 0 } = {}) {
  let body = ''
  strs.forEach((s, i) => {
    let lx = x
    if (align === 'center') lx = x + (boxW - width(font, s, size, ls)) / 2
    const t = text(font, s, lx, baseline + i * lh, size, ls)
    body += `<path d="${t.d}" fill="${color}"/>`
  })
  return body
}

// ---------- icons ----------
function tile(S, ground, ring, drop, { rx = 0, markFrac = 0.6, border = false } = {}) {
  let body = `<rect width="${S}" height="${S}" rx="${rx}" fill="${ground}"/>`
  if (border) body += `<rect x="${S * 0.0075}" y="${S * 0.0075}" width="${S * 0.985}" height="${S * 0.985}" rx="${rx}" fill="none" stroke="${C.border}" stroke-width="${S * 0.015}"/>`
  body += mark(ring, drop, S / 2, S / 2, S * markFrac)
  return doc(`0 0 ${S} ${S}`, body, S, S)
}
const bareMark = (S, ring, drop, frac = 60 / 64) => doc(`0 0 ${S} ${S}`, mark(ring, drop, S / 2, S / 2, S * frac), S, S)

// ---------- raster via Chromium ----------
let page
async function raster(svg, w, h, type = 'image/png', quality = 0.92) {
  const url = await page.evaluate(async ({ svg, w, h, type, quality }) => {
    const img = new Image()
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
    await img.decode()
    const c = document.createElement('canvas'); c.width = w; c.height = h
    c.getContext('2d').drawImage(img, 0, 0, w, h)
    return c.toDataURL(type, quality)
  }, { svg, w, h, type, quality })
  return Buffer.from(url.split(',')[1], 'base64')
}
const sized = (svg, w, h) => svg.replace(/width="[^"]+" height="[^"]+"/, `width="${w}" height="${h}"`)

function ico(pngs) { // [{size, buf}]
  const head = Buffer.alloc(6 + 16 * pngs.length)
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(pngs.length, 4)
  let off = head.length
  pngs.forEach((p, i) => {
    const o = 6 + i * 16
    head.writeUInt8(p.size >= 256 ? 0 : p.size, o); head.writeUInt8(p.size >= 256 ? 0 : p.size, o + 1)
    head.writeUInt8(0, o + 2); head.writeUInt8(0, o + 3)
    head.writeUInt16LE(1, o + 4); head.writeUInt16LE(32, o + 6)
    head.writeUInt32LE(p.buf.length, o + 8); head.writeUInt32LE(off, o + 12)
    off += p.buf.length
  })
  return Buffer.concat([head, ...pngs.map((p) => p.buf)])
}

const written = []
function put(rel, data) {
  const f = path.join(OUT, rel)
  fs.mkdirSync(path.dirname(f), { recursive: true })
  fs.writeFileSync(f, data)
  written.push(rel)
}

// ---------- contrast ----------
const lum = (hex) => {
  const n = hex.replace('#', '')
  const v = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

async function main() {
  const browser = await chromium.launch()
  page = await browser.newPage()
  await page.setContent('<html><body></body></html>')

  // ===== master/ =====
  const F = 100
  put('master/qfoundry-mark.svg', bareMark(64, C.indigo, C.molten))
  put('master/qfoundry-mark-white.svg', bareMark(64, C.white, C.moltenLight))
  put('master/qfoundry-mark-black.svg', bareMark(64, C.black, C.black))
  put('master/qfoundry-mark-mono.svg', bareMark(64, C.indigo, C.indigo))
  put('master/qfoundry-mark-mono-white.svg', bareMark(64, C.white, C.white))
  put('master/qfoundry-wordmark.svg', fit(wordmark(F, C.ink)))
  put('master/qfoundry-wordmark-white.svg', fit(wordmark(F, C.white)))
  put('master/qfoundry-lockup-horizontal.svg', fit(lockupH(F, LIGHT)))
  put('master/qfoundry-lockup-horizontal-white.svg', fit(lockupH(F, REVERSED)))
  put('master/qfoundry-lockup-stacked.svg', fit(lockupStacked(F, LIGHT)))
  put('master/qfoundry-lockup-stacked-white.svg', fit(lockupStacked(F, REVERSED)))
  for (const q of ['Studio', 'Prep', 'Writer']) {
    put(`master/qfoundry-${q.toLowerCase()}-horizontal.svg`, fit(lockupH(F, LIGHT, q)))
    put(`master/qfoundry-${q.toLowerCase()}-horizontal-white.svg`, fit(lockupH(F, REVERSED, q)))
  }

  // ===== per-app icons =====
  const apps = {
    // Every favicon is a tile. A bare mark that switched colour with
    // prefers-color-scheme vanished on a white tab under a dark OS: the media
    // query follows the OS, not the tab.
    homepage: { name: 'QFoundry', short: 'QFoundry', theme: C.indigo, bg: C.white, ground: C.indigo, ring: C.white, drop: C.moltenLight, fav: 'tile' },
    studio: { name: 'QFoundry Studio', short: 'Studio', theme: C.indigo, bg: C.white, ground: C.indigo, ring: C.white, drop: C.moltenLight, fav: 'tile' },
    prep: { name: 'QFoundry Prep', short: 'Prep', theme: '#eff1f5', bg: '#eff1f5', ground: C.white, ring: C.indigo, drop: C.molten, fav: 'tile', border: true },
    writer: { name: 'QFoundry Writer', short: 'Writer', theme: C.ink, bg: C.white, ground: C.ink, ring: C.white, drop: C.molten, fav: 'tile' },
  }
  for (const [key, a] of Object.entries(apps)) {
    let favSvg, favLight
    if (a.fav === 'bare') {
      const style = `<style>.r{stroke:${C.indigo}}.d{fill:${C.molten}}@media (prefers-color-scheme: dark){.r{stroke:${C.white}}.d{fill:${C.moltenLight}}}</style>`
      favSvg = doc('0 0 64 64', mark(C.indigo, C.molten, 32, 32, 62, true), 64, 64, style)
      favLight = doc('0 0 64 64', mark(C.indigo, C.molten, 32, 32, 62), 64, 64)
    } else {
      // A white tile gets a brand-200 edge so it reads on a dark tab; on a
      // white tab the indigo mark carries it.
      const edge = a.border ? `<rect x="1" y="1" width="62" height="62" rx="13" fill="none" stroke="#d9d3fd" stroke-width="2"/>` : ''
      favSvg = doc('0 0 64 64', `<rect width="64" height="64" rx="14" fill="${a.ground}"/>` + edge + mark(a.ring, a.drop, 32, 32, 44), 64, 64)
      favLight = favSvg
    }
    put(`${key}/favicon.svg`, favSvg)
    const f16 = await raster(sized(favLight, 16, 16), 16, 16)
    const f32 = await raster(sized(favLight, 32, 32), 32, 32)
    const f48 = await raster(sized(favLight, 48, 48), 48, 48)
    put(`${key}/favicon-16x16.png`, f16)
    put(`${key}/favicon-32x32.png`, f32)
    put(`${key}/favicon.ico`, ico([{ size: 16, buf: f16 }, { size: 32, buf: f32 }, { size: 48, buf: f48 }]))
    put(`${key}/apple-touch-icon.png`, await raster(tile(180, a.ground, a.ring, a.drop, { markFrac: 0.58 }), 180, 180))
    for (const S of [192, 512]) {
      put(`${key}/android-chrome-${S}x${S}.png`, await raster(tile(S, a.ground, a.ring, a.drop, { rx: S * 0.22, markFrac: 0.58, border: a.border }), S, S))
    }
    put(`${key}/maskable-icon-512x512.png`, await raster(tile(512, a.ground, a.ring, a.drop, { markFrac: 0.5 }), 512, 512))
    put(`${key}/monochrome-icon-512x512.png`, await raster(bareMark(512, C.black, C.black, 0.5), 512, 512))
    put(`${key}/site.webmanifest`, JSON.stringify({
      name: a.name, short_name: a.short, start_url: '/', display: 'standalone',
      theme_color: a.theme, background_color: a.bg,
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        { src: '/monochrome-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' },
      ],
    }, null, 2) + '\n')
  }

  // ===== in-app marks =====
  for (const [name, ring, drop] of [['blue', C.indigo, C.molten], ['white', C.white, C.moltenLight]]) {
    const m = bareMark(64, ring, drop)
    for (const S of [80, 160, 240]) put(`in-app/logo-only-${name}-${S}.webp`, await raster(sized(m, S, S), S, S, 'image/webp', 0.95))
    put(`in-app/logo-only-${name}.png`, await raster(sized(m, 1024, 1024), 1024, 1024))
  }

  // ===== social =====
  async function og(file, { ground, col, qualifier, headline, sub, subColor }) {
    const W = 1200, H = 630
    const lk = lockupH(46, col, qualifier)
    const hl = wrap(XB, headline, 58, 640, -0.02)
    let body = `<rect width="${W}" height="${H}" fill="${ground}"/>` + place(lk, 80, 80)
    const base = 300 - (hl.length - 2) * 34
    body += lines(XB, hl, 80, base, 58, 68, col.text, { ls: -0.02 })
    body += lines(MD, [sub], 80, 548, 28, 34, subColor, { ls: -0.005 })
    body += mark(col.ring, col.drop, 955, 330, 340)
    put(`social/${file}`, await raster(doc(`0 0 ${W} ${H}`, body, W, H), W, H))
  }
  const LIGHT_SOFT = { ...LIGHT }
  await og('og-image.png', { ground: C.indigo, col: REVERSED, headline: 'The complete workspace for Kerala PSC exam content', sub: 'qfoundry.in', subColor: C.lilac })
  await og('og-image-studio.png', { ground: C.indigo, col: REVERSED, qualifier: 'Studio', headline: 'Build papers, publish them to your learners, post them to Telegram.', sub: 'studio.qfoundry.in', subColor: C.lilac })
  await og('og-image-prep.png', { ground: C.wash, col: LIGHT_SOFT, qualifier: 'Prep', headline: 'Practise Kerala PSC papers from your institute, on your phone.', sub: 'prep.qfoundry.in', subColor: C.indigo600 })
  await og('og-image-writer.png', { ground: C.ink, col: { ...REVERSED, drop: C.molten }, qualifier: 'Writer', headline: 'Add questions to the exam papers assigned to you.', sub: 'writer.qfoundry.in', subColor: C.lilac })

  const avatar = (S) => tile(S, C.indigo, C.white, C.moltenLight, { markFrac: 0.56 })
  put('social/telegram-bot-avatar-640.png', await raster(avatar(640), 640, 640))
  put('social/x-profile-400.png', await raster(avatar(400), 400, 400))
  put('social/instagram-profile-1080.png', await raster(avatar(1080), 1080, 1080))

  {
    const W = 640, H = 360
    const lk = lockupH(40, REVERSED)
    const lw = lk.x2 - lk.x1
    let body = `<rect width="${W}" height="${H}" fill="${C.indigo}"/>` + place(lk, (W - lw) / 2, 112)
    const ls = wrap(MD, 'Kerala PSC papers from your institute, inside Telegram.', 26, 500, -0.005)
    body += lines(MD, ls, 0, 236, 26, 34, C.white, { align: 'center', boxW: W, ls: -0.005 })
    put('social/telegram-description-640x360.png', await raster(doc(`0 0 ${W} ${H}`, body, W, H), W, H))
  }
  {
    const W = 1500, H = 500
    const lk = lockupH(50, REVERSED)
    let body = `<rect width="${W}" height="${H}" fill="${C.indigo}"/>` + place(lk, 620, 120)
    const hl = wrap(XB, 'The complete workspace for Kerala PSC exam content', 44, 760, -0.02)
    body += lines(XB, hl, 620, 290, 44, 54, C.white, { ls: -0.02 })
    body += lines(MD, ['qfoundry.in'], 620, 420, 26, 30, C.lilac, { ls: -0.005 })
    put('social/x-header-1500x500.png', await raster(doc(`0 0 ${W} ${H}`, body, W, H), W, H))
  }
  {
    const S = 1080
    const lk = lockupH(40, LIGHT)
    let body = `<rect width="${S}" height="${S}" fill="${C.wash}"/>` + place(lk, 96, 96)
    const hl = wrap(XB, 'Your headline goes here', 96, 880, -0.025)
    body += lines(XB, hl, 96, 470, 96, 108, C.ink, { ls: -0.025 })
    const sl = wrap(MD, 'One line on what changed and why it matters to an institute.', 38, 860, -0.01)
    body += lines(MD, sl, 96, 470 + hl.length * 108 + 30, 38, 50, C.muted, { ls: -0.01 })
    body += lines(MD, ['qfoundry.in'], 96, 984, 30, 34, C.indigo600, { ls: -0.005 })
    put('social/square-announcement-1080.png', await raster(doc(`0 0 ${S} ${S}`, body, S, S), S, S))
  }

  // ===== print =====
  put('print/qfoundry-pdf-footer.svg', fit(pdfFooter(100)))
  {
    const wm = text(XB, 'QFOUNDRY', 0, 0, 150, 0.12)
    const wm2 = text(MD, 'qfoundry.in', 0, 0, 64, 0.02)
    const wmw = wm.x2 - wm.x1, wm2w = wm2.x2 - wm2.x1
    const water = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1240 1754" width="1240" height="1754" style="position:absolute;left:0;top:0">` +
      `<g transform="rotate(-35 620 877)" fill="#000" fill-opacity="0.10">` +
      `<g transform="translate(${r2(620 - wmw / 2 - wm.x1)} ${877})"><path d="${wm.d}"/></g>` +
      `<g transform="translate(${r2(620 - wm2w / 2 - wm2.x1)} ${877 + 110})"><path d="${wm2.d}"/></g></g></svg>`
    const foot = fit(pdfFooter(100)).replace(/width="\d+" height="\d+"/, 'height="26"')
    const qs = [
      ['Which river is known as the lifeline of Kerala?', ['Bharathapuzha', 'Periyar', 'Pamba', 'Chaliyar'], false],
      ['ഇന്ത്യയുടെ ദേശീയ പക്ഷി ഏത്?', ['കുയിൽ', 'മയിൽ', 'തത്ത', 'പ്രാവ്'], true],
      ['Who was the first Chief Minister of Kerala?', ['E. M. S. Namboodiripad', 'Pattom Thanu Pillai', 'R. Sankar', 'C. Achutha Menon'], false],
      ['കേരളത്തിന്റെ തലസ്ഥാനം ഏത്?', ['കൊച്ചി', 'കോഴിക്കോട്', 'തിരുവനന്തപുരം', 'തൃശ്ശൂർ'], true],
      ['In which year was the state of Kerala formed?', ['1947', '1950', '1956', '1960'], false],
      ['\'ഇന്ദുലേഖ\' എന്ന നോവൽ എഴുതിയത് ആര്?', ['ഒ. ചന്തുമേനോൻ', 'സി. വി. രാമൻപിള്ള', 'തകഴി', 'ബഷീർ'], true],
      ['Silent Valley National Park is in which district?', ['Idukki', 'Wayanad', 'Palakkad', 'Kannur'], false],
      ['ലോക പരിസ്ഥിതി ദിനം എന്ന്?', ['ജൂൺ 5', 'മാർച്ച് 22', 'ഏപ്രിൽ 22', 'ഡിസംബർ 10'], true],
    ]
    const qHtml = qs.map(([q, opts, ml], i) =>
      `<div class="q${ml ? ' ml' : ''}"><div>${i + 1}. ${q}</div><div class="opts">${opts.map((o, j) => `<span>(${'ABCD'[j]}) ${o}</span>`).join('')}</div></div>`).join('')
    const font = fs.readFileSync(MANDARAM).toString('base64')
    const html = `<html><head><style>
      @font-face{font-family:Mandaram;src:url(data:font/ttf;base64,${font})}
      body{margin:0;background:#888}
      .page{position:relative;width:1240px;height:1754px;box-sizing:border-box;padding:120px 120px 140px;background:#fff;color:#000;font-family:Georgia,'Times New Roman',serif;filter:grayscale(1)}
      h1{margin:0;text-align:center;font-size:34px;letter-spacing:.04em}
      .meta{display:flex;justify-content:space-between;margin:22px 0 40px;padding-bottom:16px;border-bottom:2px solid #000;font-size:22px}
      .q{margin-bottom:34px;font-size:25px;line-height:1.5}
      .ml{font-family:Mandaram,serif;font-size:31px}
      .opts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 40px;margin-top:8px;padding-left:30px}
      .foot{position:absolute;left:120px;right:120px;bottom:70px;display:flex;justify-content:space-between;align-items:center;border-top:1px solid #000;padding-top:16px;font-size:20px}
    </style></head><body><div class="page" id="p">${water}
      <h1>MODEL EXAMINATION · SERIES A</h1>
      <div class="meta"><span>Time: 75 minutes</span><span>Booklet code: A</span><span>Marks: 100</span></div>
      ${qHtml}
      <div class="foot">${foot}<span>Page 1</span></div>
    </div></body></html>`
    const sp = await browser.newPage({ viewport: { width: 1240, height: 1754 } })
    await sp.setContent(html)
    await sp.evaluate(() => document.fonts.ready)
    put('print/watermark-specimen-a4.png', await sp.locator('#p').screenshot())
    await sp.close()
  }

  // ===== palette =====
  const pairs = [
    ['White on Indigo 800 (--cta)', C.white, C.indigo, 4.5],
    ['Indigo 800 on white (links, primary text)', C.indigo, C.white, 4.5],
    ['Indigo 600 on white (qualifier, hover)', C.indigo600, C.white, 4.5],
    ['White on Indigo 600 (dark-mode --cta)', C.white, C.indigo600, 4.5],
    ['Ink on white (body text)', C.ink, C.white, 4.5],
    ['Muted on white (secondary text)', C.muted, C.white, 4.5],
    ['Indigo 400 on navy (dark-mode links)', C.indigo400, C.navy, 4.5],
    ['Lilac on Indigo 800 (qualifier, reversed)', C.lilac, C.indigo, 4.5],
    ['Molten on white (mark drop, graphics only)', C.molten, C.white, 3],
    ['Molten 700 on white (accent text)', '#C2410C', C.white, 4.5],
    ['Molten light on Indigo 800 (reversed drop)', C.moltenLight, C.indigo, 3],
    ['Molten on navy (drop on dark)', C.molten, C.navy, 3],
    ['Molten on ink (Writer icon drop)', C.molten, C.ink, 3],
    ['White on navy', C.white, C.navy, 4.5],
    ['Success #15803D on white', '#15803D', C.white, 4.5],
    ['Warning #B45309 on white', '#B45309', C.white, 4.5],
    ['Danger #DC2626 on white', '#DC2626', C.white, 4.5],
    ['Info #2563EB on white', '#2563EB', C.white, 4.5],
    ['Success #4ADE80 on navy', '#4ADE80', C.navy, 4.5],
    ['Warning #FBBF24 on navy', '#FBBF24', C.navy, 4.5],
    ['Danger #F87171 on navy', '#F87171', C.navy, 4.5],
    ['Info #60A5FA on navy', '#60A5FA', C.navy, 4.5],
  ]
  const table = ['| Pair | Foreground | Background | Ratio | Needs | Result |', '|---|---|---|---|---|---|',
    ...pairs.map(([l, f, b, need]) => { const r = ratio(f, b); return `| ${l} | \`${f}\` | \`${b}\` | ${r.toFixed(2)}:1 | ${need}:1 | ${r >= need ? 'pass' : 'fail'} |` })].join('\n')
  put('palette/contrast.md', '# QFoundry palette: contrast\n\nComputed with the WCAG 2.1 relative-luminance formula by the build script. Text needs 4.5:1; graphics and large text need 3:1.\n\n' + table + `\n\nNot used on purpose: Indigo 800 on navy is ${ratio(C.indigo, C.navy).toFixed(2)}:1, which is why the mark turns white on every dark ground.\n`)

  // ===== contact sheet (for review only) =====
  const imgs = written.filter((f) => /\.(png|webp|svg)$/.test(f) && !f.startsWith('print/watermark'))
  const cells = imgs.map((f) => {
    const buf = fs.readFileSync(path.join(OUT, f))
    const mime = f.endsWith('.svg') ? 'image/svg+xml' : f.endsWith('.webp') ? 'image/webp' : 'image/png'
    const dark = /white|monochrome/.test(f) && !/og-|announcement/.test(f)
    return `<figure style="margin:0;background:${dark ? '#121e28' : '#fff'};border:1px solid #ccc;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px"><img src="data:${mime};base64,${buf.toString('base64')}" style="max-width:280px;max-height:150px"><figcaption style="font:11px sans-serif;color:${dark ? '#ddd' : '#333'}">${f}</figcaption></figure>`
  }).join('')
  const sheet = await browser.newPage({ viewport: { width: 1600, height: 900 } })
  await sheet.setContent(`<html><body style="margin:0;padding:12px;background:#ddd;display:flex;flex-wrap:wrap;gap:8px">${cells}</body></html>`)
  await sheet.screenshot({ path: path.join(HERE, 'contact-sheet.png'), fullPage: true })

  await browser.close()
  console.log(written.length + ' files')
}
main().catch((e) => { console.error(e); process.exit(1) })
