# Pepero Day — Интерактив урилга 🤍

Next.js 15 (App Router) · TypeScript · Tailwind CSS · Framer Motion · Supabase · Vercel

Хүлээн авагчид зөөлөн, тансаг мэдрэмж төрүүлэх 4 хуудастай урилга + таны хувьд бүх хариулт, үйлдлийг бодитоор хадгалдаг backend болон private admin dashboard.

---

## 1. Бүтэц

```
app/
  page.tsx                      ← Урилга (/)
  layout.tsx, globals.css       ← Дизайн систем (Baby Blue / Navy)
  api/session/route.ts          ← POST: session үүсгэх / сэргээх (cookie)
  api/event/route.ts            ← POST: үйлдэл бүрийг даруйд хадгалах
  admin/login/page.tsx          ← Admin нэвтрэх (Supabase Auth)
  admin/actions.ts              ← signOut, markSeen (server actions)
  admin/(protected)/layout.tsx  ← Server-side admin шалгалт
  admin/(protected)/page.tsx    ← Dashboard (статистик, санал, session жагсаалт)
  admin/(protected)/session/[id]/page.tsx ← Нэг session-ийн timeline
components/
  Experience.tsx                ← Хуудсуудын төлөвийн машин + page transition
  useInvitation.ts              ← Session/эвент хадгалах hook (server = эх сурвалж)
  stages/QuestionOne.tsx        ← Page 1
  stages/QuestionTwo.tsx        ← Page 2 (+ MovingNoButton.tsx — зугтах "Үгүй")
  stages/GiftReveal.tsx         ← Page 3 (gift box нээгдэх animation)
  stages/FinalMessage.tsx       ← Page 4 (textarea + илгээх)
  stages/Declined.tsx, ThankYou.tsx
  FloatingDecor.tsx, icons.tsx  ← Pepero stick, од, тууз чимэглэл
  ui/Button.tsx, Card.tsx, ErrorNotice.tsx
  admin/*                       ← Admin UI
lib/
  session-server.ts             ← Төлөвийн шилжилт, idempotent бичилт (server-only)
  supabase/admin.ts             ← Service-role client (server-only)
  supabase/server.ts, client.ts, middleware.ts ← Auth client-ууд
  texts.ts                      ← Бүх текст нэг газар
supabase/schema.sql             ← Tables, indexes, constraints, RLS, admin function
middleware.ts                   ← /admin route хамгаалалт
.env.example
```

### Өгөгдлийн урсгал (яагаад найдвартай вэ)

- Browser → `POST /api/session` → сервер cookie (`pd_sid`, httpOnly, 1 жил) + localStorage-д session ID хадгална. Refresh/дахин орох үед **ижил session** сэргээгдэж `visit_count` нэмэгдэнэ — давхар session үүсэхгүй.
- Товч дарах бүрт → `POST /api/event` → сервер **service role key**-ээр Supabase-д бичээд шинэ төлөвийг буцаана. UI зөвхөн серверээс ирсэн төлөвөөр дараагийн хуудас руу шилжинэ → хадгалагдаагүй зүйлийг "хадгалсан" мэт харуулахгүй. Алдаа гарвал монгол текстээр мэдэгдэж, дахин оролдох боломжтой.
- Шилжилт бүр **нөхцөлт UPDATE** (`where q1_answer is null` гэх мэт) → давхар дарах/давхар илгээх үед 2 дахь нь өмнөх төлөвийг л буцаана.
- `events` table — үйлдэл бүрийн timestamp-тай timeline. `is_analytics=true` (зугтах товчны оролдлого) нь бодит хариултаас тусдаа.
- Anon key-д ямар ч RLS policy байхгүй → browser-оос DB-д шууд хандах боломжгүй. Admin нь зөвхөн `admins` table-д байгаа auth хэрэглэгч (`is_admin()`), server талд шалгагдана.

---

## 2. Supabase холбох

1. [supabase.com](https://supabase.com) → **New project** (бүс: Northeast Asia / Tokyo ойр).
2. **SQL Editor → New query** → `supabase/schema.sql`-ийн агуулгыг бүтнээр нь буулгаж **Run**. (Дахин ажиллуулахад аюулгүй — `if not exists`/`drop policy if exists`.)
3. **Project Settings → API** хэсгээс авна:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY` — **зөвхөн сервер**, хэзээ ч `NEXT_PUBLIC_` болгохгүй, GitHub-д оруулахгүй.
4. Төслийн root-д `.env.local` үүсгэж (`.env.example`-ийг хуулж) 3 утгыг бич. `.gitignore` үүнийг аль хэдийн хамгаалсан.

```bash
cp .env.example .env.local
# .env.local-д утгуудаа оруул
npm install
npm run dev        # http://localhost:3000
```

> Credentials байхгүй үед сайт "Сервер Supabase-тэй холбогдоогүй байна" гэж харуулна — худал амжилт харуулахгүй.

---

## 3. Admin account үүсгэх

1. Supabase → **Authentication → Providers → Email** идэвхтэй эсэхийг шалга ("Confirm email"-ийг унтраавал шууд нэвтэрнэ).
2. **Authentication → Users → Add user → Create new user**: өөрийн и-мэйл, нууц үг (Auto Confirm ✓).
3. **SQL Editor** дээр admin эрх өг (и-мэйлээ соль):

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'me@example.com'
on conflict do nothing;
```

4. `/admin/login` → нэвтэр. `admins`-д байхгүй хэрэглэгч нэвтэрсэн ч "Хандах эрхгүй" хуудас харна.

---

## 4. Vercel deployment

1. Кодыг GitHub repo-д push хий (`.env.local` орохгүй — `.gitignore`-д байна).
2. [vercel.com](https://vercel.com) → **Add New → Project** → repo-гоо сонго. Framework: Next.js (автомат).
3. **Environment Variables** хэсэгт 3 хувьсагчийг Production + Preview-д нэм:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. **Deploy**. Дууссаны дараа `https://<төсөл>.vercel.app` линкийг хүлээн авагчид явуул; admin: `https://<төсөл>.vercel.app/admin`.
5. Supabase → **Authentication → URL Configuration** → Site URL-д Vercel домэйнээ нэм (auth cookie-д хэрэгтэй).

Vercel дээр `/admin*` хуудсууд `X-Robots-Tag: noindex`, бүх хуудас `robots: noindex` — хайлтад гарахгүй.

---

## 5. Тест checklist

Локал (`npm run dev`) эсвэл Vercel дээр дарааллаар шалга. Admin dashboard-ыг зэрэгцүүлэн нээж өгөгдөл бодитоор орж буйг хар.

| # | Шалгах зүйл | Хүлээгдэх үр дүн |
|---|---|---|
| 1 | Сайт нээх | Admin: шинэ session, `visit`=1, "Website нээсэн" цаг |
| 2 | Page 1 — "Тийм 🤍" | Page 2 руу шилжинэ; DB: `q1_answer=yes`, `q1_answered_at` |
| 3 | Page 1 — "Үгүй" (шинэ incognito цонх) | "За ойлголоо, дараа уулзъя. 🤍"; DB: `q1_answer=no`, `completed=true` |
| 4 | Page 2 — хулганаар "Үгүй"-д ойртох | Товч viewport дотор зөөлөн зугтана, "Тэгье"-г халхлахгүй |
| 5 | Page 2 — утсаар "Үгүй"-д хүрэх | Мөн зугтана; дарагдахгүй. Admin: `no_button_dodges` тоо (analytics) |
| 6 | Page 2 — "Тэгье 🤍" | Page 3; DB: `q2_answer=yes` |
| 7 | Page 3 — gift box дарах | Таг нээгдэж текст 2 мөр аажим гарна; DB: `gift_opened=true`, цаг |
| 8 | Page 4 — хоосон "Илгээх" | Товч идэвхгүй |
| 9 | Page 4 — текст бичиж илгээх, хурдан 2 дарах | 1 л бичилт; "Хариулсанд баярлалаа! 🤍"; DB: `message`, `completed=true` |
| 10 | Дунд нь refresh хийх (хуудас бүр дээр) | Ижил хуудас сэргээгдэнэ, session ID өөрчлөгдөхгүй, visit +1 |
| 11 | Интернэт салгаж товч дарах | Монгол алдааны мессеж, "Дахин оролдох"; хуудас шилжихгүй |
| 12 | `/admin` нэвтрэхгүй орох | `/admin/login` руу redirect |
| 13 | Admin биш auth хэрэглэгчээр нэвтрэх | "Хандах эрхгүй" |
| 14 | Admin — session дээр дарах | Timeline бүх event timestamp-тай; "Шинэ" badge арилна |
| 15 | Mobile (375px) / Tablet / Desktop | Текст багтана, товч ≥52px, animation гацахгүй |
| 16 | OS дээр "Reduce motion" асаах | Хөвөх чимэглэл, зугтах эргэлт зогсоно, fade л үлдэнэ |
| 17 | `npm run build` + `npm run lint` | Алдаагүй |

### Browser-гүй баталгаажуулалт (энэ төслийг бэлдэх явцад хийгдсэн)

- `supabase/schema.sql` жинхэнэ PostgreSQL 16 дээр ажиллуулж: anon → 0 мөр + insert хориглогдсон, admin биш authenticated → 0 мөр, admin → уншиж/`admin_seen_at` засаж чадсан, consistency constraint-ууд буруу өгөгдлийг хориглосон, `updated_at` trigger ажилласан.
- TypeScript эх код syntax/төрлийн хувьд шалгагдсан.

---

## 6. Аюулгүй байдлын тэмдэглэл

- `SUPABASE_SERVICE_ROLE_KEY` зөвхөн `lib/supabase/admin.ts` (`import "server-only"`) дотор ашиглагдана — client bundle-д орох боломжгүй.
- RLS 3 table дээр бүгд идэвхтэй; anon policy байхгүй.
- Admin шалгалт 3 давхар: middleware (auth cookie) → `(protected)/layout.tsx` (`admins` table) → RLS (`is_admin()`).
- API бүх оролтыг шалгана: UUID формат, event type whitelist, message 1–2000 тэмдэгт, dodge count 1–50.
