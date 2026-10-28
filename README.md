# HeritageTrails — Multi-City Heritage-Walk Tour Planner 🏛️🚶‍♂️

HeritageTrails is a database system designed to curate multi-stop cultural and historical walking itineraries across regional tourist destinations (e.g., heritage circuits near Mangaluru Junction). It efficiently manages landmarks, tour guides, audio resources, and custom visitor bookings to optimize the cultural tourism experience.

## 📌 Project Overview
A robust database system designed to curate multi-stop cultural and historical walking itineraries across regional tourist destinations (e.g., heritage circuits near Mangaluru Junction [MAJN]). The system efficiently manages landmarks, sequential tour stops, and custom visitor bookings to optimize the cultural tourism experience while maintaining strict data integrity.

This project was developed to demonstrate core Database Management System (DBMS) concepts, including Entity-Relationship mapping, strict normalization (1NF to 3NF), and the practical application of Stored Procedures and Triggers.

## ✨ Key Features
* **Dynamic Itinerary Management:** Curate structured walking tours by linking multiple cultural landmarks sequentially.
* **Concurrency & Capacity Control:** Prevents overbooking of itineraries through automated capacity constraints.
* **Historical Data Preservation:** Utilizes "Soft Deletes" (`IsActive` flags) to ensure that when a landmark closes or an itinerary is retired, past booking records remain intact.
* **Financial Integrity:** Locks in the `FinalPrice` at the time of booking to protect historical transaction records against future landmark entry fee fluctuations.

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

### Core Entities (5 Tables)
1. **Cities:** Regional hubs hosting cultural sites.
2. **Landmarks:** Specific heritage points of interest, linked to cities.
3. **Itineraries:** Curated walking tours featuring a base price, duration, and maximum capacity.
4. **Itinerary_Stops (Bridge Table):** Maps the many-to-many relationship between Itineraries and Landmarks, defining the sequential `StopOrder`.
5. **Bookings:** Tracks customer reservations, travel dates, payment statuses, and locked-in pricing.

## ⚙️ Advanced DBMS Components

### 1. Stored Procedure: `GetItineraryDetails`
A custom procedure that performs a multi-table join (`Itineraries`, `Itinerary_Stops`, `Landmarks`, `Cities`) to retrieve a fully sequenced timeline of a specific walking tour. This allows the frontend to easily render a vertical timeline UI for the user.

### 2. Triggers for Data Integrity
* **`PreventDuplicateLandmark`:** A `BEFORE INSERT` trigger on the `Itinerary_Stops` table that aborts the transaction if an admin attempts to add the exact same landmark twice to a single itinerary.
* **`CheckCapacityConstraint`:** A trigger on the `Bookings` table that verifies the `MaxCapacity` of an itinerary for a specific date before allowing a new booking to be inserted.

## 🚀 Setup & Installation (Local Development)

### 1. Set up the database

1. Open `schema.sql` in MySQL Workbench and execute it.
2. Open `seed.sql` and execute it after the schema succeeds. This loads four sample walks and their Mangaluru stops.

Both scripts can be run again: the schema recreates the procedure and triggers, while the seed refreshes the four sample routes and sample records. The seed clears and rebuilds stops only for demo itinerary IDs `1` through `4`.

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
| `GET` | `/api/itineraries` | List active itineraries |
| `GET` | `/api/itineraries/:id` | Get the active stop timeline from `GetItineraryDetails` |
| `GET` | `/api/bookings?email=...` | Find active bookings associated with an email address |
| `POST` | `/api/bookings` | Create a group booking and lock in the per-person price plus active landmark entry fees |

Example booking request:

```json
{
  "customerName": "Asha Rao",
  "customerEmail": "asha@example.com",
  "itineraryId": 1,
  "travelDate": "2026-11-15",
  "groupSize": 3
}
```

`GroupSize` stores the number of people in a booking. The capacity trigger adds group sizes for the itinerary and date before accepting another booking. `FinalPrice` is the per-person base price plus current active landmark entry fees, multiplied by the number of people. Successful bookings default to `Pending`; capacity errors are returned as HTTP `409 Conflict`.

Use **My bookings** in the header or footer to look up reservations by the email used while booking. The booking confirmation also links to the lookup page. This is a classroom demo without account sign-in or email verification, so anyone who knows an email address can look up bookings associated with it; add authentication or email verification before production use.

The frontend includes Home, Explore Walks, Walk Details, My bookings, and Our Story pages. Each detail page displays the full ordered stop timeline and a group booking form. The Vite development server proxies `/api` requests to the backend on port `3001`.

If you already created the database using an older version of `schema.sql`, run the updated `schema.sql` again. It adds `Bookings.GroupSize` to existing databases with a default of one person and recreates the capacity trigger.

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

The seed has itinerary `1` with capacity `20`. The following test runs in a transaction and does not permanently add test rows. Start the transaction and insert the temporary itinerary and its first booking, then run the second booking as a separate statement; it should fail because the capacity is `1`. Finish by rolling back the transaction.

```sql
START TRANSACTION;

INSERT INTO Itineraries (Title, BasePrice, DurationHours, MaxCapacity, IsActive)
VALUES ('Temporary capacity test', 100.00, 1, 1, TRUE);
SET @capacity_test_id = LAST_INSERT_ID();

INSERT INTO Bookings
    (CustomerName, CustomerEmail, ItineraryID, TravelDate, FinalPrice)
VALUES
    ('Test One', 'test-one@example.com', @capacity_test_id, '2030-01-01', 100.00);

-- Run separately; expect SQLSTATE 45000, then run ROLLBACK.
INSERT INTO Bookings
    (CustomerName, CustomerEmail, ItineraryID, TravelDate, FinalPrice)
VALUES
    ('Test Two', 'test-two@example.com', @capacity_test_id, '2030-01-01', 100.00);

ROLLBACK;
```

### API and frontend smoke test

With MySQL running and the API configured in `.env`, start the API and frontend in separate terminals. Verify `GET /api/itineraries`, open an itinerary to see stops in order, and submit a booking for a date whose capacity is not full. The app should show a booking confirmation. Submitting after filling the itinerary's capacity should show the database trigger message returned as HTTP `409 Conflict`.