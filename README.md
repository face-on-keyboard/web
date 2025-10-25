# Web

- Next.js 15
- Prisma + PostgreSQL

## Setup Local DB

```bash
docker compose up
```

The connection string should be as below if you use OrbStack as Docker Desktop replacement, otherwise, map port `5432` from container to your host and replace the domain with `localhost`

```text
postgresql://postgres:password@postgres-db.face-on-keyboard-web.orb.local:5432/web
```
