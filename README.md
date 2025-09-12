# Moda Web — Kayfiyat statistikasi (Mood) uchun front-end

Moda Web — Next.js asosidagi foydalanuvchi interfeysi bo‘lib, real vaqt rejimida (SSE) kayfiyat statistikalarini ko‘rsatadi. Loyihada mamlakat bo‘yicha filtrlash, ko‘p tillilik (uz/ru/en), grafiklar, bugunning ulushi bo‘yicha SVG karta bilan bo‘lishish, va kayfiyat yuborish (mood submit) funksiyalari mavjud.

## Asosiy imkoniyatlar
- Real vaqt (Server‑Sent Events) orqali yangilanishlar, ko‘rinmayotgan oynada avtomatik polling rejimi
- Mamlakat bo‘yicha filtrlash (Global yoki tanlangan country)
- Ko‘p tillilik: uz, ru, en. Brauzer tilidan yoki `?locale=` query parametrlardan aniqlanadi
- Diagrammalar: Recharts asosida bar/pie/line vizualizatsiyalar
- Bugungi ko‘rsatkichlar bo‘yicha ulashish: `/api/v1/share/today.svg` kartasini ko‘rish, yuklab olish yoki linkni nusxalash
- Kayfiyat yuborish (mood submit) va optimistik yangilanish

## Texnologiyalar
- Next.js 15 (App Router)
- React 19
- Tailwind CSS 4
- SWR (ma’lumotlarni olib kelish va kesh)
- Recharts (grafiklar)
- Framer Motion (animatsiyalar)

## Talablar
- Node.js 20+ (yoki LTS mos versiya)
- npm 10+ (yoki pnpm/yarn)
- Ishlaydigan backend API (quyidagi endpointlarga mos)

## O‘rnatish
```bash
# repository klonlash
git clone <repo-url>
cd moda-web

# bog‘liqliklarni o‘rnatish
npm install
```

## Muhit (Environment) sozlamalari
Frontend quyidagi environment o‘zgaruvchidan foydalanadi:

- NEXT_PUBLIC_API_BASE — backend API bazaviy URL manzili
  - Standart qiymat (agar berilmasa): `http://localhost:8010`

`.env.local` fayli misoli:
```env
NEXT_PUBLIC_API_BASE=http://localhost:8010
```

## Ishga tushirish (dev)
```bash
npm run dev
```
Brauzerda oching: http://localhost:3000

Scripts:
- `npm run dev` — Development server (Turbopack)
- `npm run build` — Production build (Turbopack)
- `npm run start` — Production server
- `npm run lint` — ESLint

## Build va deploy
```bash
npm run build
npm run start
```
Next.js ilovasini istalgan Node.js hostingda yoki Vercel’da ishga tushirishingiz mumkin.

## i18n (til) haqida
`next.config.ts` i18n sozlamalari:
- locales: `uz`, `ru`, `en`
- defaultLocale: `en`

Tilni quyidagicha boshqarish mumkin:
- Brauzer tili orqali avtomatik
- URL orqali: `?locale=uz` yoki `?locale=ru`

## API mosligi (frontend foydalanadigan endpointlar)
Frontend quyidagi endpointlardan foydalanadi (bazaviy URL — `NEXT_PUBLIC_API_BASE`):

- GET `/api/v1/stats/live?country&locale` — joriy statistika (REST, boshlang‘ich yuklash uchun)
- SSE `/api/v1/sse/public` — umumiy oqim
- SSE `/api/v1/sse/live?token=...` — autentifikatsiyalangan oqim
- GET `/api/v1/types/countries?locale` — mamlakatlar ro‘yxati
- GET `/api/v1/moods/types?locale` — mood turlari
- GET `/api/v1/share/today?country&locale` — bugungi ko‘rsatkichlar
- GET `/api/v1/share/today.svg?country&locale` — ulashish uchun SVG karta
- GET `/api/v1/mood/status` — bugun yuborilganmi (optional, yo‘qligida 404 qaytishi mumkin)
- POST `/api/v1/mood` — kayfiyat yuborish
- POST `/api/v1/auth/login` — login (optional)
- POST `/api/v1/auth/register` — ro‘yxatdan o‘tish (optional)
- POST `/api/v1/auth/refresh` — token yangilash (optional)

Eslatma: Brauzerda `Accept-Language` sarlavhasini o‘rnatish taqiqlangan, shu bois u faqat server tomonida qo‘yiladi. `locale` query parametri ham yuboriladi.

## Loyiha tuzilmasi (qisqacha)
```
src/
  app/page.tsx            — asosiy sahifa
  lib/api.ts              — API muloqoti, xatolarni qayta ishlash
  lib/types.ts            — DTO turlari
  lib/locale.ts           — tilni aniqlash va Accept-Language
  hooks/useLiveStats.ts   — SSE + polling orqali ma’lumot oqimi
  components/             — UI komponentlar
    StatsView.tsx         — asosiy view: filtrlash, grafika, share va submit
    LiveChart.tsx         — real vaqt bar chart (Recharts)
    charts/PieToday.tsx   — bugungi taqsimot (pie)
    charts/Line7Days.tsx  — 7 kunlik trend (line)
    TotalsBar.tsx         — konsolidatsiyalangan bar
    CountrySelect.tsx     — mamlakat tanlash
    ShareModal.tsx        — share modal (SVG preview/download)
    ui/SseBadge.tsx       — ulanish holati ko‘rsatkichi
    ...
```

## Tez-tez uchraydigan holatlar
- Backend yo‘q yoki noto‘g‘ri URL: `NEXT_PUBLIC_API_BASE` ni to‘g‘ri kiriting
- SSE bloklangan: sahifa ko‘rinmayotgan (hidden) paytda polling rejimiga o‘tadi — bu normal
- `mood/status` mavjud emas: 404 bo‘lsa frontend localStorage fallback’dan foydalanadi

## Hissa qo‘shish
PR va takliflarga ochiqmiz. Kod uslubi uchun ESLint ishlatiladi: `npm run lint`.

## Quick start (English)
- Install deps: `npm install`
- Set `.env.local` with `NEXT_PUBLIC_API_BASE`
- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build && npm run start`
