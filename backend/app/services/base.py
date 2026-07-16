from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi import HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.repositories.base import CRUDBase

ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, repository: CRUDBase):
        self.repository = repository
        
    def get(self, db: Session, id: str) -> ModelType:
        obj = self.repository.get(db, id=id)
        if not obj:
            raise HTTPException(status_code=404, detail="Resource not found")
        return obj

    def get_multi(self, db: Session, skip: int = 0, limit: int = 100, company_id: Optional[str] = None) -> List[ModelType]:
        return self.repository.get_multi(db, skip=skip, limit=limit, company_id=company_id)

    def create(self, db: Session, obj_in: CreateSchemaType, company_id: Optional[str] = None) -> ModelType:
        return self.repository.create(db, obj_in=obj_in, company_id=company_id)

    def update(self, db: Session, id: str, obj_in: Union[UpdateSchemaType, Dict[str, Any]]) -> ModelType:
        db_obj = self.get(db, id)
        return self.repository.update(db, db_obj=db_obj, obj_in=obj_in)

    def remove(self, db: Session, id: str) -> ModelType:
        self.get(db, id) # Ensure exists
        return self.repository.remove(db, id=id)
