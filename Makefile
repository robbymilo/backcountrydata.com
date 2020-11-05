.PHONY: build
build_api:
	docker build -f api/Dockerfile . -t robbymilo/backcountrydata

.PHONY: push_api
push_api:
	docker push robbymilo/backcountrydata:latest