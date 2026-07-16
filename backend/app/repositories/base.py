from typing import Any, Dict, Generic, List, Optional, Type, TypeVar, Union
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.database.session import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    def get(self, db: Session, id: Any) -> Optional[ModelType]:
        query = db.query(self.model).filter(self.model.id == id)
        if hasattr(self.model, 'is_deleted'):
            query = query.filter(self.model.is_deleted == False)
        return query.first()

    def get_multi(
        self, db: Session, *, skip: int = 0, limit: int = 100, company_id: Optional[str] = None
    ) -> List[ModelType]:
        query = db.query(self.model)
        if hasattr(self.model, 'is_deleted'):
            query = query.filter(self.model.is_deleted == False)
        if company_id and hasattr(self.model, 'company_id'):
            query = query.filter(self.model.company_id == company_id)
        return query.offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: CreateSchemaType, company_id: Optional[str] = None) -> ModelType:
        obj_in_data = jsonable_encoder(obj_in)
        if company_id and hasattr(self.model, 'company_id'):
            obj_in_data["company_id"] = company_id
            
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update(
        self,
        db: Session,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]]
    ) -> ModelType:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
            
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
                
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def remove(self, db: Session, *, id: str) -> ModelType:
        obj = db.query(self.model).get(id)
        if hasattr(obj, 'is_deleted'):
            obj.is_deleted = True
            obj.deleted_at = datetime.now(timezone.utc)
            db.add(obj)
        else:
            db.delete(obj)
        db.commit()
        return obj
