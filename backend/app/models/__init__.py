# Import all models here so Alembic can discover them
from app.models.user import User
from app.models.company import Company
from app.models.driver import Driver
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.models.trip import Trip
from app.models.order import Order
from app.models.expense import Expense
from app.models.document import Document
from app.models.activity import TripActivityLog
