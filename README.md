# Valora - Ambiente Local de Desenvolvimento 🧪

Este projeto roda com stack completa em containers para desenvolvimento local com recarga em tempo real:

- Frontend: React + Vite (HMR)
- Backend: Go + Air (hot reload)
- Banco: MongoDB
- Gateway: Caddy (endpoint unico)

## Requisitos

- Docker
- Docker Compose (plugin `docker compose`)
- Make

## Subir e derrubar tudo

Comandos principais:

```bash
make up
make down
make restart
make logs
make ps
```

### O que cada comando faz

- `make up`: derruba stack anterior com volumes e sobe tudo de novo (Mongo sempre limpo)
- `make down`: derruba stack e remove volumes
- `make restart`: equivalente a `down` + `up`
- `make logs`: acompanha logs de todos os servicos
- `make ps`: mostra status dos containers

## Acesso no navegador

Use somente HTTP:

- `http://localhost:8080`

Nao use `https://localhost:8080`.

## Fluxo de autenticacao local

1. Abra `http://localhost:8080/register`
2. Crie sua conta com nome, email e senha (minimo 8 caracteres)
3. Depois de registrar, o login fica em `http://localhost:8080/login`

O sistema usa sessao em cookie `HttpOnly` com duracao local de 7 dias (`SESSION_TTL_HOURS=168`).

## Verificacoes rapidas

Depois de subir com `make up`:

1. Abra `http://localhost:8080/register` e cadastre um usuario
2. Crie uma conta e um lancamento
3. Clique em sair e confirme redirecionamento para `/login`
4. Edite um arquivo em `ui/src` e confirme HMR no frontend
5. Edite um arquivo `.go` em `internal/` e confirme reload do backend nos logs

## Arquivos de ambiente local

- `docker-compose.dev.yml` - orquestracao dos servicos
- `deploy/caddy/Caddyfile` - roteamento do gateway
- `.air.toml` - configuracao de hot reload do backend
- `Makefile` - automacao dos comandos de desenvolvimento
