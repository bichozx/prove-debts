# Debt Manager MVP

## 📌 Overview

Aplicación para gestionar deudas entre usuarios, permitiendo registrar, pagar y consultar deudas.

## 🧠 Decisiones Técnicas

- NestJS por arquitectura modular
- PostgreSQL para persistencia
- Redis como capa de cache
- JWT para autenticación
- Docker para fácil despliegue local

## 🧱 Arquitectura

- Modular (Auth, Users, Debts)
- DTOs + Validaciones
- Cache desacoplada

## 🚀 Instalación

1. Clonar repo
2. Copiar .env.example
3. docker-compose up
4. Backend en http://localhost:3000

## 🔐 Endpoints

(Listar aquí los endpoints clave)

## 📊 Extras Implementados

- Export CSV/JSON
- Aggregations (saldo total)
- Redis Cache
- Unit Test ejemplo

## 🧪 Tests

npm run test

## 📝 Notas

Este proyecto se desarrolló como MVP priorizando claridad, mantenibilidad y buenas prácticas.
