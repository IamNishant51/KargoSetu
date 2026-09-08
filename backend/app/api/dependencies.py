"""
Application-wide dependency injection.

The Prisma client is initialized here and connected/disconnected
via the FastAPI lifespan context manager in app/main.py.
Router handlers should NEVER call prisma.connect() directly.
"""

from prisma import Prisma

prisma = Prisma()
