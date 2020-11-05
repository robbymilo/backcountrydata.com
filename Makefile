.PHONY: build-api
build-api:
	docker build -f api/Dockerfile . -t robbymilo/backcountrydata

.PHONY: push-api
push-api:
	docker push robbymilo/backcountrydata:latest

.PHONY: build-frontend
build-frontend:
	cd frontend && npm ci && npm run build
