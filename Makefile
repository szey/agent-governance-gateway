.PHONY: run test test-race build fmt vet docker

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

fmt:
	gofmt -w ./cmd ./internal ./web

vet:
	go vet ./...

docker:
	docker compose up --build
