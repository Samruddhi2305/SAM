# Smart Asset Management and Resource Allocation Platform

SAM is a modern, full-stack asset management and resource booking platform designed for organizations (such as the IIT Roorkee Cultural Council) to track inventory, coordinate schedules, manage approvals, and analyze resource utilization. 

🎥 **[Project Demonstration Video](https://drive.google.com/file/d/14G39XdzzKAZCGaxF7OZUVEYl-7dbocVT/view?usp=drive_link)**

---

## Key Features

### Mandatory Features
- **User Authentication**: Secure JWT-based registration and login session management. The very first registered user is automatically designated as `admin`.
- **Inventory Management**: Full admin-dashboard CRUD (Create, Read, Update, Delete) with status tracking (`Available`, `Maintenance`, `Damaged`) and condition status (`Good`, `Fair`, `Poor`).
- **Asset Discovery & Booking**: Catalog search-as-you-type, category filters, and calendar-based booking duration requests. The platform dynamically checks inventory capacity over overlapping active durations.
- **Approval Workflow**: Queue system for administrators to Approve or Reject reservations.
- **Asset Issue & Return**: Tracks check-out (issuance) and check-in (returns) with timestamp logging.
- **Borrowing History**: Personal records panel for users showing active approvals, pending requests, and closed allocations.
- **Analytics Dashboard**: Summary cards and Recharts visualizations (pie charts, bar charts, line graphs) showing resource usage distributions and booking volume trends.

### Bonus Features Included
- **In-App Notification Center**: Instant user notifications on booking decisions and checkout updates.
- **Administrative Audit Trail**: Live database log capturing all system modifications, additions, and transactions.
- **QR Code Operations**: Admin-side QR label generation, print utility, and a QR scanning simulation panel to perform instant check-outs/check-ins.
- **Health Tracking**: Maintenance logs database tracking repair events, technician details, and costs.
- **Dockerized Setup**: Full orchestration for MongoDB, FastAPI, and Vite React dev server.

---

## Technology Stack

- **Frontend**: React 19, Vite, React Router Dom v7, Recharts, Axios, QRCode.react, Lucide React icons.
- **Styling**: Premium custom Vanilla CSS (glassmorphic dark design system).
- **Backend**: FastAPI (Python 3.13), Uvicorn, Pydantic v2 schemas, python-jose (JWT validation), passlib (Bcrypt hashing).
- **Database**: MongoDB (via PyMongo) with a **fail-safe local JSON storage fallback**.

---

## Setup & Running Instructions

### Option 1: Running with Docker Compose (Recommended)
This launches MongoDB, the FastAPI backend, and the Vite React app simultaneously inside isolated containers.

1. Ensure Docker Desktop is installed and running.
2. In the project root folder, run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser to:
   - **Frontend**: `http://localhost:5173`
   - **Backend API Docs**: `http://localhost:8000/docs`

---

### Option 2: Running Locally (No Docker Required)
The platform includes an **automatic JSON fallback database**; if a local MongoDB connection is unavailable, it saves records directly to `backend/data/` as JSON files. No database setup is needed!

#### 1. Backend Setup
1. Open a terminal inside `backend/` directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *The backend will boot on port 8000 and log: `Database: MongoDB unavailable. Initializing JSON file fallback...`*

#### 2. Frontend Setup
1. Open a terminal inside `frontend/` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at `http://localhost:5173`.

---

## Verification & User Roles Testing

1. **Register Admin**: Register the *first* account. The system automatically elevates the first user to `admin` role. You'll be redirected to the Admin Analytics Dashboard.
2. **Add Inventory**: Go to **Inventory Manager** and click **Add New Asset** (e.g. DSLR Camera, quantity 3).
3. **Register Regular User**: Register a second account. It will default to the standard `user` role. You'll be directed to the resource search catalog.
4. **Submit Request**: Search for the camera, click **Request Booking**, choose a 3-day duration and submit.
5. **Admin Approval & Check-out**: Log back in as admin, go to **Request Approvals**, click **Approve**, then click **Check Out** when the user picks it up.
6. **QR Scan Simulation**: Go to the QR scanning panel, select the camera from the dropdown (simulates scanning the label), and perform instant operations.
7. **View Logs**: The dashboard charts will populate, and audit logs will capture all events.
