# 🚀 Deploy - Más Seguro

## Arquitectura de Deploy

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Vercel (Frontend) │────▶│  Render (Backend API) │────▶│  Supabase    │
│  docs/preview/     │     │  backend/server.py     │     │  PostgreSQL  │
│  HTML + Leaflet    │     │  FastAPI + PostGIS     │     │  + PostGIS   │
└─────────────────┘     └──────────────────────┘     └─────────────┘
```

---

## 1️⃣ Deploy del Backend (Render.com - GRATIS)

### Paso 1: Preparar el `.env`

```bash
cd backend
cp .env.example .env
```

Editá `backend/.env` con tus credenciales reales de Supabase.

**Generá un SECRET_KEY seguro:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Paso 2: Crear cuenta en Render

1. Andá a [render.com](https://render.com) y create una cuenta (gratis)
2. Click **"New +"** → **"Web Service"**
3. Conectá tu repositorio de GitHub: `Fernandezalejo1/mas-seguro`

### Paso 3: Configurar el servicio

| Campo | Valor |
|-------|-------|
| **Name** | `mas-seguro-api` |
| **Runtime** | Python 3 |
| **Build Command** | `cd backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && python server.py` |
| **Port** | `8000` |

### Paso 4: Variables de entorno

En el dashboard de Render, andá a **Environment** y agregá:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL_SYNC` | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres` |
| `SECRET_KEY` | (tu clave generada arriba) |
| `DEBUG` | `false` |
| `RATE_LIMIT` | `60` |

### Paso 5: Deploy

Click **"Create Web Service"**. Render va a hacer build y deploy automáticamente.

Tu API va a estar en: `https://mas-seguro-api.onrender.com`

**Verificar:** Abrí `https://mas-seguro-api.onrender.com/health`

---

## 2️⃣ Deploy del Frontend (Vercel - GRATIS)

### Paso 1: Crear cuenta en Vercel

1. Andá a [vercel.com](https://vercel.com) y create con tu cuenta de GitHub

### Paso 2: Importar proyecto

1. Click **"Add New..."** → **"Project"**
2. Seleccioná el repositorio `Fernandezalejo1/mas-seguro`
3. Vercel va a detectar el `vercel.json` automáticamente

### Paso 3: Configurar

| Campo | Valor |
|-------|-------|
| **Framework Preset** | Other |
| **Root Directory** | `./` |
| **Build Command** | *vite build* (detectado de `vercel.json`) |
| **Output Directory** | `dist` (detectado de `vercel.json`) |

> **Nota:** `vercel.json` define `buildCommand`, `outputDirectory`, headers de seguridad y rewrites SPA automáticamente.

### Paso 4: Deploy

Click **"Deploy"**. Vercel va a hacer `vite build` y servir el SPA desde `dist/`.

Tu frontend va a estar en: `https://mas-seguro.vercel.app`

---

## 3️⃣ Configurar CORS

Una vez que tengas ambos deployados, actualizá las variables de entorno en **Render**:

| Variable | Valor |
|----------|-------|
| `CORS_ORIGINS` | `https://mas-seguro.vercel.app` |

Esto permite que el frontend en Vercel haga requests al backend en Render.

---

## 4️⃣ Verificar el Deploy

### Backend
```bash
# Health check
curl https://mas-seguro-api.onrender.com/health

# Stats
curl https://mas-seguro-api.onrender.com/api/v1/stats
```

### Frontend
1. Abrí `https://mas-seguro.vercel.app`
2. Hacé clic en el mapa para poner origen y destino
3. Click "Buscar rutas seguras"
4. Verificá que las rutas se carguen correctamente

---

## 🔒 Seguridad en Producción

### Checklist
- [ ] `DEBUG=false` en el backend
- [ ] `SECRET_KEY` es una clave fuerte y aleatoria
- [ ] CORS solo permite tu dominio de Vercel
- [ ] `.env` NO está commiteado en git
- [ ] Rate limiting activo (60 req/min por IP)
- [ ] Token de Supabase rotado (si fue expuesto)

### Token de Supabase
Si compartiste tu token de Supabase en texto plano, **rotalo inmediatamente**:
1. Andá a Supabase Dashboard → Settings → API
2. Click **"Reset"** en el service_role key
3. Copiá el nuevo token a tu `.env` en Render

---

## 🔄 Deploy Automático

### Render (Backend)
- Se hace deploy automáticamente cada vez que hagas push a `main`
- Para deploy manual: Click **"Manual Deploy"** → **"Deploy latest commit"**

### Vercel (Frontend)
- Se hace deploy automáticamente cada vez que hagas push a `main`
- Preview deployments se crean para cada PR

---

## 💰 Costo Total

| Servicio | Plan | Costo |
|----------|------|-------|
| Supabase | Free | $0/mes |
| Render | Free | $0/mes |
| Vercel | Free | $0/mes |
| OSRM | Public | $0/mes |
| **Total** | | **$0/mes** |

**Limitaciones del plan free:**
- Render: Se duerme después de 15 min de inactividad ( primer request tarda ~30s)
- Supabase: 500MB de almacenamiento, 50,000 rows
- Vercel: 100GB de bandwidth/mes

---

## 🐛 Troubleshooting

### "CORS error" en el navegador
→ Verificá que `CORS_ORIGINS` incluya tu dominio de Vercel

### Backend no responde en Render
→ El plan free se duerme. El primer request tarda ~30s en despertar.
→ Solución: Upgrade a plan pago ($7/mes) o usar UptimeRobot para keep-alive

### "Rate limit exceeded"
→ Aumentá `RATE_LIMIT` en Render o reducí la frecuencia de requests
