# Commerce Precision Engine v2.0 (ALPHA) 🧪

> **⚠️ Alpha Release**: This is an early preview version. Features may change, and bugs may exist. Help us improve by providing feedback!

An AI-powered CBSE Class 12 Commerce study assistant with **dynamic syllabus upload**, **study material RAG (Retrieval-Augmented Generation)**, and **4-layer verification pipeline**.

## ✨ New in Alpha

> **Limited Access**: Only 50 alpha testers allowed. Each access key works only once!

- 🔐 **50 Alpha Access Keys** - Hardcoded keys for controlled testing (first come, first served)
- 📚 **Upload Your Own Syllabus** - No pre-defined chapters. Upload your CBSE syllabus PDF or enter chapters manually
- 📄 **Study Material RAG** - Upload notes, textbooks, and study materials for AI to reference when answering
- 🔑 **Bring Your Own API Key** - Use your own Gemini or Groq API key if our quota runs out
- 🎓 **Personalized Learning** - AI answers based on YOUR specific syllabus and study materials

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (Supabase recommended)

### 1. Clone & Setup

```bash
git clone <repo-url>
cd commerce-precision-engine

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

### 2. Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL="postgresql+asyncpg://..."
SECRET_KEY="your-secret-key"
# Leave empty for BYOK (Bring Your Own Key) mode:
GEMINI_API_KEY=""
GROQ_API_KEY=""
FRONTEND_URL="http://localhost:5173"
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL="http://localhost:8000"
```

### 3. Run Locally

```bash
# Terminal 1 - Backend
cd backend
uvicorn src.main_standalone:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit http://localhost:5173

## 📋 Features

### 1. Dynamic Syllabus Management
- Upload syllabus PDF/images or type chapters manually
- AI tailors answers to your specific curriculum
- Edit/reorder chapters anytime

### 2. Study Material RAG
- Upload notes, textbooks, reference materials
- AI searches your materials when answering
- Get responses based on YOUR study content

### 3. 4-Layer Verification Pipeline
| Layer | Function | Retry If |
|-------|----------|----------|
| Generator | Creates initial answer | - |
| Validator | Checks syllabus alignment | < 75% |
| Auditor | Reviews logical errors | High severity |
| Scorer | CBSE marking evaluation | < 75% |

### 4. Alpha Access Control (50 Keys)
```
ALPHA-01-K9M2-P8LQ  ALPHA-02-X4N7-J3RT  ALPHA-03-H2W5-V9YD
ALPHA-04-B6K1-M4PC  ALPHA-05-Q9F3-Z8XA  ... (50 total)
```
- Each key works **only once** for one user account
- Keys tracked in localStorage (demo) or database (production)
- Live counter shows remaining spots
- Admin panel at `/alpha-status` to monitor usage

### 5. BYOK (Bring Your Own Key)
- Users can add their own API keys in Settings
- Supports Google Gemini (60 req/min free)
- Supports Groq (fast inference)
- Keys stored locally, never on our servers

### 5. Alpha Features
- ✅ Demo mode - no database required for testing
- ✅ Local storage for syllabi and materials
- ✅ Responsive design (mobile + desktop)
- ✅ Dark mode support

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Syllabus  │  │  Materials  │  │      API Key Settings   │  │
│  │    Upload   │  │    Upload   │  │   (Local Storage Only)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    Auth     │  │  Questions  │  │   File Processing       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                              │                                   │
│                   ┌──────────┴──────────┐                       │
│                   ▼                     ▼                       │
│  ┌─────────────────────────┐  ┌─────────────────────────┐       │
│  │   4-Layer Pipeline      │  │   AI Providers          │       │
│  │  Generator → Validator  │  │  • Gemini (Primary)     │       │
│  │   → Auditor → Scorer    │  │  • Groq (Fallback)      │       │
│  └─────────────────────────┘  └─────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

### Quick Deploy

**Frontend (Vercel)**:
```bash
cd frontend
vercel --prod
```

**Backend (Railway)**:
```bash
cd backend
railway up
```

## 🔑 API Key Setup

### Google Gemini (Recommended)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google
3. Create API key
4. Paste in Settings → Google Gemini

### Groq (Alternative)
1. Visit [Groq Console](https://console.groq.com/keys)
2. Create account
3. Generate API key
4. Paste in Settings → Groq

See [API Key Guide](frontend/src/pages/ApiKeyGuidePage.tsx) for detailed instructions.

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)

### Backend
- FastAPI (Python)
- Prisma ORM
- PostgreSQL
- AsyncPG

### AI Providers
- Google Gemini (primary)
- Groq (fallback)

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── api/           # API routes
│   │   ├── services/      # LLM & Pipeline
│   │   ├── main.py        # FastAPI app
│   │   └── main_standalone.py  # Demo mode (no DB)
│   ├── prisma/            # Database schema
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── data/          # Static data
│   │   │   └── alphaKeys.ts    # 50 hardcoded alpha keys
│   │   ├── pages/         # React pages
│   │   │   ├── SyllabusPage.tsx
│   │   │   ├── StudyMaterialPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ApiKeyGuidePage.tsx
│   │   │   └── AlphaStatusPage.tsx
│   │   ├── components/    # UI components
│   │   └── services/      # API services
│   └── package.json
└── DEPLOYMENT.md
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes* | PostgreSQL connection string |
| `SECRET_KEY` | Yes | JWT secret (32+ chars) |
| `GEMINI_API_KEY` | No | Google AI API key |
| `GROQ_API_KEY` | No | Groq API key |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |

*For demo mode, use `main_standalone.py` (no DB required)

## 🐛 Known Issues (Alpha)

- File uploads use localStorage in demo mode (limited size)
- AI processing is simulated in demo mode
- No persistent history without database

## 🗺️ Roadmap

### Alpha (Current)
- ✅ Dynamic syllabus upload
- ✅ Study material RAG
- ✅ BYOK support
- ✅ Demo mode

### Beta
- 🔄 Real AI integration
- 🔄 File storage (S3/Supabase)
- 🔄 User accounts
- 🔄 Progress tracking

### v1.0
- 📋 Mobile app
- 📋 Offline mode
- 📋 Collaborative features

## 🤝 Contributing

This is an alpha release. Feedback and bug reports welcome!

## 📄 License

MIT License - See [LICENSE](LICENSE)

---

<p align="center">
  <sub>Built with ❤️ for CBSE Class 12 Commerce students</sub>
</p>
