from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.core.responses import error_response

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = {}
    for err in exc.errors():
        loc = ".".join(str(l) for l in err["loc"])
        errors[loc] = err["msg"]
    return JSONResponse(
        status_code=422,
        content=error_response(message="Validation Error", errors=errors),
    )

async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response(message=exc.detail),
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content=error_response(message="Internal Server Error", errors=str(exc)),
    )
