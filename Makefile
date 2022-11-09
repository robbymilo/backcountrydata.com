.PHONY: build-frontend
build-frontend:
	cd frontend && npm ci && npm run build
