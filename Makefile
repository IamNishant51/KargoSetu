# ==============================================================================
# KargoSetu Unified Makefile
# ==============================================================================
# This Makefile provides a single unified interface for all developer tasks
# across both the frontend and backend of the KargoSetu repository.
#
# Usage:
#   make <target>
#
# Common Targets:
#   install         Install both frontend (npm) and backend (pip) dependencies
#   up              Run both dev servers concurrently
#   test            Run all test suites
#   lint            Run all linters for code quality
#   format          Auto-format all code
# ==============================================================================

# ------------------------------------------------------------------------------
# Configuration
# ------------------------------------------------------------------------------
# We define default shell to bash for consistency across environments if available.
SHELL := /bin/bash

# Directory paths
FRONTEND_DIR := frontend
BACKEND_DIR := backend

# ------------------------------------------------------------------------------
# Installation Targets
# ------------------------------------------------------------------------------

.PHONY: install install-frontend install-backend
install: install-backend install-frontend ## Install all project dependencies

install-frontend:
	@echo "=> Installing Frontend Dependencies (npm)..."
	@cd $(FRONTEND_DIR) && npm install

install-backend:
	@echo "=> Installing Backend Dependencies (pip)..."
	@cd $(BACKEND_DIR) && pip install -r requirements.txt


# ------------------------------------------------------------------------------
# Development Server Targets
# ------------------------------------------------------------------------------

.PHONY: dev-frontend dev-backend up
dev-frontend: ## Run Next.js frontend development server
	@echo "=> Starting Next.js frontend server..."
	@cd $(FRONTEND_DIR) && npm run dev

dev-backend: ## Run FastAPI backend development server
	@echo "=> Starting FastAPI backend server..."
	@cd $(BACKEND_DIR) && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

up: ## Run both frontend and backend development servers concurrently
	@echo "=> Starting KargoSetu Platform Concurrently..."
	@npx concurrently -k -p "[{name}]" -n "Backend,Frontend" -c "cyan.bold,green.bold" \
		"cd $(BACKEND_DIR) && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" \
		"cd $(FRONTEND_DIR) && npm run dev"


# ------------------------------------------------------------------------------
# Testing Targets
# ------------------------------------------------------------------------------

.PHONY: test test-backend test-frontend
test: test-backend test-frontend ## Run all test suites

test-backend: ## Run backend tests with pytest
	@echo "=> Running backend pytest suite..."
	@cd $(BACKEND_DIR) && pytest

test-frontend: ## Run frontend end-to-end tests with Playwright
	@echo "=> Running frontend Playwright tests..."
	@cd $(FRONTEND_DIR) && npx playwright test


# ------------------------------------------------------------------------------
# Code Quality: Linting & Formatting
# ------------------------------------------------------------------------------

.PHONY: lint lint-backend lint-frontend
lint: lint-backend lint-frontend ## Run linters (eslint, black --check, bandit)

lint-backend:
	@echo "=> Linting backend code (Black check & Bandit)..."
	@cd $(BACKEND_DIR) && black --check . && bandit -r . -x tests

lint-frontend:
	@echo "=> Linting frontend code (ESLint)..."
	@cd $(FRONTEND_DIR) && npx eslint .

.PHONY: format format-backend format-frontend
format: format-backend format-frontend ## Auto-format code (prettier, black)

format-backend:
	@echo "=> Formatting backend code (Black)..."
	@cd $(BACKEND_DIR) && black .

format-frontend:
	@echo "=> Formatting frontend code (Prettier)..."
	@cd $(FRONTEND_DIR) && npx prettier --write .


# ------------------------------------------------------------------------------
# Help Target
# ------------------------------------------------------------------------------

.PHONY: help
help: ## Show this help message
	@echo "KargoSetu Developer Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

.DEFAULT_GOAL := help
