# CASTOM.CO — Guía de Instalación y Migración

Este proyecto es una tienda e-commerce full-stack construida con **Next.js 14 (App Router)**, **TypeScript**, **Prisma ORM (PostgreSQL)**, **NextAuth**, **Stripe** y **Tailwind CSS**.

Esta guía te permite levantar el proyecto en cualquier entorno (local, Vercel, Railway, tu propio servidor, o continuar el desarrollo en Claude Code / OpenCode / Cursor, etc.).

---

## 1. Requisitos previos

- **Node.js** 18.17+ (recomendado 20.x)
- **Yarn** (o npm/pnpm)
- Una base de datos **PostgreSQL** (local o en la nube: Neon, Supabase, Railway, AWS RDS...)
- Una cuenta de **Stripe** (para pagos)
- Un bucket **S3** o compatible (AWS S3, Cloudflare R2, MinIO) para imágenes de productos

---

## 2. Instalación

```bash
# 1. Instala dependencias
yarn install

# 2. Copia el archivo de variables de entorno y rellénalo
cp .env.example .env
# Edita .env con tus credenciales reales

# 3. Genera el cliente de Prisma
yarn prisma generate

# 4. Crea las tablas en tu base de datos
yarn prisma db push

# 5. Carga datos iniciales (categorías, productos de ejemplo, usuario admin)
npx tsx --require dotenv/config scripts/seed.ts

# 6. Arranca el servidor de desarrollo
yarn dev
```

La app quedará disponible en `http://localhost:3000`.

---

## 3. Variables de entorno

Ver `.env.example` para la lista completa. Las más importantes:

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL |
| `NEXTAUTH_SECRET` | Secreto para firmar sesiones (genera con `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | URL base de la app |
| `AWS_*` | Credenciales del bucket de imágenes |
| `STRIPE_*` | Claves de Stripe para pagos |

---

## 4. Estructura del proyecto

```
nextjs_space/
├── app/
│   ├── (store)/          # Páginas de la tienda (home, tienda, producto, carrito, checkout...)
│   ├── admin/            # Panel de administración
│   ├── login/ registro/  # Autenticación
│   └── api/              # Rutas backend (productos, checkout, auth, upload, webhooks...)
├── components/           # Componentes React reutilizables
├── lib/                  # Utilidades (db, auth, stripe, s3, cart)
├── prisma/schema.prisma  # Modelo de base de datos
├── scripts/seed.ts       # Datos iniciales
└── public/images/        # Imágenes estáticas y de marca
```

---

## 5. Despliegue

Este proyecto es un Next.js estándar y se puede desplegar en:

- **Vercel** (recomendado): conecta el repo, define las variables de entorno, deploy automático.
- **Railway / Render**: incluyen PostgreSQL gestionado.
- **Tu propio servidor**: `yarn build && yarn start` detrás de un reverse proxy (nginx).

Recuerda configurar el webhook de Stripe apuntando a `https://TU_DOMINIO/api/webhooks/stripe`.

---

## 6. Credenciales de admin (seed)

El script de seed crea un usuario administrador. Cámbialo en `scripts/seed.ts` antes de usar en producción y actualiza la contraseña.

---

## 7. Notas

- Las imágenes de productos se suben a S3 mediante URLs prefirmadas (ver `app/api/upload/`).
- El sistema de precios mayoristas aplica descuento automático desde 6 unidades (configurable por producto).
- Moneda: COP (Pesos colombianos) — se puede cambiar en los formateadores `Intl.NumberFormat`.
