from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

from app.database.session import get_db
from app.models.user import User
from app.models.company import Company
from app.schemas.company import CompanyUpdate, CompanyResponse
from app.api.dependencies.auth import get_current_user
from app.core.responses import success_response

router = APIRouter()

@router.get("/me", response_model=dict, summary="Get current company details")
def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    return success_response(
        message="Company retrieved successfully",
        data=CompanyResponse.model_validate(company).model_dump()
    )

@router.put("/me", response_model=dict, summary="Update current company details")
def update_my_company(
    obj_in: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can update company details")
        
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
        
    db.add(company)
    db.commit()
    db.refresh(company)
    
    return success_response(
        message="Company updated successfully",
        data=CompanyResponse.model_validate(company).model_dump()
    )
