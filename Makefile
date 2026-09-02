.PHONY: run test test-race build web check-web fmt vet docker

run:
	go run ./cmd/server

test:
	go test ./...

test-race:
	go test -race ./...

build:
	go build -trimpath -o bin/agent-governance-gateway ./cmd/server
	go build -trimpath -o bin/agent-governance-discover ./cmd/discover
	go build -trimpath -o bin/agent-governance-observe ./cmd/observe

web:
	npm run build:web

check-web:
	npm run check:web

fmt:
	gofmt -w ./cmd ./internal ./web

vet:
	go vet ./...

docker:
	docker compose up --build
