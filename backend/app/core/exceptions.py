"""
Global exception handlers for FastAPI.

These handlers ensure that all errors are returned in a consistent
JSON format: {"detail": "error message"} for 4xx/5xx responses.
This format is required by the TanStack Query onError handlers
in the Next.js frontend.
"""

import structlog
from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from prisma.errors import PrismaError

logger = structlog.get_logger(__name__)


async def prisma_error_handler(
    request: Request,
    exc: PrismaError,
) -> ORJSONResponse:
    """Handle Prisma ORM errors with appropriate HTTP status codes."""
    error_msg = str(exc)

    # Record not found
    if "RecordNotFound" in error_msg:
        return ORJSONResponse(
            status_code=404,
            content={"detail": "Resource not found"},
        )

    # Unique constraint violation
    if "Unique constraint" in error_msg:
        return ORJSONResponse(
            status_code=409,
            content={"detail": "Resource already exists"},
        )

    # Generic database error (do not leak internals)
    logger.error(
        "prisma_error", error=error_msg, path=request.url.path
    )
    return ORJSONResponse(
        status_code=500,
        content={"detail": "Database operation failed"},
    )


async def generic_error_handler(
    request: Request,
    exc: Exception,
) -> ORJSONResponse:
    """Catch-all handler for unhandled exceptions."""
    logger.error(
        "unhandled_exception",
        error=str(exc),
        error_type=type(exc).__name__,
        path=request.url.path,
        method=request.method,
    )
    return ORJSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


def register_exception_handlers(app: FastAPI) -> None:
    """Register all custom exception handlers on the FastAPI app."""
    app.add_exception_handler(PrismaError, prisma_error_handler)
    app.add_exception_handler(Exception, generic_error_handler)
