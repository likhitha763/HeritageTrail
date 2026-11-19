# HeritageTrails — Multi-City Heritage-Walk Tour Planner 🏛️🚶‍♂️

HeritageTrails is a database-backed planner for multi-stop cultural and historical tours. Visitors can choose walking, self-drive car, or tourist-bus options for the same heritage itinerary. Sample destinations include Mangaluru, Delhi, Jaipur, Agra, Varanasi, Mysuru, Hampi, and Kochi.

## 📌 Project Overview
The project manages cities, landmarks, sequential stops, transport modes, mode-specific capacities, and visitor bookings while maintaining database-level integrity.

This DBMS mini-project demonstrates relational modeling, normalization, stored procedures, triggers, foreign keys, and SQL queries through a practical tourism application.

## ✨ Key Features
* **Multi-mode itineraries:** Offer walking, self-drive car, and tourist-bus options for a route.
* **Multi-city discovery:** Browse eight Indian cities from destination cards, then filter or search tours by city and state.
* **Ordered stops:** Link itineraries to landmarks through a bridge table and display them in sequence.
* **Mode-specific capacity:** Count walking groups and bus seats as people; count self-drive capacity as vehicle slots.
* **Booking and price integrity:** Store the selected mode and lock in the final booking price.
* **Historical Data Preservation:** Utilizes "Soft Deletes" (`IsActive` flags) to ensure that when a landmark closes or an itinerary is retired, past booking records remain intact.

Transport options describe how visitors can explore the itinerary; the app does not rent cars, dispatch vehicles, or sell fuel/transport services. Self-drive visitors arrange their own cars. The bus option tracks passenger-seat capacity, but does not manage a bus operator or vehicle fleet. Visitors choose one mode for the whole itinerary. Combining modes between individual landmarks is not currently modeled.

## Route content and sample-price notes

The sample routes were reviewed against public tour listings to improve stop coverage and avoid squeezing long, multi-site visits into short durations. The listings below are references, not guaranteed current rates:

| Destination and source | Published duration and route | Published price and inclusions |
| --- | --- | --- |
| [Fort Kochi Walk — Five Senses Tours](https://5senseswalks.com/tour/fort-kochi-walking-tour/) | 3 hours; Chinese fishing nets, Santa Cruz Basilica, St. Francis Church, Dutch Cemetery, Fort Kochi Beach, and spice market | ₹2,500 per person for groups of 4+; guide, entrance charges, and coffee |
| [Varanasi Walking and Heritage Tour — The India Traveller review](https://theindiatraveller.com/varanasi-walking-and-heritage-tour/) | 3 hours; Manikarnika Ghat and the Kashi Vishwanath corridor, with additional nearby temple and market stops | From $13; the review describes a live guide, tea/coffee, and bottled water |

These are guided operator experiences and are not directly price-equivalent to this classroom app. Seed `BasePrice` values are illustrative per-person amounts; active landmark entry fees are added separately. The app does not include transport hire, fuel, or a dispatched operator, and sample prices are not live market quotes.

## 🛠️ Technology Stack
* **Database:** MySQL 
* **Backend:** Node.js with Express.js (RESTful API)
* **Frontend:** React.js / HTML & CSS
* **Tools:** MySQL Workbench, Postman (API Testing)

## Scenic imagery and effects

The site uses locally stored photographs from Wikimedia Commons, not generated images. Destination cards show a photo for each sample city; tours use their city's photo unless they already have a specific Mangaluru image. The resized previews are credited below:

| Local image | Source and author | License |
| --- | --- | --- |
| `frontend/public/images/mangaluru-city.jpg` | [Mangalore City.jpg](https://commons.wikimedia.org/wiki/File:Mangalore_City.jpg), Byawarsi | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `frontend/public/images/sultan-battery.jpg` | [Sultan Battery, Mangaluru 3.jpg](https://commons.wikimedia.org/wiki/File:Sultan_Battery,_Mangaluru_3.jpg), Athulvis | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/mangaladevi-temple.jpg` | [Mangaladevi Temple Mangalore 4.jpg](https://commons.wikimedia.org/wiki/File:Mangaladevi_Temple_Mangalore_4.jpg), Vinay Bhat | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/st-aloysius-church.jpg` | [St. Aloysius Church Mangalore.jpg](https://commons.wikimedia.org/wiki/File:St._Aloysius_Church_Mangalore.jpg), Haydn Blackey | [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/) |
| `frontend/public/images/mangalore-coast.jpg` | [Parasailing over the sea at Mangalore beach - India.jpg](https://commons.wikimedia.org/wiki/File:Parasailing_over_the_sea_at_Mangalore_beach_-_India.jpg), Ksheera Piraati | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) |
| `frontend/public/images/agra-taj-mahal.jpg` | [Taj Mahal, Agra, India edit2.jpg](https://commons.wikimedia.org/wiki/File:Taj_Mahal,_Agra,_India_edit2.jpg), Yann Forget; edited by King of Hearts | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/delhi-red-fort.jpg` | [Red Fort in Delhi 03-2016 img3.jpg](https://commons.wikimedia.org/wiki/File:Red_Fort_in_Delhi_03-2016_img3.jpg), A.Savin (attribution: “A.Savin, Wikipedia”) | [Free Art License](https://artlibre.org/licence/lal/en/) |
| `frontend/public/images/hampi-virupaksha.jpg` | [Hampi - Hemakuta Hill, Virupaksha Temple.jpg](https://commons.wikimedia.org/wiki/File:Hampi_-_Hemakuta_Hill,_Virupaksha_Temple.jpg), Ingo Mehling | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/jaipur-hawa-mahal.jpg` | [East facade Hawa Mahal Jaipur from ground level (July 2022) - img 01.jpg](https://commons.wikimedia.org/wiki/File:East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg), Chainwit. | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/mysuru-palace.jpg` | [Mysuru Palace - East Side.jpg](https://commons.wikimedia.org/wiki/File:Mysuru_Palace_-_East_Side.jpg), Ingo Mehling | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `frontend/public/images/varanasi-ghats.jpg` | [Varanasi 2010 ghats3.jpg](https://commons.wikimedia.org/wiki/File:Varanasi_2010_ghats3.jpg), Marcin Białek | [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) |
| `frontend/public/images/kochi-fishing-nets.jpg` | [Chinese Fishing Nets - 2.jpg](https://commons.wikimedia.org/wiki/File:Chinese_Fishing_Nets_-_2.jpg), Ingo Mehling | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

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

## ⚙️ Database Components

### 1. Stored Procedure: `GetItineraryDetails`
A procedure that joins a route to its stops, landmarks, and city, then returns the stops in visit order.

### 2. Triggers for Data Integrity
* **`PreventDuplicateLandmark`:** A `BEFORE INSERT` trigger on the `Itinerary_Stops` table that aborts the transaction if an admin attempts to add the exact same landmark twice to a single itinerary.
* **`CheckCapacityConstraint`:** A trigger on the `Bookings` table that checks the selected itinerary/mode capacity for a travel date. It counts people for walking and bus options, and vehicle slots for self-drive car options.

For a beginner-friendly explanation of the SQL and the full database-to-website flow, see [SQL_COMMANDS_EXPLAINED.txt](./SQL_COMMANDS_EXPLAINED.txt).

## 🚀 Setup & Installation (Local Development)

### 1. Set up the database

1. Use a new, empty `HeritageWalks` database. `schema.sql` creates the tables and database rules; it is not an upgrade script. If that database already has tables, choose another name and use it in both SQL files and the `DB_NAME` value in `.env`.
2. Open `schema.sql` in MySQL Workbench and execute it.
3. After it succeeds, open `seed.sql` and execute it. This loads eight cities, eighteen itineraries, 53 landmarks, ordered stops, travel options, and sample bookings.

Run `schema.sql` only once on an empty database. `seed.sql` can be run again to refresh the sample records; it owns city IDs `1`-`8`, landmark IDs `1`-`53`, itinerary IDs `1`-`18`, sample booking IDs `1` and `2`, and the stops for itineraries `1`-`18`. It deletes and rebuilds stops only for those sample itinerary IDs. Avoid using those IDs for custom records.

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
| `GET` | `/api/itineraries` | List active itineraries, their destination, offered modes, and per-mode capacities |
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

The frontend includes Home, Explore Tours, Tour Details, My bookings, and Travel guide pages. Each detail page displays the full ordered stop timeline and lets visitors choose a supported travel mode before booking. The Vite development server proxies `/api` requests to the backend on port `3001`.

## Manual verification

Run these checks in MySQL Workbench after executing `schema.sql` and `seed.sql`.

### Check the sample data

```sql
USE HeritageWalks;
SELECT ItineraryID, Title, BasePrice FROM Itineraries;
CALL GetItineraryDetails(1);
SELECT CustomerName, TravelDate, FinalPrice FROM Bookings;
```

The first query should return eighteen routes. `CALL` should return the ordered stops for route 1. The last query should show the two sample bookings.

### API and frontend smoke test

With MySQL running and the API configured in `.env`, start both services from the project root with `npm run dev`. Open the Vite URL printed in the terminal, browse tours, open one to see its ordered stops, and submit a booking. The app should show a confirmation. The database capacity trigger rejects a booking when the selected option is full.
