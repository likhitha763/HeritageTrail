# HeritageTrails — Multi-City Heritage Tour Planner

HeritageTrails is a database-backed planner for multi-stop cultural and historical tours. Visitors can choose walking, self-drive car, or tourist-bus options for the same heritage itinerary. Mangaluru is the current sample city, and the relational schema supports adding more cities.

## 📌 Project Overview
The project manages cities, landmarks, sequential stops, transport modes, mode-specific capacities, and visitor bookings while maintaining database-level integrity.

This DBMS mini-project demonstrates relational modeling, normalization, stored procedures, triggers, foreign keys, migrations, and SQL queries through a practical tourism application.

## ✨ Key Features
* **Multi-mode itineraries:** Offer walking, self-drive car, and tourist-bus options for a route.
* **Ordered stops:** Link itineraries to landmarks through a bridge table and display them in sequence.
* **Mode-specific capacity:** Count walking groups and bus seats as people; count self-drive capacity as vehicle slots.
* **Booking and price integrity:** Store the selected mode and lock in the final booking price.
* **Historical Data Preservation:** Utilizes "Soft Deletes" (`IsActive` flags) to ensure that when a landmark closes or an itinerary is retired, past booking records remain intact.

Transport options describe how visitors can explore the itinerary; the app does not rent cars, dispatch vehicles, or sell fuel/transport services. Self-drive visitors arrange their own cars. The bus option tracks passenger-seat capacity, but does not manage a bus operator or vehicle fleet. Visitors choose one mode for the whole itinerary. Combining modes between individual landmarks is not currently modeled.

## 🛠️ Technology Stack
* **Database:** MySQL 
* **Backend:** Node.js with Express.js (RESTful API)
* **Frontend:** React.js / HTML & CSS
* **Tools:** MySQL Workbench, Postman (API Testing)

## Scenic imagery and effects

The site uses locally stored photographs from Wikimedia Commons, not generated images. Each file retains its source credit and license:

| Local image | Source and author | License |
| --- | --- | --- |
| `frontend/public/images/mangaluru-city.jpg` | [Mangalore City.jpg](https://commons.wikimedia.org/wiki/File:Mangalore_City.jpg), Byawarsi | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `frontend/public/images/sultan-battery.jpg` | [Sultan Battery, Mangaluru 3.jpg](https://commons.wikimedia.org/wiki/File:Sultan_Battery,_Mangaluru_3.jpg), Athulvis | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/mangaladevi-temple.jpg` | [Mangaladevi Temple Mangalore 4.jpg](https://commons.wikimedia.org/wiki/File:Mangaladevi_Temple_Mangalore_4.jpg), Vinay Bhat | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/st-aloysius-church.jpg` | [St. Aloysius Church Mangalore.jpg](https://commons.wikimedia.org/wiki/File:St._Aloysius_Church_Mangalore.jpg), Haydn Blackey | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| `frontend/public/images/mangalore-coast.jpg` | [Parasailing over the sea at Mangalore beach - India.jpg](https://commons.wikimedia.org/wiki/File:Parasailing_over_the_sea_at_Mangalore_beach_-_India.jpg), Ksheera Piraati | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |

Itinerary cards use a pointer-following spotlight inspired by React Bits' [SpotlightCard](https://reactbits.dev/animations/spotlight-card). The local implementation has no additional runtime dependency and respects the operating system's reduced-motion preference. The hero also has a slow image drift, while cards reveal and zoom gently on hover.

## 🗄️ Database Architecture
The relational database is normalized up to the **Third Normal Form (3NF)** to eliminate data redundancy and ensure data integrity. 

### Core Entities (7 Tables)
1. **Cities:** Regional hubs hosting cultural sites.
2. **Landmarks:** Specific heritage points of interest, linked to cities.
3. **Itineraries:** Curated tours featuring a base price and duration.
4. **Itinerary_Stops (Bridge Table):** Maps the many-to-many relationship between Itineraries and Landmarks, defining the sequential `StopOrder`.
5. **TourModes:** Lookup table for walking, self-drive car, and tourist-bus options, including each mode's capacity unit.
6. **Itinerary_Modes (Bridge Table):** Associates routes with available modes and stores capacity for each route/mode combination.
7. **Bookings:** Tracks customer reservations, travel dates, selected tour modes, group/car counts, payment statuses, and locked-in prices.

## ⚙️ Advanced DBMS Components

### 1. Stored Procedure: `GetItineraryDetails`
A custom procedure that joins `Itineraries`, `Itinerary_Stops`, `Landmarks`, and `Cities` to retrieve a fully sequenced tour timeline.

### 2. Triggers for Data Integrity
* **`PreventDuplicateLandmark`:** A `BEFORE INSERT` trigger on the `Itinerary_Stops` table that aborts the transaction if an admin attempts to add the exact same landmark twice to a single itinerary.
* **`CheckCapacityConstraint`:** A trigger on the `Bookings` table that checks the selected itinerary/mode capacity for a travel date. It counts people for walking and bus options, and vehicle slots for self-drive car options.

## 🚀 Setup & Installation (Local Development)

### 1. Set up the database

1. Open `schema.sql` in MySQL Workbench and execute it.
2. Open `seed.sql` and execute it after the schema succeeds. This loads four sample tours, their Mangaluru stops, and walking/car/bus capacities.

Both scripts can be run again: the schema recreates the procedure and triggers, while the seed refreshes the four sample routes, mode capacities, and sample bookings. The seed clears and rebuilds stops only for demo itinerary IDs `1` through `4`.

### 2. Configure and start the application

Node.js 18 or newer is recommended.

1. From the project folder, install the backend dependencies:
   ```bash
   npm install
   ```
2. Install the frontend dependencies:
   ```powershell
   npm install --prefix frontend
   ```
3. If you have not already configured it, create your local environment file:
   ```bash
   Copy-Item .env.example .env
   ```
4. Edit `.env` with your MySQL host, username, and password. Do not commit this file.
5. Start both the API and frontend from this project folder in one terminal:
   ```bash
   npm run dev
   ```

The API listens on `http://localhost:3001` by default and Vite usually serves the site at `http://localhost:5173`. Both server logs appear in the same terminal; press `Ctrl+C` to stop them. Set `CLIENT_ORIGIN` in `.env` to the React app's origin if it differs from the default Vite URL.

### API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/itineraries` | List active itineraries, offered modes, and per-mode capacities |
| `GET` | `/api/itineraries/:id` | Get the active stop timeline from `GetItineraryDetails` |
| `GET` | `/api/bookings?email=...` | Find active bookings associated with an email address |
| `POST` | `/api/bookings` | Create a group booking and lock in the per-person price plus active landmark entry fees |

Example booking request:

Use the `TourModeID` from that itinerary's `Modes` array in the `GET /api/itineraries` response.

```json
{
  "customerName": "Asha Rao",
  "customerEmail": "asha@example.com",
  "itineraryId": 1,
  "tourModeId": 1,
  "travelDate": "2026-11-15",
  "groupSize": 3,
  "vehicleCount": 0
}
```

`tourModeId` must match one of the selected itinerary's mode IDs returned by `GET /api/itineraries`. `GroupSize` stores the number of people. For walking and bus options, capacity is counted in people/seats and `vehicleCount` must be zero. For self-drive cars, visitors arrange their own cars and provide a `vehicleCount`; capacity is counted in vehicle slots, and the number of cars cannot exceed the group size. The app does not manage car rental, bus operators, fuel, or vehicle dispatch. `FinalPrice` is the per-person base price plus active landmark entry fees, multiplied by group size. Successful bookings default to `Pending`; capacity errors are returned as HTTP `409 Conflict`.

Use **My bookings** in the header or footer to look up reservations by the email used while booking. The booking confirmation also links to the lookup page. This is a classroom demo without account sign-in or email verification, so anyone who knows an email address can look up bookings associated with it; add authentication or email verification before production use.

The frontend includes Home, Explore Tours, Tour Details, My bookings, and Project & DBMS pages. Each detail page displays the full ordered stop timeline and lets visitors choose a supported travel mode before booking. The Vite development server proxies `/api` requests to the backend on port `3001`.

If you already created the database using an older version of `schema.sql`, run the updated `schema.sql` again. It preserves existing data, migrates each itinerary's former `MaxCapacity` to its walking-mode capacity, assigns existing bookings to the walking mode, adds vehicle/mode booking fields, and removes the obsolete itinerary-wide capacity column. Then rerun `seed.sql` to add car and bus options and refresh the demo data.

## Manual verification

Run these checks in MySQL Workbench after executing `schema.sql` and `seed.sql`. Statements marked **expect an error** should be run individually so Workbench can show the trigger's SQLSTATE `45000` message.

### Stored procedure and soft deletes

```sql
USE HeritageWalks;
CALL GetItineraryDetails(1);
```

The returned rows should be ordered by `StopOrder`. To check soft deletion, temporarily deactivate one landmark and call the procedure again:

```sql
UPDATE Landmarks SET IsActive = FALSE WHERE LandmarkID = 3;
CALL GetItineraryDetails(1);
UPDATE Landmarks SET IsActive = TRUE WHERE LandmarkID = 3;
```

The second result should omit Sultan Battery; the last statement restores it.

### Duplicate landmark trigger

The seeded itinerary already contains landmark `1`. This insert should fail with the duplicate-landmark trigger message:

```sql
INSERT INTO Itinerary_Stops (ItineraryID, LandmarkID, StopOrder)
VALUES (1, 1, 6);
```

### Capacity trigger

The following test runs in a transaction and does not permanently add test rows. It creates a temporary itinerary with a walking capacity of one person, inserts its first booking, then attempts a second booking; the trigger should reject the second insert. Run the second booking as a separate statement and finish by rolling back.

```sql
START TRANSACTION;

INSERT INTO Itineraries (Title, BasePrice, DurationHours, IsActive)
VALUES ('Temporary capacity test', 100.00, 1, TRUE);
SET @capacity_test_id = LAST_INSERT_ID();
SET @walking_mode_id = (
    SELECT TourModeID FROM TourModes WHERE ModeCode = 'WALK'
);
INSERT INTO Itinerary_Modes (ItineraryID, TourModeID, CapacityLimit)
VALUES (@capacity_test_id, @walking_mode_id, 1);

INSERT INTO Bookings
    (CustomerName, CustomerEmail, ItineraryID, TourModeID, TravelDate,
     GroupSize, VehicleCount, FinalPrice)
VALUES
    ('Test One', 'test-one@example.com', @capacity_test_id, @walking_mode_id,
     '2030-01-01', 1, 0, 100.00);

-- Run separately; expect SQLSTATE 45000, then run ROLLBACK.
INSERT INTO Bookings
    (CustomerName, CustomerEmail, ItineraryID, TourModeID, TravelDate,
     GroupSize, VehicleCount, FinalPrice)
VALUES
    ('Test Two', 'test-two@example.com', @capacity_test_id, @walking_mode_id,
     '2030-01-01', 1, 0, 100.00);

ROLLBACK;
```

### API and frontend smoke test

With MySQL running and the API configured in `.env`, start both services from the project root in one terminal with `npm run dev`. Open the Vite URL printed in the terminal, verify `GET /api/itineraries`, open an itinerary to see stops in order, and submit a booking for a date whose capacity is not full. The app should show a booking confirmation. Submitting after filling the itinerary's capacity should show the database trigger message returned as HTTP `409 Conflict`.
