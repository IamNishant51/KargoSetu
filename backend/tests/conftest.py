"""Shared test fixtures for the KargoSetu backend test suite."""

import os
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = (
    "postgresql://kargosetu:kargosetu@localhost:5432/kargosetu?pgbouncer=true"
)
os.environ["JWT_SECRET_KEY"] = "test_secret_12345678901234567890123456789012"
from app.main import app


@pytest.fixture
def client(mock_prisma):
    """Create a test client with mocked database."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def mock_prisma():
    """Mock the Prisma client for unit tests."""
    with patch("app.api.dependencies.prisma") as mock1, \
         patch("app.main.prisma") as mock2:
        for mock in (mock1, mock2):
            mock.connect = AsyncMock()
            mock.disconnect = AsyncMock()
            mock.execute_raw = AsyncMock(return_value=None)
        yield mock1
