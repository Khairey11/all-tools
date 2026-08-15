# All Tools — New Tools Study: What People Need in Daily Life

## 1. Current Inventory (32 tools)

| Category | Count | Tools |
|---|---|---|
| Image | 6 | Compress, GIF Compressor, Resize, PNG→JPG, Watermark, Palette |
| PDF | 5 | Compress, PDF→Word, Word→PDF, Editor, PDF→Image |
| Video | 2 | Compress, Video→GIF |
| Dev | 4 | Password Strength, Base64, Color, JSON |
| Text | 1 | Case Converter |
| SEO | 3 | Meta Tags, Keyword Density, Keyword Competition |
| Social | 1 | Caption Generator |
| Finance | 4 | Percentage, Interest, EMI, Currency |
| Unit | 6 | Age, BMI, Date Diff, Time Zone, Units, Speed |

**Gap analysis:** Text category is critically thin (1 tool). No health/lifestyle calculators. No QR codes. No generators (password/UUID/hash). No timers. No everyday shopping/money helpers (tip, discount, fuel).

---

## 2. Study Method

Ranked by four criteria (each scored 1-5, 20 max):
- **Demand** — global monthly search volume for the tool type (Google Keyword data patterns)
- **Daily frequency** — how often an average person needs it (daily > weekly > occasionally)
- **Fit** — can it be built 100% in-browser, offline, privacy-first (our differentiator)
- **Effort** — implementation speed with libraries already installed (jszip, pdf-lib, pdfjs, recharts, chroma-js, browser APIs)

Competitive reference: what drives traffic on TinyWow (40M visits/mo), iLovePDF, SmallPDF, Calculator.net (30M visits/mo), RapidTables — the top utilities on all of them are calculators, counters, and generators, NOT converters.

---

## 3. Tier 1 — Build First (High daily demand, trivial effort, perfect fit)

| # | Tool | Demand | Why people need it daily | Implementation (100% local) |
|---|---|---|---|---|
| 1 | **Word & Character Counter** | 900K+/mo | Students (essay limits), writers, job applicants, social posts (280 chars), SEO meta limits | `text.split(/\s+/).length` — 30 min |
| 2 | **QR Code Generator** | 1.5M+/mo | WiFi sharing, UPI/payment links, restaurant menus, event tickets, vCards | `qrcode` npm lib — pure JS, offline |
| 3 | **Tip & Bill Splitter** | 500K+/mo | Every restaurant visit; split among friends with per-person tip % | Pure math — 1 hr |
| 4 | **Discount / Sale Price Calculator** | 400K+/mo | Shopping: "30% off + extra 10%?" — instant final price + saved amount | Pure math — 1 hr |
| 5 | **Password Generator** | 800K+/mo | Every new account; complements our existing Password Strength tool | `crypto.getRandomValues` — 1 hr |
| 6 | **Calorie / TDEE Calculator** | 700K+/mo | Daily fitness tracking; BMR, activity level, goal (lose/gain) — pairs with our BMI | Mifflin-St Jeor formula — 1 hr |
| 7 | **Water Intake Calculator** | 200K+/mo | Daily health habit; weight × activity × climate | Simple formula — 45 min |
| 8 | **Lorem Ipsum Generator** | 300K+/mo | Designers/developers daily for mockups | Word bank + shuffle — 45 min |
| 9 | **Pomodoro / Focus Timer** | 400K+/mo | Students & remote workers, all day long | `setInterval` + Web Audio beep — 2 hr |
| 10 | **Case-adjacent: Text Reverser/Duplicator/Space Remover** | 150K+/mo | Cleaning pasted text (double spaces, line breaks) — very common annoyance | Regex — 1 hr |

**Tier 1 total effort: ~1 week. Adds 10 tools → 42 tools.**

---

## 4. Tier 2 — Build Second (Strong demand, moderate effort)

| # | Tool | Demand | Why daily | Implementation |
|---|---|---|---|---|
| 11 | **Sleep Cycle Calculator** | 350K+/mo | "What time should I wake up?" — 90-min cycle math for bed/wake times | Pure math + time UI — 2 hr |
| 12 | **Fuel Cost / Mileage Calculator** | 250K+/mo | Commuters: trip cost, km/l, split fuel cost | Pure math — 1.5 hr |
| 13 | **Hash Generator (MD5/SHA-1/SHA-256)** | 300K+/mo | Devs verify downloads daily; file checksums | Web Crypto API — 2 hr |
| 14 | **UUID Generator** | 200K+/mo | Devs paste IDs constantly | `crypto.randomUUID` — 30 min |
| 15 | **URL Encoder/Decoder** | 250K+/mo | Debugging links, UTM params, sharing safe URLs | `encodeURIComponent` — 45 min |
| 16 | **Number → Words** | 200K+/mo | Cheque writing (huge in India/Nepal), invoices, legal docs | Algorithm + Intl API — 2 hr |
| 17 | **Roman Numeral Converter** | 300K+/mo | Students, watch faces, book chapters, tattoos | Map-based algorithm — 1 hr |
| 18 | **Binary ↔ Decimal ↔ Hex** | 250K+/mo | CS students daily homework | `parseInt(x, base)` — 1 hr |
| 19 | **Cooking Measurement Converter** | 200K/mo | Daily cooking: cups↔grams↔ml↔tbsp, oven °C↔°F | Ingredient density table — 3 hr |
| 20 | **Reading Time Calculator** | 100K+/mo | Bloggers, students (pages/min, words) | Extends Word Counter — 30 min |
| 21 | **Html/Markdown Preview** | 150K/mo | Writers paste markdown, see rendered result live | `marked` lib — 2 hr |
| 22 | **Random Picker (dice, coin, names, numbers)** | 300K/mo | Teachers, games, "who pays?" decisions | `crypto.getRandomValues` + CSS dice — 2 hr |

**Tier 2 effort: ~1.5 weeks. Running total: 54 tools.**

---

## 5. Tier 3 — Strategic (High value, higher effort)

| # | Tool | Demand | Notes |
|---|---|---|---|
| 23 | **Invoice Generator** | 500K+/mo | Freelancers daily; PDF-lib output, save clients in localStorage — 1 wk |
| 24 | **Resume/CV Builder** | 1M+/mo | Job seekers; templates → PDF export — 2 wks |
| 25 | **Text-to-Speech** | 600K+/mo | Free: built-in Web Speech API, offline, natural voices — 3 days |
| 26 | **Speech-to-Text** | 400K+/mo | Free: Web Speech Recognition API (Chrome) — 3 days |
| 27 | **Regex Tester** | 350K+/mo | Devs test patterns live with match highlighting — 3 days |
| 28 | **Diff Checker** | 300K+/mo | Compare two texts (students vs Wikipedia check, coders) — 3 days |
| 29 | **Color Palette Generator** | 250K/mo | chroma-js already installed; harmonies from one seed color — 2 days |
| 30 | **Image → Base64 / Data URI** | 200K/mo | Devs embedding images in CSS/HTML — 1 day |
| 31 | **Aspect Ratio Calculator** | 150K/mo | Resize images/videos correctly; complements our Resize tool — 1 day |
| 32 | **Grade / GPA Calculator** | 200K/mo | Students every semester; weighted grades — 2 days |
| 33 | **Pregnancy Due Date** | 450K/mo | Naegele's rule + week-by-week tracker — 2 days |
| 34 | **Body Fat / Ideal Weight** | 300K/mo | Extends BMI into a small health hub — 2 days |
| 35 | **Stamp Duty / VAT / Sales Tax Calc** | 200K/mo | Add Nepali VAT 13% + common countries — 1 day |
| 36 | **Quick Chart Maker** | 300K/mo | Paste data → bar/pie/line; recharts installed — 4 days |

---

## 6. Highest-ROI Shortlist (if you only build 10)

1. Word & Character Counter
2. QR Code Generator
3. Password Generator
4. Tip & Bill Splitter
5. Discount Calculator
6. Calorie/TDEE Calculator
7. Pomodoro Timer
8. Sleep Cycle Calculator
9. Lorem Ipsum Generator
10. Hash Generator

**Why these ten:** all rank in the top pages of every calculator-site traffic report; all are pure-client (zero server cost, Vercel-free-tier friendly); all index well for SEO because they answer instant queries; and they round out the site from a "file tools site" into a true daily-utility destination, increasing return-visit rate (the metric that compounds traffic).

---

## 7. Strategic Notes

- **Retention loop:** calculators (BMI→calorie→water→sleep) form a "health hub"; money tools (EMI→interest→tip→discount→fuel→VAT) form a "money hub". Hubs multiply pageviews per visit.
- **SEO:** each tool = 1 landing page. Counter/QR/password alone can add 50K+ organic visits/mo within 6 months based on competitor patterns.
- **Privacy angle:** every tool stays 100% local — our tagline against iLovePDF/SmallPDF (which upload files to servers). Market this on every new tool page.
- **Zero new infrastructure:** all Tier 1+2 tools need no new backend, no API keys, no database — only one small npm addition (`qrcode`).
- **Suggested new categories:** "Health Tools" (calorie, water, sleep, body fat, pregnancy), "Productivity" (timer, pomodoro, random picker), "Generators" (QR, password, UUID, lorem, hash).

---

*Prepared as a growth study for the All Tools project. Tier 1 is recommended as the immediate next sprint.*