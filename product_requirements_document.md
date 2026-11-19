# Product Requirements Document (PRD)
**Project Name:** HeritageTrails — Multi-City Heritage Tour Planner
**Project Type:** DBMS Mini-Project (5th Semester)
**Target Audience:** Tourists/Visitors, Tour Administrators

## 1. Product Overview
### 1.1 Objective
To build a relational database-backed web application that allows administrators to curate sequential heritage itineraries across regional hubs (e.g., Mangaluru Junction [MAJN]). Visitors can choose among walking, self-drive car, and tourist-bus options offered for an itinerary, view sequential landmarks, and book tours while the database enforces pricing, mode-specific capacity, and historical-data rules.

### 1.2 Value Proposition
The system maps the *exact sequential flow* of a heritage itinerary using a bridge table, supports multiple transport modes, applies capacity units appropriate to each mode, prevents overbooking using database triggers, and protects historical financial data using soft deletes and price locking.

---

## 2. Core Features & Requirements

### 2.1 User-Facing Features (Frontend)
* **Itinerary Catalog:** Users can view heritage tours, base price, duration, available travel modes, and the capacity for each mode.
* **Destination Filter:** Users can narrow the tour catalog by city and search tour titles, city names, or state names.
* **Timeline View:** Clicking an itinerary executes a stored procedure to display the ordered landmark stops, entry fees, and city data.
* **Mode Selection:** Visitors select walking, self-drive car, or tourist-bus mode from the options offered for that itinerary.
* **Booking System:** Users book a selected itinerary/mode for a `TravelDate`. The system stores group size and, for self-drive mode, number of cars; it locks the total price and defaults `PaymentStatus`.

### 2.2 System Features (Backend/Database)
* **Demo Data Management:** `seed.sql` loads sample data for Mangaluru, Delhi, Jaipur, Agra, Varanasi, Mysuru, Hampi, and Kochi. A separate admin CRUD interface is outside the current implementation.
* **Soft Deletion:** Instead of hard-deleting closed landmarks or retired tours, the system uses an `IsActive` boolean flag to hide them while preserving past booking data.
* **Automated Capacity Control:** `Itinerary_Modes` stores a capacity limit for each itinerary/mode. The booking trigger counts people/seats for walking and bus options and vehicle slots for self-drive car options.
* **Data Integrity Enforcement:** A trigger prevents the same landmark from being added to the same itinerary more than once.
* **Transport Scope:** Car visitors arrange their own vehicles. Tourist-bus capacity represents available seats, but vehicle dispatch, operator management, rentals, and fuel are outside the application's scope. Multiple modes can be offered for the same route; segment-by-segment mode changes are not currently represented.

---

## 3. Database Architecture (MySQL)

### 3.1 Schema Definition (7 Core Tables)
1. **Cities:** `CityID` (PK), `Name`, `State`, `HistoricalSignificance`.
2. **Landmarks:** `LandmarkID` (PK), `CityID` (FK), `Name`, `Description`, `EntryFee`, `IsActive` (Boolean).
3. **Itineraries:** `ItineraryID` (PK), `Title`, `BasePrice`, `DurationHours`, `IsActive` (Boolean).
4. **Itinerary_Stops (Bridge Table):** `StopID` (PK), `ItineraryID` (FK), `LandmarkID` (FK), `StopOrder` (Integer).
5. **TourModes:** `TourModeID` (PK), `ModeCode`, `ModeName`, `CapacityUnit` (`PEOPLE` or `VEHICLES`), `Description`, `IsActive`.
6. **Itinerary_Modes (Bridge Table):** Composite PK/FKs `ItineraryID` and `TourModeID`, plus `CapacityLimit` and `IsActive` for that mode on that itinerary.
7. **Bookings:** `BookingID` (PK), `CustomerName`, `CustomerEmail`, `ItineraryID`/`TourModeID` (composite FK), `TravelDate`, `GroupSize`, `VehicleCount`, `BookingDate`, locked `FinalPrice`, `PaymentStatus`, and `IsActive`.

### 3.2 Required SQL Components (Part-B Compliance)
* **Normalization:** Schema strictly adheres to 1NF, 2NF, and 3NF.
* **Stored Procedure (`GetItineraryDetails`):** Joins Itineraries, Itinerary_Stops, Landmarks, and Cities to return sequenced rows for the frontend timeline.
* **Trigger 1 (`PreventDuplicateLandmark`):** `BEFORE INSERT` on `Itinerary_Stops`.
* **Trigger 2 (`CheckCapacityConstraint`):** `BEFORE INSERT` on `Bookings`.

---

## 4. Technology Stack
* **Database:** MySQL 8.0+ (Relational modeling, SPs, Triggers).
* **Backend:** Node.js with Express.js (REST API layer).
* **Database Driver:** `mysql2` (Node.js package for async database queries).
* **Frontend:** React.js (Component-based UI) or standard HTML/CSS/Vanilla JS if you want to keep it simple.
* **Styling:** Tailwind CSS or Bootstrap (for quick, responsive design).

---

## 5. How to Build It (Step-by-Step Implementation Plan)

### Phase 1: Database Design & Setup (Days 1-2)
1. Install MySQL and MySQL Workbench.
2. Write the `schema.sql` file containing your `CREATE TABLE` statements.
3. Write your `ALTER TABLE` statements or include constraints (Foreign Keys).
4. Code and test the Stored Procedure (`GetItineraryDetails`).
5. Code and test the Triggers.
6. Write a `seed_data.sql` file to insert cities, landmarks, and multiple itineraries (for example, the sample destinations in `seed.sql`) to ensure queries work across destinations.

### Phase 2: Backend API Development (Days 3-4)
1. Initialize a Node.js project (`npm init -y`) and install `express`, `mysql2`, `cors`, and `dotenv`.
2. Create a database connection file (`db.js`).
3. Build the core REST API routes:
   * `GET /api/itineraries` (Fetches active itineraries).
   * `GET /api/itineraries/:id` (Calls your Stored Procedure).
   * `POST /api/bookings` (Handles user booking for an itinerary/mode, calculates `FinalPrice`, and attempts insertion to trigger the matching capacity rule).

### Phase 3: Frontend Development (Days 5-7)
1. Setup React (`npx create-react-app frontend` or use Vite).
2. **Component 1: Catalog:** Fetch `/api/itineraries` and display them as cards.
3. **Component 2: Itinerary Detail:** When a card is clicked, fetch `/api/itineraries/:id` and map the array of stops into a visual timeline (using a simple CSS border-left to look like a line).
4. **Component 3: Booking Form:** A simple form (Name, Email, Date) that sends a POST request to your backend. Handle the error gracefully if the database trigger rejects it due to capacity.

### Phase 4: Testing & Documentation (Days 8-9)
1. Test all edge cases (e.g., try booking when capacity is full, try viewing a soft-deleted landmark).
2. Generate an ER Diagram using MySQL Workbench's reverse engineer tool.
3. Finalize the README.md and project report.

---

## 6. Success Metrics (For Evaluation)
* Application successfully connects to MySQL and performs CRUD operations.
* Stored Procedure successfully aggregates data from 4 different tables.
* Triggers successfully block invalid inserts and throw correct SQL state errors.
* Frontend accurately displays database information in a user-friendly manner.