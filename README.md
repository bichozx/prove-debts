📌 Descripción general

Este proyecto es un backend REST API desarrollado con NestJS, PostgreSQL y Redis, que permite la gestión de deudas por usuario autenticado.

Incluye:

Autenticación con JWT

CRUD de deudas

Cache por usuario con Redis

Invalidación automática del cache

Arquitectura modular y escalable

🧱 Tecnologías usadas

Node.js

NestJS v11

TypeORM

PostgreSQL

Redis (ioredis)

JWT / Passport

Docker (solo Redis / DB)

🧠 Arquitectura del sistema
src/
├── auth/ # Login, JWT, Guards
├── users/ # Usuarios
├── debts/ # Dominio de deudas
├── redis/ # Cliente Redis global (ioredis)
├── config/ # Configuración base de DB
└── main.ts

Flujo principal
Request → JWT Guard → Controller → Service
→ PostgreSQL (TypeORM)
→ Redis (Cache por usuario)

🔐 Autenticación

Autenticación basada en JWT

Cada request debe incluir:

Authorization: Bearer <token>

Todas las deudas están ligadas al usuario autenticado

No se puede acceder a deudas de otro usuario

💾 Cache con Redis

Redis se usa directamente con ioredis (no cache-manager)

Cache por usuario:

debts*user*<userId>

TTL: 300 segundos

El cache se:

Guarda en GET /debts

Invalida automáticamente al crear / editar / eliminar / pagar deuda

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

Docker Compose (opcional)

PostgreSQL

Redis

2️⃣ Clonar el repositorio
git clone <repo-url>
cd prove-debts

3️⃣ Instalar dependencias
npm install

4️⃣ Levantar Redis con Docker
docker run -d \
 --name prove-debs-redis \
 -p 6380:6379 \
 redis

Comprobar:

docker exec -it prove-debs-redis redis-cli ping

# PONG

5️⃣ Variables de entorno .env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=debts_db

JWT_SECRET=supersecret
JWT_EXPIRES_IN=1d

6️⃣ Iniciar aplicación
npm run start:dev

Servidor:

http://localhost:4001

🔌 Endpoints disponibles
🔐 Auth
Método Endpoint Descripción
POST /auth/login Login de usuario
💸 Deudas
Método Endpoint Descripción
POST /debts Crear deuda
GET /debts Listar deudas (con cache)
PATCH /debts/:id Editar deuda
PATCH /debts/:id/pay Marcar como pagada
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
useFactory: () => new Redis({ host: 'localhost', port: 6380 }),
},
],
exports: [REDIS_CLIENT],
})
export class RedisModule {}

✅ Buenas prácticas aplicadas

Cache manual controlado

Invalidación explícita

Seguridad por usuario

Arquitectura modular

Servicios delgados

Redis desacoplado del framework

📌 Posibles mejoras

Tests e2e con Supertest + Redis

Métricas cache hit/miss

Rate limiting con Redis

Soft delete de deudas

Eventos con EventEmitter / BullMQ

👨‍💻 Autor

Proyecto desarrollado por Juan Camilo Giraldo Agudelo

Si quieres, en el siguiente paso puedo:

🔹 Adaptarlo a entrega universitaria

🔹 Simplificar para prueba técnica

🔹 Agregar diagramas

🔹 Crear docker-compose completo

Solo dime 👍
