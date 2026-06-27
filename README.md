# FinFlow AI 🇺🇿

> **National AI Hackathon 2026** — FStudent jamoasi tomonidan ishlab chiqilgan
>
> O'zbekiston kichik va o'rta bizneslar uchun AI-asosli moliyaviy boshqaruv platformasi

---

## Loyiha haqida

**FinFlow AI** — O'zbekistondagi SME tadbirkorlariga moliyaviy shaffoflik, kredit tayyorgarlik va investor jalb qilishda yordam beruvchi sun'iy intellekt platformasi.

O'zbekistondagi 99% buxgalterlar soliqni kamaytirish maqsadida rasmiy foydani 0 ga yaqin ko'rsatishadi — bu esa banklar va investorlar uchun biznesni ko'rinmas qiladi. FinFlow AI shu muammoni hal qiladi.

### Asosiy imkoniyatlar

| Modul | Tavsif |
|---|---|
| **DSCR Tahlili** | SQB mezonlariga asoslangan qarz xizmati koeffitsientini avtomatik hisoblash |
| **AI Verified Badge** | Investor ishonchi uchun raqamli moliyaviy sertifikat |
| **IT Park Kalkulyatori** | Yillik soliq tejamini bir zumda ko'rsatish (Ish haqi fondi × 11% × 12) |
| **FinFlow AI Maslahati** | O'zbek tilida professional moliyaviy maslahat va risk tahlili |
| **Angel Investor Feed** | Tasdiqlangan bizneslar uchun investor-founder muloqot platformasi |
| **1B UZS Monitor** | Soliq devori yaqinligi real-vaqt ogohlantirishlari |

---

## Texnologiyalar

### Frontend
- **Next.js 16** (App Router, React 19, TypeScript)
- **Tailwind CSS v4**
- **GSAP 3** + **ScrollTrigger** — scroll animatsiyalari
- **Lenis** — silliq scroll
- **SplitType** — matn animatsiyalari
- **Framer Motion** — UI animatsiyalari
- **Lucide React** — ikonalar

### Backend
- **FastAPI** (Python 3.10+)
- **SQLite** — ma'lumotlar bazasi
- **JWT** — autentifikatsiya
- **Uvicorn** — ASGI server

---

## O'rnatish va ishga tushirish

### Talablar
- Node.js 18+
- Python 3.10+
- npm yoki yarn

---

### Backend

```bash
cd backend

# Virtual muhit yaratish
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Paketlarni o'rnatish
pip install fastapi uvicorn sqlalchemy python-jose passlib bcrypt python-multipart

# Muhit o'zgaruvchilarini sozlash
cp .env.example .env
# .env faylini o'z qiymatlaringiz bilan tahrirlang

# Serverni ishga tushirish
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Backend API docs: `http://localhost:8000/docs`

---

### Frontend

```bash
cd frontend

# Paketlarni o'rnatish
npm install

# Muhit o'zgaruvchilarini sozlash
cp .env.local.example .env.local
# .env.local faylini tahrirlang — NEXT_PUBLIC_API_URL ni backend manziliga o'zgartiring

# Development serverni ishga tushirish
npm run dev

# Production build
npm run build
npm start
```

Frontend: `http://localhost:3000`

---

## Muhit o'zgaruvchilari

### Backend — `.env`

```env
# JWT token imzolash uchun maxfiy kalit (kamida 32 belgi)
SECRET_KEY=your-very-secret-key-change-this

# Token amal qilish muddati (daqiqalarda)
ACCESS_TOKEN_EXPIRE_MINUTES=60

# AI xizmat konfiguratsiyasi
# LM Studio yoki boshqa local AI provider URL
AI_BASE_URL=http://localhost:1234/v1
AI_MODEL=deepseek-r1-distill-qwen-7b
```

### Frontend — `.env.local`

```env
# Backend API manzili
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Loyiha tuzilmasi

```
FinFlow/
├── backend/                  # FastAPI backend
│   ├── main.py               # Asosiy API routes
│   ├── models.py             # SQLAlchemy modellari
│   ├── schemas.py            # Pydantic sxemalari
│   ├── database.py           # DB ulanish
│   ├── security.py           # JWT autentifikatsiya
│   ├── calculator.py         # DSCR, IT Park kalkulyatori
│   ├── ai_prompt.py          # AI prompt shablonlari
│   └── gemini_service.py     # AI xizmat integratsiyasi
│
├── frontend/                 # Next.js frontend
│   ├── app/                  # App Router sahifalari
│   │   ├── page.tsx          # Landing page
│   │   ├── login/            # Login sahifasi
│   │   ├── register/         # Ro'yxatdan o'tish
│   │   ├── dashboard/        # Dashboard (founder/investor)
│   │   └── admin/            # Admin panel
│   ├── components/           # Qayta ishlatiladigan komponentlar
│   ├── lib/                  # Utility funksiyalar, API client
│   └── public/               # Statik fayllar
│
├── rebuild.sh                # Server qayta build skripti
├── setup.sh                  # Boshlang'ich sozlash skripti
└── README.md
```

---

## Foydalanuvchi rollari

| Rol | Imkoniyatlar |
|---|---|
| **Founder** | Moliyaviy audit, DSCR tahlili, IT Park kalkulyatori, AI maslahati |
| **Investor** | Angel feed, tasdiqlangan pitchlar, biznes pasportlari |
| **Admin** | Foydalanuvchilar boshqaruvi, tizim nazorati |

---

## Demo kirish ma'lumotlari

> **Eslatma:** Deployment'dan oldin `backend/main.py` da demo hisoblarni olib tashlang yoki parollarni o'zgartiring.

```
Admin:    admin@finflow.uz   /  Admin@12345
```

---

## Production Deployment

### PM2 bilan (tavsiya etiladi)

```bash
# Backend
cd backend
source venv/bin/activate
pip install gunicorn
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name finflow-backend

# Frontend
cd frontend
npm run build
pm2 start "npm start -- --port 3000" --name finflow-frontend

pm2 save
pm2 startup
```

### Muhim: O'zgartirish kerak bo'lgan joylar

1. **`backend/.env`** — `SECRET_KEY` ni yangi, kuchli kalitga o'zgartiring
2. **`frontend/.env.local`** — `NEXT_PUBLIC_API_URL` ni server manziliga o'zgartiring
3. **`backend/main.py`** — CORS `origins` ro'yxatida faqat o'z domeningizni qoldiring
4. **Demo hisob** — Production'da `admin@finflow.uz` parolini o'zgartiring yoki o'chiring

---

## Jamoa

**FStudent** — O'zbekiston yoshlari tomonidan tashkil etilgan texnologiya jamoasi

> 🏆 **National AI Hackathon 2026** ishtirokchisi

---

## Litsenziya

Ushbu loyiha **National AI Hackathon 2026** doirasida ishlab chiqilgan va FStudent jamoasiga tegishli.
