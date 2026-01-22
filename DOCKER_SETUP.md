# Docker Setup Guide

## 🐳 Build Docker Image

```bash
docker build -t node-ts-devops:latest .
```

## ▶️ Run Container (Development)

```bash
docker run -d -p 3000:3000 \
  -e PORT=3000 \
  -e SUPABASE_URL="https://rkjvokxdmlucossbcvxs.supabase.co" \
  -e SUPABASE_KEY="sb_secret_UqutVQA46uZjWSEPh2pKxw_P9G579kB" \
  --name my-node-app \
  node-ts-devops:latest
```

## ▶️ Run Container (Using .env file)

```bash
docker run -d -p 3000:3000 \
  --env-file .env.production \
  --name my-node-app \
  node-ts-devops:latest
```

## ✅ Test the Container

```bash
# Health check
curl http://localhost:3000/

# Signup endpoint
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123",
    "firstName":"John",
    "lastName":"Doe"
  }'
```

## 📋 Useful Docker Commands

```bash
# View logs
docker logs my-node-app

# View logs in real-time
docker logs -f my-node-app

# Stop container
docker stop my-node-app

# Start container
docker start my-node-app

# Remove container
docker rm my-node-app

# List all containers
docker ps -a

# Check container status
docker inspect my-node-app
```

## 🔧 Environment Variables Required

| Variable | Value | Example |
|----------|-------|---------|
| PORT | Server port | 3000 |
| SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| SUPABASE_KEY | Supabase API key | sb_secret_xxx |
| NODE_ENV | Environment | production |

## ✨ Container Ready!

```
✅ Listening on port 3000
✅ All endpoints available
✅ Authentication working
✅ Supabase connected
```

## 📝 Example: Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - SUPABASE_URL=https://rkjvokxdmlucossbcvxs.supabase.co
      - SUPABASE_KEY=sb_secret_UqutVQA46uZjWSEPh2pKxw_P9G579kB
      - NODE_ENV=production
    container_name: my-node-app
```

Then run:
```bash
docker-compose up -d
docker-compose logs -f
```

## 🛑 Stop All Containers

```bash
docker stop my-node-app
docker rm my-node-app
```
