from app.services.base import BaseService
from app.repositories import (
    driver_repo, vehicle_repo, customer_repo, 
    trip_repo, order_repo, expense_repo, document_repo
)

from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate
driver_service = BaseService[Driver, DriverCreate, DriverUpdate](driver_repo)

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate
vehicle_service = BaseService[Vehicle, VehicleCreate, VehicleUpdate](vehicle_repo)

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate
customer_service = BaseService[Customer, CustomerCreate, CustomerUpdate](customer_repo)

from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripUpdate
trip_service = BaseService[Trip, TripCreate, TripUpdate](trip_repo)

from app.models.order import Order
from app.schemas.order import OrderCreate, OrderUpdate
order_service = BaseService[Order, OrderCreate, OrderUpdate](order_repo)

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate
expense_service = BaseService[Expense, ExpenseCreate, ExpenseUpdate](expense_repo)

from app.models.document import Document
from app.schemas.document import DocumentCreate, DocumentUpdate
document_service = BaseService[Document, DocumentCreate, DocumentUpdate](document_repo)
