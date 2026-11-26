require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = Number(process.env.PORT || 3001);
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'HeritageWalks',
  connectTimeout: 10000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
const databaseConnectionErrors = new Set([
  'ECONNREFUSED',
  'ECONNRESET',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'PROTOCOL_CONNECTION_LOST',
  'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
  'ER_CON_COUNT_ERROR',
  'ER_SERVER_SHUTDOWN',
]);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/cities/:cityName/landmarks', async (req, res, next) => {
  const cityName = typeof req.params.cityName === 'string' ? req.params.cityName.trim() : '';
  if (!cityName || cityName.length > 100) {
    return res.status(400).json({ error: 'A valid city name is required.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT Landmarks.LandmarkID,
              Landmarks.Name AS LandmarkName,
              Landmarks.Description AS LandmarkDescription,
              Cities.Name AS CityName,
              Cities.State
       FROM Cities
       JOIN Landmarks ON Landmarks.CityID = Cities.CityID
       WHERE Cities.Name = ?
         AND Cities.IsActive = TRUE
         AND Landmarks.IsActive = TRUE
       ORDER BY Landmarks.Name, Landmarks.LandmarkID`,
      [cityName]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No active landmarks were found for this city.' });
    }

    res.json(rows);
  } catch (error) {
    next(error);
  }
});

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

    const [cityRows] = await pool.execute(
      `SELECT Itinerary_Stops.ItineraryID, Cities.Name AS CityName, Cities.State,
              Cities.HistoricalSignificance, Landmarks.Name AS LandmarkName,
              Landmarks.Description AS LandmarkDescription
       FROM Itinerary_Stops
       JOIN Itineraries ON Itineraries.ItineraryID = Itinerary_Stops.ItineraryID
       JOIN Landmarks ON Landmarks.LandmarkID = Itinerary_Stops.LandmarkID
       JOIN Cities ON Cities.CityID = Landmarks.CityID
       WHERE Itineraries.IsActive = TRUE
         AND Itinerary_Stops.IsActive = TRUE
         AND Landmarks.IsActive = TRUE
         AND Cities.IsActive = TRUE
       ORDER BY Itinerary_Stops.ItineraryID, Itinerary_Stops.StopOrder`
    );
    const cityByItineraryId = new Map();
    for (const row of cityRows) {
      if (!cityByItineraryId.has(row.ItineraryID)) {
        cityByItineraryId.set(row.ItineraryID, {
          CityName: row.CityName,
          State: row.State,
          HistoricalSignificance: row.HistoricalSignificance,
          SearchTerms: [],
        });
      }
      const city = cityByItineraryId.get(row.ItineraryID);
      city.SearchTerms.push(row.LandmarkName, row.LandmarkDescription);
    }

    const itinerariesById = new Map();
    for (const row of rows) {
      let itinerary = itinerariesById.get(row.ItineraryID);
      if (!itinerary) {
        const city = cityByItineraryId.get(row.ItineraryID);
        itinerary = {
          ItineraryID: row.ItineraryID,
          Title: row.Title,
          BasePrice: row.BasePrice,
          DurationHours: row.DurationHours,
          CityName: city?.CityName || 'India',
          State: city?.State || '',
          HistoricalSignificance: city?.HistoricalSignificance || '',
          SearchText: city?.SearchTerms.join(' ') || '',
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

app.patch('/api/bookings/:id/payment', async (req, res, next) => {
  const bookingId = Number(req.params.id);
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const paymentMethod = typeof req.body?.paymentMethod === 'string'
    ? req.body.paymentMethod.trim()
    : '';

  if (!Number.isSafeInteger(bookingId) || bookingId < 1) {
    return res.status(400).json({ error: 'A valid booking ID is required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!paymentMethod) {
    return res.status(400).json({ error: 'Select a payment method.' });
  }

  try {
    const [result] = await pool.execute(
      `UPDATE Bookings
       SET PaymentStatus = 'Paid'
       WHERE BookingID = ? AND CustomerEmail = ? AND IsActive = TRUE`,
      [bookingId, email]
    );

    if (result.affectedRows !== 1) {
      return res.status(404).json({ error: 'Booking not found for this email address.' });
    }

    res.json({
      bookingId,
      paymentStatus: 'Paid',
      paymentMethod,
      message: 'Payment confirmed successfully.',
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, req, res, next) => {
  console.error(error);

  if (databaseConnectionErrors.has(error.code)) {
    return res.status(503).json({
      error: 'MySQL is temporarily unavailable. The API will reconnect automatically; please retry shortly.',
    });
  }
  if (error.code === 'ER_SIGNAL_EXCEPTION') {
    return res.status(409).json({ error: error.sqlMessage || error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must contain valid JSON.' });
  }

  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function waitForDatabase() {
  let retryDelay = 1000;
  while (true) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.ping();
      console.log(`Connected to MySQL database "${process.env.DB_NAME || 'HeritageWalks'}".`);
      return;
    } catch (error) {
      console.error(
        `MySQL connection failed (${error.code || error.message}); retrying in ${retryDelay / 1000}s.`,
      );
      await delay(retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    } finally {
      if (connection) connection.release();
    }
  }
}

function startServer() {
  const server = app.listen(port, () => {
    console.log(`HeritageTrails API listening on port ${port}`);
    void waitForDatabase();
  });
  server.on('error', (error) => {
    console.error(`Unable to start the HeritageTrails API on port ${port}.`, error);
    process.exitCode = 1;
  });
}

startServer();
