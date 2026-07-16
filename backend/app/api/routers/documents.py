from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Any, List

from app.database.session import get_db
from app.models.user import User
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse
from app.services import document_service

router = APIRouter()

@router.post("/", response_model=dict, summary="Create Document")
def create_document(
    obj_in: DocumentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    # Automatically enforce multi-tenancy via current_user.company_id
    item = document_service.create(db, obj_in=obj_in, company_id=current_user.company_id)
    return success_response(message="Document created successfully", data=DocumentResponse.model_validate(item).model_dump())

@router.get("/", response_model=dict, summary="Get all documents")
def read_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    items = document_service.get_multi(db, skip=skip, limit=limit, company_id=current_user.company_id)
    data = [DocumentResponse.model_validate(item).model_dump() for item in items]
    return success_response(message="Retrieved documents successfully", data=data)

@router.get("/{id}", response_model=dict, summary="Get Document by ID")
def read_document(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = document_service.get(db, id=id)
    # Ensure item belongs to user's company (Security)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
    return success_response(message="Document retrieved successfully", data=DocumentResponse.model_validate(item).model_dump())

@router.put("/{id}", response_model=dict, summary="Update Document")
def update_document(
    id: str,
    obj_in: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = document_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    item = document_service.update(db, id=id, obj_in=obj_in)
    return success_response(message="Document updated successfully", data=DocumentResponse.model_validate(item).model_dump())

@router.delete("/{id}", response_model=dict, summary="Soft delete Document")
def delete_document(
    id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    item = document_service.get(db, id=id)
    if hasattr(item, 'company_id') and item.company_id != current_user.company_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Not authorized to access this resource")
        
    document_service.remove(db, id=id)
    return success_response(message="Document deleted successfully")
