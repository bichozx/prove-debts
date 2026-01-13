📌 Prove Debts – Backend API

Backend REST API desarrollado con NestJS, PostgreSQL y Redis, orientado a la gestión de deudas por usuario autenticado.
El sistema implementa autenticación JWT, cache por usuario y una arquitectura modular y escalable.

🧾 Funcionalidades principales

Autenticación basada en JWT

CRUD completo de deudas

Cache por usuario con Redis

Invalidación automática del cache

Aislamiento de datos por usuario

Arquitectura modular (por dominios)

🧱 Tecnologías usadas

Node.js

NestJS v11

TypeORM

PostgreSQL

Redis (ioredis)

JWT / Passport

Docker & Docker Compose (Redis)

⚠️ PostgreSQL no se crea automáticamente.
La base de datos debe crearse manualmente antes de iniciar la aplicación.

🧠 Arquitectura del sistema
src/
├── auth/ # Login, JWT, Guards
├── users/ # Usuarios
├── debts/ # Dominio de deudas
├── redis/ # Cliente Redis global
├── config/ # Configuración DB y entorno
└── main.ts

Flujo principal
Request
→ JWT Guard
→ Controller
→ Service
→ PostgreSQL (TypeORM)
→ Redis (cache por usuario)

🔐 Autenticación

Autenticación mediante JWT

Cada request protegido debe incluir:

Authorization: Bearer <token>

Todas las deudas están asociadas al usuario autenticado

No es posible acceder a deudas de otros usuarios

💾 Cache con Redis

Redis se utiliza directamente con ioredis

No se usa cache-manager para tener mayor control

Cache por usuario:

debts*user*<userId>

TTL: 300 segundos

El cache se:

Guarda en GET /debts

Invalida al crear, editar, eliminar o pagar una deuda

📂 Entidad Debt
Debt {
id: uuid
amount: number
description: string
status: PENDING | PAID
user: User
createdAt: Date
paidAt?: Date
}

🚀 Despliegue local
1️⃣ Requisitos

Node.js v18+

Docker

Docker Compose

PostgreSQL (instalado localmente)

2️⃣ Clonar repositorio
git clone <repo-url>
cd prove-debts

3️⃣ Instalar dependencias
npm install

4️⃣ Crear la base de datos (PASO MANUAL OBLIGATORIO)

La base de datos NO se crea automáticamente.

Desde PostgreSQL:

CREATE DATABASE prove-debs_db;

5️⃣ Variables de entorno

Crear archivo .env en la raíz del proyecto:

NODE_ENV=development
PORT=4001
FRONTEND_URL=http://localhost:4000

# Database

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=Danger4587
DB_NAME=prove-debs_db

# Redis

REDIS_HOST=localhost
REDIS_PORT=6380

# JWT

JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-chars
JWT_EXPIRES_IN=10d

6️⃣ Levantar Redis con Docker Compose
docker compose up -d

Verificar Redis:

docker exec -it prove-debs-redis redis-cli ping

Resultado esperado:

PONG

7️⃣ Iniciar aplicación
npm run start:dev

Servidor disponible en:

http://localhost:4001

🔌 Endpoints disponibles
🔐 Auth
Método Endpoint Descripción
POST /auth/login Login de usuario
💸 Deudas
Método Endpoint Descripción
POST /debts Crear deuda
GET /debts Listar deudas (cacheado)
PATCH /debts/:id Editar deuda
PATCH /debts/:id/pay Marcar deuda como pagada
DELETE /debts/:id Eliminar deuda
🧪 Ejemplo de flujo con cache

1️⃣ Primer GET /debts

🟢 FROM DB - SAVING CACHE

2️⃣ Segundo GET /debts

🔥 FROM CACHE

3️⃣ Crear / editar / eliminar deuda

DEL debts*user*<userId>

4️⃣ Nuevo GET /debts

🟢 FROM DB - SAVING CACHE

🧩 Redis Module (Global)

Redis se inicializa como módulo global:

@Global()
@Module({
providers: [
{
provide: REDIS_CLIENT,
useFactory: () =>
new Redis({ host: 'localhost', port: 6380 }),
},
],
exports: [REDIS_CLIENT],
})
export class RedisModule {}

✅ Decisiones técnicas

Cache manual para control total

Invalidación explícita para evitar datos obsoletos

Seguridad basada en usuario autenticado

Arquitectura modular orientada a dominio

Redis desacoplado del framework
