from typing import Any, Dict, Optional

def success_response(message: str, data: Optional[Any] = None) -> Dict[str, Any]:
    response = {
        "success": True,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    else:
        response["data"] = {}
    return response

def error_response(message: str, errors: Optional[Any] = None) -> Dict[str, Any]:
    response = {
        "success": False,
        "message": message,
    }
    if errors is not None:
        response["errors"] = errors
    else:
        response["errors"] = {}
    return response
