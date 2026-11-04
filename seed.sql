USE HeritageWalks;

-- 1. Insert City Data
INSERT INTO Cities (CityID, Name, State, HistoricalSignificance, IsActive)
VALUES (
    1, 
    'Mangaluru', 
    'Karnataka', 
    'A historic port city shaped by coastal trade, regional kingdoms, and diverse religious traditions.', 
    TRUE
)
ON DUPLICATE KEY UPDATE
    Name = VALUES(Name),
    State = VALUES(State),
    HistoricalSignificance = VALUES(HistoricalSignificance),
    IsActive = VALUES(IsActive);

-- 2. Insert Landmark Data
INSERT INTO Landmarks (LandmarkID, CityID, Name, Description, EntryFee, IsActive)
VALUES
    (1, 1, 'Mangaluru Junction Railway Station', 'A major railway gateway to the city and a starting point for visitors exploring Mangaluru.', 0.00, TRUE),
    (2, 1, 'St. Aloysius Chapel', 'A chapel known for its interior paintings and its place in the city''s educational and religious history.', 0.00, TRUE),
    (3, 1, 'Sultan Battery', 'A coastal watchtower built during the rule of Tipu Sultan, overlooking the Gurupura River.', 50.00, TRUE), 
    (4, 1, 'Kudroli Gokarnath Temple', 'A prominent temple dedicated to Gokarnanatheshwara and an important centre of local festivals.', 0.00, TRUE),
    (5, 1, 'Kadri Manjunath Temple', 'An ancient temple complex associated with Kadri hill and the region''s history of worship and sculpture.', 0.00, TRUE),
    (6, 1, 'Mangaladevi Temple', 'A historic temple dedicated to Goddess Mangaladevi, whose name is associated with the origin of Mangaluru.', 0.00, TRUE),
    (7, 1, 'Rosario Cathedral', 'A landmark Catholic church near the old port, reflecting Mangaluru''s long coastal connections.', 0.00, TRUE),
    (8, 1, 'Old Mangaluru Port', 'A traditional harbour area that recalls the city''s historic role in coastal trade and fishing.', 0.00, TRUE)
ON DUPLICATE KEY UPDATE
    CityID = VALUES(CityID),
    Name = VALUES(Name),
    Description = VALUES(Description),
    EntryFee = VALUES(EntryFee),
    IsActive = VALUES(IsActive);

-- 3. Insert Itinerary Data
INSERT INTO Itineraries (ItineraryID, Title, BasePrice, DurationHours, IsActive)
VALUES
    (1, 'Mangaluru Heritage Highlights', 500.00, 4, TRUE),
    (2, 'Temples of Mangaluru', 350.00, 3, TRUE),
    (3, 'Port & Coastal Stories', 400.00, 3, TRUE),
    (4, 'Sacred Art & Architecture', 450.00, 4, TRUE)
ON DUPLICATE KEY UPDATE
    Title = VALUES(Title),
    BasePrice = VALUES(BasePrice),
    DurationHours = VALUES(DurationHours),
    IsActive = VALUES(IsActive);

-- Each route offers multiple travel options. Car capacity is vehicle slots;
-- walking and bus capacities are measured in people/seats.
INSERT INTO Itinerary_Modes (ItineraryID, TourModeID, CapacityLimit, IsActive)
SELECT options.ItineraryID, modes.TourModeID, options.CapacityLimit, TRUE
FROM (
    SELECT 1 AS ItineraryID, 'WALK' AS ModeCode, 20 AS CapacityLimit
    UNION ALL SELECT 1, 'SELF_DRIVE', 8
    UNION ALL SELECT 1, 'TOURIST_BUS', 30
    UNION ALL SELECT 2, 'WALK', 16
    UNION ALL SELECT 2, 'SELF_DRIVE', 6
    UNION ALL SELECT 2, 'TOURIST_BUS', 24
    UNION ALL SELECT 3, 'WALK', 18
    UNION ALL SELECT 3, 'SELF_DRIVE', 7
    UNION ALL SELECT 3, 'TOURIST_BUS', 28
    UNION ALL SELECT 4, 'WALK', 16
    UNION ALL SELECT 4, 'SELF_DRIVE', 6
    UNION ALL SELECT 4, 'TOURIST_BUS', 24
) AS options
JOIN TourModes AS modes ON modes.ModeCode = options.ModeCode
ON DUPLICATE KEY UPDATE
    CapacityLimit = VALUES(CapacityLimit),
    IsActive = TRUE;

-- Refresh only the demo routes so this seed can be safely run again.
DELETE FROM Itinerary_Stops WHERE ItineraryID IN (1, 2, 3, 4);

-- 4. Insert the sequential stops for each sample route.
INSERT INTO Itinerary_Stops (StopID, ItineraryID, LandmarkID, StopOrder, IsActive)
VALUES
    (1, 1, 1, 1, TRUE),
    (2, 1, 2, 2, TRUE),
    (3, 1, 3, 3, TRUE),
    (4, 1, 4, 4, TRUE),
    (5, 1, 5, 5, TRUE),
    (6, 1, 6, 6, TRUE),
    (7, 1, 7, 7, TRUE),
    (8, 1, 8, 8, TRUE),
    (9, 2, 6, 1, TRUE),
    (10, 2, 4, 2, TRUE),
    (11, 2, 5, 3, TRUE),
    (12, 3, 1, 1, TRUE),
    (13, 3, 8, 2, TRUE),
    (14, 3, 3, 3, TRUE),
    (15, 3, 7, 4, TRUE),
    (16, 4, 2, 1, TRUE),
    (17, 4, 7, 2, TRUE),
    (18, 4, 4, 3, TRUE),
    (19, 4, 5, 4, TRUE);

-- 5. Insert Sample Bookings (Added so you can test your database immediately)
SET @walking_mode_id = (
    SELECT TourModeID FROM TourModes WHERE ModeCode = 'WALK'
);

INSERT INTO Bookings (BookingID, CustomerName, CustomerEmail, ItineraryID, TourModeID, TravelDate, FinalPrice, PaymentStatus, IsActive)
VALUES
    (1, 'Likhitha', 'likhitha@example.com', 1, @walking_mode_id, '2026-11-15', 550.00, 'Completed', TRUE),
    (2, 'Shreya', 'shreya@example.com', 1, @walking_mode_id, '2026-11-15', 550.00, 'Completed', TRUE)
ON DUPLICATE KEY UPDATE
    CustomerName = VALUES(CustomerName),
    CustomerEmail = VALUES(CustomerEmail),
    ItineraryID = VALUES(ItineraryID),
    TourModeID = VALUES(TourModeID),
    TravelDate = VALUES(TravelDate),
    FinalPrice = VALUES(FinalPrice),
    PaymentStatus = VALUES(PaymentStatus),
    IsActive = VALUES(IsActive);