"""Shared test fixtures for the KargoSetu backend test suite."""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

from app.main import app


@pytest.fixture
def client():
    """Create a test client with mocked database."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def mock_prisma():
    """Mock the Prisma client for unit tests."""
    with patch("app.api.dependencies.prisma") as mock:
        mock.connect = AsyncMock()
        mock.disconnect = AsyncMock()
        mock.execute_raw = AsyncMock(return_value=None)
        yield mock
