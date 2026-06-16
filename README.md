# 🐍 Python Friends School

Plataforma de aprendizaje de **Python básico** con panel de administración para crear y gestionar contenido dinámicamente. Desplegado en **Vercel** con backend serverless sobre **Neon Postgres**.

---

## 📦 Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Estilos | Tailwind CSS + Lucide Icons |
| Routing | React Router v7 |
| Backend | Vercel Serverless Functions |
| Base de datos | Neon Postgres (serverless, HTTP) |
| ORM/Driver | `@neondatabase/serverless` |
| Auth | JWT (jsonwebtoken) + bcryptjs |

---

## 🚀 Setup local

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo>
cd python-friends-school
npm install
```

### 2. Configurar variables de entorno

Copia el ejemplo y completa con tus datos:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# 1. Ve a https://neon.tech → tu proyecto → Connection Details
# 2. Copia la cadena completa "Connection string"
DATABASE_URL=postgresql://usuario:contraseña@host/neondb?sslmode=require

# 3. Genera un secreto JWT fuerte:
#    node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
#    Pégalo aquí:
JWT_SECRET=<cadena-generada>
```

### 3. Inicializar la base de datos (solo la primera vez)

```bash
npm run init-db
```

Esto crea todas las tablas, el usuario admin y el contenido del curso de ejemplo.
Salida esperada:

```
✅ Tabla 'users' creada
✅ Tabla 'sections' creada
✅ Tabla 'theory_cards' creada
✅ Tabla 'examples' creada
✅ Usuario admin creado: darkpierce@gmail.com
✅ 11 secciones de ejemplo insertadas
✅seed completo. ¡Listo para trabajar!
```

### 4. Arrancar el dev server

```bash
npm run dev
```

Abre http://localhost:5173

---

## 👤 Credenciales de administrador

| Campo | Valor |
|---|---|
| Email | darkpierce@gmail.com |
| Contraseña | Regalo2025@ |

Acceso: http://localhost:5173/admin/login

---

## 📁 Estructura del proyecto

```
├── api/                        # Vercel Serverless Functions
│   ├── _lib/
│   │   ├── db.ts               # Cliente Neon HTTP
│   │   ├── auth.ts             # bcrypt + JWT
│   │   └── middleware.ts       # Verificación de tokens
│   ├── login.ts                # POST /api/login
│   ├── sections/
│   │   ├── index.ts            # GET (público) + POST (admin)
│   │   └── [id].ts            # GET, PUT, DELETE (admin)
│   └── seed.ts                # POST /api/seed
│
├── scripts/
│   └── init-db.mjs             # Creación de tablas + seed
│
├── src/
│   ├── lib/
│   │   ├── api.ts              # Cliente HTTP con auth
│   │   └── useAuth.ts          # Hook de autenticación
│   ├── pages/
│   │   ├── Home.tsx            # Página pública del curso
│   │   ├── AdminLogin.tsx      # Login admin
│   │   └── AdminPanel.tsx      # CRUD completo de secciones
│   ├── App.tsx                 # Router principal
│   └── main.tsx
│
├── vercel.json                 # Configuración de deploy
├── vite.config.ts               # Vite (base './' para Vercel)
└── package.json
```

---

## 🌐 Despliegue en Vercel

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit: Python Friends School"
gh repo create python-friends-school --public --push
```

### 2. Conectar en Vercel

1. Ve a [vercel.com](https://vercel.com) → "New Project"
2. Importa el repositorio de GitHub
3. En **Environment Variables** añade:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Tu cadena de Neon completa |
   | `JWT_SECRET` | Tu secreto JWT generado |

4. Deploy automático en cada push a `main`

### 3. Inicializar la base de datos en producción

Una vez desplegado, visita:

```
https://tu-dominio.vercel.app/api/seed
```

Esto crea las tablas y el contenido inicial en tu Neon.

### 4. Regenerar contraseña de Neon (seguridad)

> Si compartiste tu cadena de conexión en algún chat o logs,
> regenerate la contraseña en Neon Dashboard > Settings > Password.

---

## 📝 Uso del panel admin

### Crear una sección nueva

1. Ve a `/admin/login` e inicia sesión
2. Haz clic en **"Nueva sección"**
3. Rellena:
   - **Título** (obligatorio)
   - **Subtítulo** y **Descripción** (opcional)
   - **Etiqueta** (ej: "Lección 3")
   - **Slug** (se genera automáticamente, editable)
   - **Icono** y **Gradiente** (elige estilos)
   - **Tarjetas de teoría**: añade explicaciones con título y contenido
   - **Ejemplos prácticos**: código Python + resultado esperado
4. Guarda — el contenido aparece instantáneamente para todos los visitantes

### Gestionar secciones existentes

- **↑ / ↓** — Reordenar
- **👁 / 👁‍🗨** — Publicar / Despublicar
- **✏** — Editar
- **🗑** — Eliminar

---

## ⚠️ Notas importantes

- **NUNCA** commitees el archivo `.env.local`. Ya está en `.gitignore`.
- El script `init-db.mjs` es **idempotente**: se puede correr múltiples veces sin duplicar datos.
- El endpoint `/api/seed` también es idempotente.
- Los cambios del admin se guardan en **Neon Postgres** y se sirven a todos los visitantes en tiempo real.