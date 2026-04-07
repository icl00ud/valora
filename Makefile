COMPOSE := docker compose -f docker-compose.dev.yml

.PHONY: up down restart logs ps

up:
	$(COMPOSE) down -v --remove-orphans
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down -v --remove-orphans

restart: down up

logs:
	$(COMPOSE) logs -f --tail=200

ps:
	$(COMPOSE) ps
