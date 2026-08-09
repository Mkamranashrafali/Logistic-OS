from app.repositories.base import CRUDBase
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate

from app.models.driver import Driver
from app.schemas.driver import DriverCreate, DriverUpdate

from app.models.vehicle import Vehicle
from app.schemas.vehicle import VehicleCreate, VehicleUpdate

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate

from app.models.trip import Trip
from app.schemas.trip import TripCreate, TripUpdate

from app.models.order import Order
from app.schemas.order import OrderCreate, OrderUpdate

from app.models.expense import Expense
from app.schemas.expense import ExpenseCreate, ExpenseUpdate

company_repo = CRUDBase[Company, CompanyCreate, CompanyUpdate](Company)
driver_repo = CRUDBase[Driver, DriverCreate, DriverUpdate](Driver)
vehicle_repo = CRUDBase[Vehicle, VehicleCreate, VehicleUpdate](Vehicle)
customer_repo = CRUDBase[Customer, CustomerCreate, CustomerUpdate](Customer)
trip_repo = CRUDBase[Trip, TripCreate, TripUpdate](Trip)
order_repo = CRUDBase[Order, OrderCreate, OrderUpdate](Order)
expense_repo = CRUDBase[Expense, ExpenseCreate, ExpenseUpdate](Expense)
