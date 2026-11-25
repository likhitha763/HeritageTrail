CREATE DATABASE IF NOT EXISTS HeritageWalks;

USE HeritageWalks;

CREATE TABLE Cities (
    CityID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    State VARCHAR(100) NOT NULL,
    HistoricalSignificance TEXT,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE Landmarks (
    LandmarkID INT PRIMARY KEY AUTO_INCREMENT,
    CityID INT NOT NULL,
    Name VARCHAR(150) NOT NULL,
    Description TEXT,
    EntryFee DECIMAL(10, 2) DEFAULT 0.00,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (CityID) REFERENCES Cities(CityID)
);

CREATE TABLE Itineraries (
    ItineraryID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(150) NOT NULL,
    BasePrice DECIMAL(10, 2) NOT NULL,
    DurationHours INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE Itinerary_Stops (
    StopID INT PRIMARY KEY AUTO_INCREMENT,
    ItineraryID INT NOT NULL,
    LandmarkID INT NOT NULL,
    StopOrder INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (ItineraryID) REFERENCES Itineraries(ItineraryID),
    FOREIGN KEY (LandmarkID) REFERENCES Landmarks(LandmarkID)
);

CREATE TABLE TourModes (
    TourModeID INT PRIMARY KEY AUTO_INCREMENT,
    ModeCode VARCHAR(30) NOT NULL UNIQUE,
    ModeName VARCHAR(80) NOT NULL,
    CapacityUnit ENUM('PEOPLE', 'VEHICLES') NOT NULL,
    Description VARCHAR(255) NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE Itinerary_Modes (
    ItineraryID INT NOT NULL,
    TourModeID INT NOT NULL,
    CapacityLimit INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (ItineraryID, TourModeID),
    FOREIGN KEY (ItineraryID) REFERENCES Itineraries(ItineraryID),
    FOREIGN KEY (TourModeID) REFERENCES TourModes(TourModeID)
);

CREATE TABLE Bookings (
    BookingID INT PRIMARY KEY AUTO_INCREMENT,
    CustomerName VARCHAR(100) NOT NULL,
    CustomerEmail VARCHAR(100) NOT NULL,
    ItineraryID INT NOT NULL,
    TourModeID INT NOT NULL,
    TravelDate DATE NOT NULL,
    GroupSize INT NOT NULL DEFAULT 1,
    VehicleCount INT NOT NULL DEFAULT 0,
    BookingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FinalPrice DECIMAL(10, 2) NOT NULL,
    PaymentStatus VARCHAR(50) DEFAULT 'Pending',
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (ItineraryID, TourModeID)
        REFERENCES Itinerary_Modes(ItineraryID, TourModeID)
);

INSERT INTO TourModes
    (TourModeID, ModeCode, ModeName, CapacityUnit, Description)
VALUES
    (1, 'WALK', 'Walking', 'PEOPLE', 'Guided walking route; capacity is measured in people.'),
    (2, 'SELF_DRIVE', 'Self-drive car', 'VEHICLES', 'Visitors arrange their own cars; capacity is measured in vehicle slots.'),
    (3, 'TOURIST_BUS', 'Tourist bus', 'PEOPLE', 'Bus-based sightseeing option; capacity is measured in passenger seats.');

DELIMITER //

CREATE PROCEDURE GetItineraryDetails(IN p_ItineraryID INT)
BEGIN
    SELECT
        Itineraries.Title AS ItineraryName,
        Itineraries.DurationHours,
        Itinerary_Stops.StopOrder,
        Landmarks.LandmarkID,
        Landmarks.Name AS LandmarkName,
        Landmarks.Description AS LandmarkDescription,
        Cities.Name AS CityName,
        Landmarks.EntryFee
    FROM Itineraries
    JOIN Itinerary_Stops
        ON Itineraries.ItineraryID = Itinerary_Stops.ItineraryID
    JOIN Landmarks
        ON Itinerary_Stops.LandmarkID = Landmarks.LandmarkID
    JOIN Cities
        ON Landmarks.CityID = Cities.CityID
    WHERE Itineraries.ItineraryID = p_ItineraryID
      AND Itineraries.IsActive = TRUE
      AND Itinerary_Stops.IsActive = TRUE
      AND Landmarks.IsActive = TRUE
      AND Cities.IsActive = TRUE
    ORDER BY Itinerary_Stops.StopOrder;
END //

CREATE TRIGGER PreventDuplicateLandmark
BEFORE INSERT ON Itinerary_Stops
FOR EACH ROW
BEGIN
    DECLARE duplicate_count INT;

    SELECT COUNT(*)
    INTO duplicate_count
    FROM Itinerary_Stops
    WHERE ItineraryID = NEW.ItineraryID
      AND LandmarkID = NEW.LandmarkID;

    IF duplicate_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This landmark is already included in the selected itinerary.';
    END IF;
END //

CREATE TRIGGER CheckCapacityConstraint
BEFORE INSERT ON Bookings
FOR EACH ROW
BEGIN
    DECLARE capacity_limit INT;
    DECLARE capacity_unit VARCHAR(20);
    DECLARE current_usage INT DEFAULT 0;
    DECLARE new_usage INT;

    IF NEW.GroupSize < 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A booking must include at least one person.';
    END IF;

    SELECT Itinerary_Modes.CapacityLimit, TourModes.CapacityUnit
    INTO capacity_limit, capacity_unit
    FROM Itinerary_Modes
    JOIN Itineraries
        ON Itineraries.ItineraryID = Itinerary_Modes.ItineraryID
    JOIN TourModes
        ON TourModes.TourModeID = Itinerary_Modes.TourModeID
    WHERE Itinerary_Modes.ItineraryID = NEW.ItineraryID
      AND Itinerary_Modes.TourModeID = NEW.TourModeID
      AND Itinerary_Modes.IsActive = TRUE
      AND Itineraries.IsActive = TRUE
      AND TourModes.IsActive = TRUE;

    IF capacity_limit IS NULL OR capacity_unit IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The selected tour option is not available.';
    END IF;

    IF capacity_unit = 'VEHICLES' THEN
        IF NEW.VehicleCount < 1 OR NEW.VehicleCount > NEW.GroupSize THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Enter a valid number of cars for your group.';
        END IF;

        SET new_usage = NEW.VehicleCount;
        SELECT COALESCE(SUM(VehicleCount), 0)
        INTO current_usage
        FROM Bookings
        WHERE ItineraryID = NEW.ItineraryID
          AND TourModeID = NEW.TourModeID
          AND TravelDate = NEW.TravelDate
          AND IsActive = TRUE;
    ELSE
        IF NEW.VehicleCount <> 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Vehicle count is only used for self-drive car tours.';
        END IF;

        SET new_usage = NEW.GroupSize;
        SELECT COALESCE(SUM(GroupSize), 0)
        INTO current_usage
        FROM Bookings
        WHERE ItineraryID = NEW.ItineraryID
          AND TourModeID = NEW.TourModeID
          AND TravelDate = NEW.TravelDate
          AND IsActive = TRUE;
    END IF;

    IF current_usage + new_usage > capacity_limit THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The selected tour option has reached capacity for this date.';
    END IF;
END //

DELIMITER ;
