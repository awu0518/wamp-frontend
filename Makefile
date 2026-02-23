# Makefile for wamp-front (React + Vite)

FORCE:

# Run all checks then build for production
prod: all_tests build

# Build production bundle
build: FORCE
	npm run build

# Start Vite dev server
dev: FORCE
	npm run dev

# Run lint and tests
all_tests: lint tests

# Run ESLint
lint: FORCE
	npm run lint

# Run Vitest in single-run mode
tests: FORCE
	npx vitest run

# Install all dependencies
dev_env: FORCE
	npm install

# Remove build artifacts and caches
clean: FORCE
	-rm -rf dist
	-rm -rf node_modules/.vite
