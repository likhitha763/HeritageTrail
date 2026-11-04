require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3001);
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'HeritageWalks',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/itineraries', async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT i.ItineraryID, i.Title, i.BasePrice, i.DurationHours,
              tm.TourModeID, tm.ModeCode, tm.ModeName, tm.CapacityUnit,
              im.CapacityLimit
       FROM Itineraries AS i
       JOIN Itinerary_Modes AS im ON im.ItineraryID = i.ItineraryID
       JOIN TourModes AS tm ON tm.TourModeID = im.TourModeID
       WHERE i.IsActive = TRUE AND im.IsActive = TRUE AND tm.IsActive = TRUE
       ORDER BY i.Title, tm.TourModeID`
    );

    const itinerariesById = new Map();
    for (const row of rows) {
      let itinerary = itinerariesById.get(row.ItineraryID);
      if (!itinerary) {
        itinerary = {
          ItineraryID: row.ItineraryID,
          Title: row.Title,
          BasePrice: row.BasePrice,
          DurationHours: row.DurationHours,
          Modes: [],
        };
        itinerariesById.set(row.ItineraryID, itinerary);
      }

      itinerary.Modes.push({
        TourModeID: row.TourModeID,
        ModeCode: row.ModeCode,
        ModeName: row.ModeName,
        CapacityUnit: row.CapacityUnit,
        CapacityLimit: row.CapacityLimit,
      });
    }

    res.json([...itinerariesById.values()]);
  } catch (error) {
    next(error);
  }
});

app.get('/api/itineraries/:id', async (req, res, next) => {
  const itineraryId = Number(req.params.id);
  if (!Number.isSafeInteger(itineraryId) || itineraryId < 1) {
    return res.status(400).json({ error: 'Itinerary ID must be a positive integer.' });
  }

  try {
    // This procedure returns one row per stop, ordered by StopOrder.
    const [resultSets] = await pool.query('CALL GetItineraryDetails(?)', [itineraryId]);
    const stops = resultSets[0] || [];

    if (stops.length === 0) {
      return res.status(404).json({ error: 'Active itinerary not found or it has no active stops.' });
    }

    res.json(stops);
  } catch (error) {
    next(error);
  }
});

app.get('/api/bookings', async (req, res, next) => {
  const email = typeof req.query.email === 'string' ? req.query.email.trim() : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required to find bookings.' });
  }

  try {
    const [bookings] = await pool.execute(
      `SELECT b.BookingID, i.Title AS ItineraryTitle, tm.ModeName AS TourMode,
              b.TravelDate, b.GroupSize, b.VehicleCount,
              b.FinalPrice, b.PaymentStatus, b.BookingDate
       FROM Bookings AS b
       JOIN Itineraries AS i ON i.ItineraryID = b.ItineraryID
       JOIN TourModes AS tm ON tm.TourModeID = b.TourModeID
       WHERE b.CustomerEmail = ? AND b.IsActive = TRUE
       ORDER BY b.TravelDate DESC, b.BookingDate DESC`,
      [email]
    );

    res.json(bookings);
  } catch (error) {
    next(error);
  }
});

app.post('/api/bookings', async (req, res, next) => {
  const {
    customerName,
    customerEmail,
    itineraryId,
    tourModeId,
    travelDate,
    groupSize,
    vehicleCount = 0,
  } = req.body || {};
  const parsedItineraryId = Number(itineraryId);
  const parsedTourModeId = Number(tourModeId);
  const parsedGroupSize = Number(groupSize);
  const parsedVehicleCount = Number(vehicleCount);

  if (typeof customerName !== 'string' || customerName.trim().length === 0) {
    return res.status(400).json({ error: 'Customer name is required.' });
  }
  if (
    typeof customerEmail !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
  ) {
    return res.status(400).json({ error: 'A valid customer email is required.' });
  }
  if (!Number.isSafeInteger(parsedItineraryId) || parsedItineraryId < 1) {
    return res.status(400).json({ error: 'Itinerary ID must be a positive integer.' });
  }
  if (!Number.isSafeInteger(parsedTourModeId) || parsedTourModeId < 1) {
    return res.status(400).json({ error: 'Select a valid travel option.' });
  }
  if (!Number.isSafeInteger(parsedGroupSize) || parsedGroupSize < 1) {
    return res.status(400).json({ error: 'Number of people must be a positive whole number.' });
  }
  if (!Number.isSafeInteger(parsedVehicleCount) || parsedVehicleCount < 0) {
    return res.status(400).json({ error: 'Number of vehicles must be a whole number of zero or more.' });
  }
  if (
    typeof travelDate !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(travelDate) ||
    Number.isNaN(Date.parse(`${travelDate}T00:00:00Z`)) ||
    new Date(`${travelDate}T00:00:00Z`).toISOString().slice(0, 10) !== travelDate
  ) {
    return res.status(400).json({ error: 'Travel date must be a valid date in YYYY-MM-DD format.' });
  }

  try {
    // Lock in the per-person price plus active stop fees for the whole group.
    const [priceRows] = await pool.execute(
      `SELECT i.BasePrice + COALESCE(SUM(
          CASE
            WHEN s.IsActive = TRUE AND l.IsActive = TRUE AND c.IsActive = TRUE
            THEN l.EntryFee
            ELSE 0
          END
        ), 0) AS FinalPrice,
        im.CapacityLimit,
        tm.CapacityUnit,
        tm.ModeName
       FROM Itineraries AS i
       JOIN Itinerary_Modes AS im
         ON im.ItineraryID = i.ItineraryID AND im.TourModeID = ? AND im.IsActive = TRUE
       JOIN TourModes AS tm
         ON tm.TourModeID = im.TourModeID AND tm.IsActive = TRUE
       LEFT JOIN Itinerary_Stops AS s ON s.ItineraryID = i.ItineraryID
       LEFT JOIN Landmarks AS l ON l.LandmarkID = s.LandmarkID
       LEFT JOIN Cities AS c ON c.CityID = l.CityID
       WHERE i.ItineraryID = ? AND i.IsActive = TRUE
       GROUP BY i.ItineraryID, i.BasePrice, im.CapacityLimit, tm.CapacityUnit, tm.ModeName`,
      [parsedTourModeId, parsedItineraryId]
    );

    if (priceRows.length === 0) {
      return res.status(404).json({ error: 'The selected tour option is not available.' });
    }

    const { CapacityLimit, CapacityUnit } = priceRows[0];
    if (CapacityUnit === 'VEHICLES') {
      if (parsedVehicleCount < 1 || parsedVehicleCount > parsedGroupSize) {
        return res.status(400).json({ error: 'Enter a valid number of cars for your group.' });
      }
      if (parsedVehicleCount > CapacityLimit) {
        return res.status(400).json({ error: 'Number of cars cannot exceed the available vehicle slots.' });
      }
    } else {
      if (parsedVehicleCount !== 0) {
        return res.status(400).json({ error: 'Vehicle count is only used for self-drive car tours.' });
      }
      if (parsedGroupSize > CapacityLimit) {
        return res.status(400).json({ error: 'Number of people cannot exceed this tour option capacity.' });
      }
    }

    const [insertResult] = await pool.execute(
      `INSERT INTO Bookings
         (CustomerName, CustomerEmail, ItineraryID, TourModeID, TravelDate,
          GroupSize, VehicleCount, FinalPrice)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerName.trim(),
        customerEmail.trim(),
        parsedItineraryId,
        parsedTourModeId,
        travelDate,
        parsedGroupSize,
        parsedVehicleCount,
        Number(priceRows[0].FinalPrice) * parsedGroupSize,
      ]
    );

    res.status(201).json({
      bookingId: insertResult.insertId,
      itineraryId: parsedItineraryId,
      tourModeId: parsedTourModeId,
      tourMode: priceRows[0].ModeName,
      travelDate,
      groupSize: parsedGroupSize,
      vehicleCount: parsedVehicleCount,
      finalPrice: Number(priceRows[0].FinalPrice) * parsedGroupSize,
      paymentStatus: 'Pending',
      message: 'Booking created successfully.',
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);

  if (error.code === 'ER_SIGNAL_EXCEPTION') {
    return res.status(409).json({ error: error.sqlMessage || error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

async function startServer() {
  const connection = await pool.getConnection();
  connection.release();

  app.listen(port, () => {
    console.log(`HeritageTrails API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Unable to start the API. Check the database configuration and connection.', error);
  process.exitCode = 1;
});
