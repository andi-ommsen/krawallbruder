.PHONY: up down stop install dev

up:
	docker-compose up -d --build

down stop:
	docker-compose down

install:
	cd frontend && npm install

dev:
	cd frontend && npm run dev
