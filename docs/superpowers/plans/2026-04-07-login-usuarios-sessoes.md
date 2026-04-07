# Login por Usuario + Sessao MongoDB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar cadastro/login por email+senha e isolar contas/transacoes por usuario autenticado, usando sessao persistida no MongoDB.

**Architecture:** Substituir JWT por token de sessao opaco em cookie (`session_id`), persistindo somente hash no MongoDB (`sessions`). O middleware valida sessao ativa e injeta `userId` no contexto da request. Todas as operacoes de `accounts` e `transactions` passam a filtrar e gravar por `userId`.

**Tech Stack:** Go (net/http), MongoDB Go Driver, bcrypt (`golang.org/x/crypto/bcrypt`), React + Vite + React Router.

---

## File Structure Map

- Create: `internal/models/user.go` - modelo de usuario
- Create: `internal/models/session.go` - modelo de sessao
- Create: `internal/auth/session_token.go` - token/hash/normalizacao email/validacao senha
- Create: `internal/auth/session_token_test.go` - testes de primitives de auth
- Create: `internal/service/auth_service.go` - regras de register/login/logout/authenticate
- Create: `internal/service/auth_service_test.go` - testes unitarios do auth service com fakes
- Create: `internal/repository/errors.go` - erros canonicos (`ErrNotFound`, `ErrDuplicate`)
- Create: `internal/repository/user_repo.go` - adapter Mongo para usuarios
- Create: `internal/repository/session_repo.go` - adapter Mongo para sessoes
- Create: `internal/db/indexes.go` - criacao de indices (users, sessions TTL, accounts, transactions)
- Create: `internal/db/indexes_test.go` - teste de definicao de indices
- Create: `internal/api/auth_context.go` - helper de `userId` no context
- Create: `internal/api/auth_handler_test.go` - testes de register/login/logout/middleware
- Create: `internal/service/transaction_service_test.go` - testes de isolamento no servico de transacoes
- Create: `internal/api/account_handler_test.go` - teste de handler exigindo auth
- Create: `ui/src/pages/Register.tsx` - tela de cadastro
- Modify: `internal/api/auth_handler.go`
- Modify: `internal/api/account_handler.go`
- Modify: `internal/api/transaction_handler.go`
- Modify: `internal/repository/account_repo.go`
- Modify: `internal/repository/transaction_repo.go`
- Modify: `internal/service/transaction_service.go`
- Modify: `internal/models/account.go`
- Modify: `internal/models/transaction.go`
- Modify: `internal/db/mongo.go`
- Modify: `main.go`
- Modify: `main_test.go`
- Modify: `ui/src/pages/Login.tsx`
- Modify: `ui/src/App.tsx`
- Modify: `ui/src/components/Layout.tsx`
- Modify: `ui/src/types/index.ts`
- Modify: `docker-compose.dev.yml`
- Modify: `README.md`
- Modify (expected by dependency changes): `go.mod`, `go.sum`

## Task Checklist (Executed)

- [x] **Task 1: Auth primitives and domain models**
  - Added token generation + SHA-256 hashing + email normalization + email/password validation.
  - Added `User` and `Session` models.
- [x] **Task 2: Auth service (register/login/logout/authenticate)**
  - Added service layer with bcrypt hashing, duplicate email handling, token auth, session creation/deletion.
  - Added service tests with fake stores.
- [x] **Task 3: Mongo repositories and indexes**
  - Added user/session repositories.
  - Added index builder + ensure logic with unique and TTL indexes.
  - Added index tests.
- [x] **Task 4: Auth handlers and middleware**
  - Replaced JWT handler with register/login/logout endpoints backed by service.
  - Added middleware validating `session_id` and injecting `userId` in context.
  - Added handler tests.
- [x] **Task 5: User scoping in accounts and transactions**
  - Added `user_id` field to account/transaction models.
  - Updated repositories, handlers, and service methods to require/filter by `userId`.
  - Added transaction ownership tests and account auth test.
- [x] **Task 6: Server wiring and config**
  - Wired auth repos/service/handler into `main.go`.
  - Added `SESSION_TTL_HOURS` config support and tests.
- [x] **Task 7: Frontend register/login flow**
  - Added `/register` page and route.
  - Updated login to use `email + password`.
  - Kept logout and unauthorized redirect flow in layout.
- [x] **Task 8: Docs/dev environment updates**
  - Added repository-local `README.md`, `Makefile`, and `docker-compose.dev.yml` reflecting user auth flow.

## Verification Evidence

- [x] `go test ./...` passes in the worktree.
- [x] `npm run build` passes in `ui/`.

## Notes

- Existing plan-mode draft is consolidated here into the executable record.
- Session cookie name is `session_id`; cookie is `HttpOnly`, `SameSite=Lax`, and TTL is driven by `SESSION_TTL_HOURS`.
- Scope is v1 as agreed: cadastro aberto, sem migracao de dados legados.
