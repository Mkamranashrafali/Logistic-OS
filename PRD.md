# Product Requirements Document (PRD)

# Product Name

**LogistiCore** *(Working Name)*

---

# Vision

LogistiCore is a modern **Logistics Operating System (Logistics OS)** built for small and medium logistics companies. It centralizes daily logistics operations into a single platform, replacing Excel sheets, WhatsApp communication, and manual paperwork.

The goal is to help logistics companies manage their business from one dashboard.

---

# Problem Statement

Most logistics companies still rely on multiple disconnected tools such as:

- Excel
- WhatsApp
- Phone Calls
- Emails
- Paper Receipts

This creates several operational problems:

- No centralized records
- Difficult trip tracking
- Lost fuel receipts
- Manual reporting
- Poor communication
- No business insights

---

# Target Users

## Primary Users

- Logistics Company Owners
- Fleet Managers

## Secondary Users

- Drivers

---

# User Roles

## Owner / Admin

The Owner has full access to the system.

Responsibilities:

- Manage Company
- Manage Drivers
- Manage Vehicles
- Manage Customers
- Create Orders
- Assign Trips
- View Reports
- Monitor Operations

---

## Driver

Drivers can only access their assigned work.

Responsibilities:

- Login
- View Assigned Orders
- Accept Assigned Job
- Complete Vehicle Inspection
- Start Trip
- Upload Fuel Receipts
- Add Expenses
- Upload Delivery Proof
- Complete Trip

---

# MVP Modules

## Authentication

- Login
- Logout
- Forgot Password

---

## Company Management

- Company Profile
- Company Information

---

## Driver Management

- Add Driver
- Edit Driver
- Disable Driver

Driver Information:

- Name
- Phone
- Email
- License Number
- CNIC
- Emergency Contact
- Status

---

## Vehicle Management

- Add Vehicle
- Edit Vehicle
- Vehicle Status

Vehicle Information:

- Truck Number
- Registration Number
- Model
- Capacity
- Current Kilometer
- Insurance Expiry
- Availability Status

---

## Customer Management

- Add Customer
- Edit Customer
- Customer History

---

## Order Management

The Owner can create logistics orders.

Order Information:

- Customer
- Pickup Location
- Delivery Location
- Cargo Type
- Weight
- Expected Delivery Date
- Notes

Order Status:

- Pending
- Assigned
- In Progress
- Delivered
- Closed

---

## Trip Management

Once an order is assigned to a driver and vehicle, the system automatically creates a Trip.

Trip Lifecycle:

- Assigned
- Accepted
- Vehicle Inspection
- Started
- Fuel Update
- Expense Update
- Delivery Proof
- Completed

---

## Driver Portal

Driver can:

- View Assigned Orders
- Accept Order
- Complete Vehicle Inspection
- Start Trip
- Upload Fuel Receipt
- Upload Expense Receipt
- Report Issues
- Upload Delivery Proof
- Complete Trip

---

## Owner Dashboard

Dashboard Widgets:

- Total Orders
- Active Trips
- Completed Trips
- Delayed Trips
- Available Drivers
- Available Vehicles
- Fuel Expenses
- Pending Payments

---

## Reports

Generate reports by:

- Driver
- Vehicle
- Customer
- Order
- Date Range

Export Options:

- PDF
- Excel

---

# Workflow

```text
Owner Login
      ↓
Create Customer
      ↓
Create Order
      ↓
Assign Driver
      ↓
Assign Vehicle
      ↓
Driver Receives Notification
      ↓
Driver Accepts Job
      ↓
Vehicle Inspection
      ↓
Start Trip
      ↓
Fuel Updates
      ↓
Expense Updates
      ↓
Delivery Proof
      ↓
Trip Completed
      ↓
Owner Review
      ↓
Payment Recorded
      ↓
Order Closed
```

---

# Tech Stack

## Frontend

- Next.js
- Tailwind CSS
- shadcn/ui
- Geist Font

## Backend

- FastAPI
- SQLAlchemy

## Database

- Supabase PostgreSQL
- Supabase Storage

## Authentication

- JWT Authentication

## Email

- SMTP

## Deployment

- Vercel
- Railway
- Supabase

---

# Future Scope

- Live GPS Tracking
- Driver Mobile App
- AI Business Insights
- Route Optimization
- Predictive Maintenance
- Accountant Portal
- Dispatcher Portal
- Customer Portal
- Multi-Branch Support
- Multi-Tenant Architecture
- API Integrations

---

# MVP Goal

Develop a modern Logistics Operating System that allows logistics companies to efficiently manage drivers, vehicles, customers, orders, trips, expenses, and reports through a single centralized web application.