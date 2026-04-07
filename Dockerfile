# Estágio 1: Build do Frontend (React + Vite com Bun)
FROM oven/bun:1 AS frontend-builder
WORKDIR /app/ui

# Copiar dependências primeiro para aproveitar o cache do Docker
COPY ui/package.json ui/bun.lock ./
RUN bun install --frozen-lockfile

# Copiar o resto do código do frontend e fazer o build
COPY ui/ ./
RUN bun run build

# Estágio 2: Build do Backend (Golang)
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app

# Copiar go.mod e go.sum para baixar dependências (cache)
COPY go.mod go.sum ./
RUN go mod download

# Copiar o resto do código Go
COPY . .

# Copiar o build do frontend do Estágio 1 para a pasta esperada pelo go:embed
COPY --from=frontend-builder /app/ui/dist ./ui/dist

# Buildar o binário Go estático
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o my-finances main.go

# Estágio 3: Imagem Final (Mínima e Leve)
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/
# Copiar apenas o binário final do Estágio 2
COPY --from=backend-builder /app/my-finances .

EXPOSE 8080

CMD ["./my-finances"]
