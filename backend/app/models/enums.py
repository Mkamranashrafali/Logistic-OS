from enum import Enum

class OrderStatus(str, Enum):
    PENDING = "pending"
    PLANNING = "planning"
    ASSIGNED = "assigned"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class TripStatus(str, Enum):
    CREATED = "created"
    STARTED = "started"
    PAUSED = "paused"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class DriverStatus(str, Enum):
    AVAILABLE = "available"
    ASSIGNED = "assigned"
    ON_TRIP = "on_trip"
    INACTIVE = "inactive"

class DriverLifecycleStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    TERMINATED = "terminated"

class VehicleStatus(str, Enum):
    AVAILABLE = "available"
    ASSIGNED = "assigned"
    ON_TRIP = "on_trip"
    MAINTENANCE = "maintenance"
