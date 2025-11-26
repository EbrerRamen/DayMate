## DayMate

DayMate is a full‑stack AI‑powered daily planner that combines live weather, news, and an LLM to generate context‑aware plans. Users can register/login, save multiple locations, generate daily plans, and view their plan history.

---

## Live URLs

- **Frontend (Vercel)**: `https://daymate-ten.vercel.app/`
- **Backend API (Render)**: `https://daymate-8ljf.onrender.com`

---

## Local Setup

### Prerequisites

- **Node.js** 18+ (for the React/Vite frontend)
- **Python** 3.11+ (for the FastAPI backend)
- **MongoDB** (local instance or MongoDB Atlas)

### Backend (FastAPI)

1. **Create and activate a virtual environment**

```bash
cd backend
python -m venv venv
# Windows PowerShell
venv\Scripts\Activate.ps1
# macOS/Linux
source venv/bin/activate
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Configure environment variables**

Create `backend/.env` based on `backend/.env.example`:

- **Required**
  - `MONGODB_URI` – MongoDB/Atlas connection string
  - `SECRET_KEY` – long random string for JWT signing
  - `OPENWEATHER_KEY` – OpenWeather API key
  - `NEWSAPI_KEY` – NewsAPI key
  - `LLM_API_KEY` – key for your LLM provider (used through Hugging Face router)
- **Recommended for dev**
  - `FRONTEND_URL=http://localhost:5173`

4. **Run the backend locally**

```bash
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`.

### Frontend (React + Vite + Tailwind)

1. **Install dependencies**

```bash
cd frontend
npm install
```

2. **Configure environment variables**

Create `frontend/.env`:

```bash
VITE_API_BASE=http://localhost:8000
```

3. **Run the dev server**

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`.

---

## Deployment

### Backend on Render

1. **Create a Web Service**

- Root directory: `backend`
- Environment: Python
- **Build command**:

```bash
pip install -r requirements.txt
```

- **Start command**:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

2. **Set environment variables (Render dashboard)**:

- `ENV=production`
- `MONGODB_URI=<your MongoDB Atlas URI>`
- `SECRET_KEY=<strong random string>`
- `OPENWEATHER_KEY=<your key>`
- `NEWSAPI_KEY=<your key>`
- `LLM_API_KEY=<your key>`
- `FRONTEND_URL=https://<your-frontend>.vercel.app`

Render will expose a URL like `https://<your-backend>.onrender.com` which you use as `VITE_API_BASE` in production.

### Frontend on Vercel

1. **Import the repo**

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

2. **Set environment variables (Vercel → Settings → Environment Variables)**:

- `VITE_API_BASE=https://<your-backend>.onrender.com`

3. **Deploy**

Push to `main` (or your chosen branch) and Vercel will build and deploy the frontend.

---

## Technology Choices

### Backend

- **FastAPI**: async‑friendly, typed Python web framework with automatic OpenAPI docs.
- **MongoDB + ODMantic**: document database with an async ODM that integrates well with Pydantic models.
- **httpx**: async HTTP client for calling external services (OpenWeather, NewsAPI).
- **Auth stack**: `python-jose` for JWTs and `passlib` for password hashing.
- **LLM integration**: OpenAI client against the Hugging Face router, so you can swap models without major code changes.

### Frontend

- **React + Vite**: fast dev/build tooling ideal for a SPA hitting a JSON API.
- **Tailwind CSS**: utility‑first styling to keep the design consistent and easy to iterate.
- **Axios**: simple HTTP client for API calls with token headers, error handling, etc.

### Infrastructure

- **Render**: hosts the FastAPI backend with minimal ops, built‑in logs, and easy environment variable management.
- **Vercel**: optimized static hosting for Vite/React with automatic preview deployments.
- **MongoDB Atlas**: managed database accessible from both local dev and Render.

This setup keeps local development simple (localhost FastAPI + Vite) while production uses the same code, switching only environment variables and hosting targets.
