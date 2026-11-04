CREATE DATABASE IF NOT EXISTS HeritageWalks;
USE HeritageWalks;

CREATE TABLE IF NOT EXISTS Cities (
    CityID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    State VARCHAR(100) NOT NULL,
    HistoricalSignificance TEXT,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Landmarks (
    LandmarkID INT PRIMARY KEY AUTO_INCREMENT,
    CityID INT,
    Name VARCHAR(150) NOT NULL,
    Description TEXT,
    EntryFee DECIMAL(10, 2) DEFAULT 0.00,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (CityID) REFERENCES Cities(CityID)
);

CREATE TABLE IF NOT EXISTS Itineraries (
    ItineraryID INT PRIMARY KEY AUTO_INCREMENT,
    Title VARCHAR(150) NOT NULL,
    BasePrice DECIMAL(10, 2) NOT NULL,
    DurationHours INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Itinerary_Stops (
    StopID INT PRIMARY KEY AUTO_INCREMENT,
    ItineraryID INT,
    LandmarkID INT,
    StopOrder INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (ItineraryID) REFERENCES Itineraries(ItineraryID),
    FOREIGN KEY (LandmarkID) REFERENCES Landmarks(LandmarkID)
);

CREATE TABLE IF NOT EXISTS TourModes (
    TourModeID INT PRIMARY KEY AUTO_INCREMENT,
    ModeCode VARCHAR(30) NOT NULL UNIQUE,
    ModeName VARCHAR(80) NOT NULL,
    CapacityUnit ENUM('PEOPLE', 'VEHICLES') NOT NULL,
    Description VARCHAR(255) NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS Itinerary_Modes (
    ItineraryID INT NOT NULL,
    TourModeID INT NOT NULL,
    CapacityLimit INT NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (ItineraryID, TourModeID),
    FOREIGN KEY (ItineraryID) REFERENCES Itineraries(ItineraryID),
    FOREIGN KEY (TourModeID) REFERENCES TourModes(TourModeID)
);

CREATE TABLE IF NOT EXISTS Bookings (
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
    FOREIGN KEY (ItineraryID) REFERENCES Itineraries(ItineraryID)
);

-- Add booking columns introduced after the original schema.
SET @group_size_column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Bookings'
      AND COLUMN_NAME = 'GroupSize'
);
SET @group_size_migration = IF(
    @group_size_column_exists = 0,
    'ALTER TABLE Bookings ADD COLUMN GroupSize INT NOT NULL DEFAULT 1 AFTER TravelDate',
    'SELECT 1'
);
PREPARE group_size_migration_statement FROM @group_size_migration;
EXECUTE group_size_migration_statement;
DEALLOCATE PREPARE group_size_migration_statement;

SET @vehicle_count_column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Bookings'
      AND COLUMN_NAME = 'VehicleCount'
);
SET @vehicle_count_migration = IF(
    @vehicle_count_column_exists = 0,
    'ALTER TABLE Bookings ADD COLUMN VehicleCount INT NOT NULL DEFAULT 0 AFTER GroupSize',
    'SELECT 1'
);
PREPARE vehicle_count_migration_statement FROM @vehicle_count_migration;
EXECUTE vehicle_count_migration_statement;
DEALLOCATE PREPARE vehicle_count_migration_statement;

SET @tour_mode_column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Bookings'
      AND COLUMN_NAME = 'TourModeID'
);
SET @tour_mode_migration = IF(
    @tour_mode_column_exists = 0,
    'ALTER TABLE Bookings ADD COLUMN TourModeID INT NULL AFTER ItineraryID',
    'SELECT 1'
);
PREPARE tour_mode_migration_statement FROM @tour_mode_migration;
EXECUTE tour_mode_migration_statement;
DEALLOCATE PREPARE tour_mode_migration_statement;

INSERT INTO TourModes (ModeCode, ModeName, CapacityUnit, Description, IsActive)
VALUES
    ('WALK', 'Walking', 'PEOPLE', 'Guided walking route; capacity is measured in people.', TRUE),
    ('SELF_DRIVE', 'Self-drive car', 'VEHICLES', 'Visitors arrange their own cars; capacity is measured in vehicle slots.', TRUE),
    ('TOURIST_BUS', 'Tourist bus', 'PEOPLE', 'Bus-based sightseeing option; capacity is measured in passenger seats.', TRUE)
ON DUPLICATE KEY UPDATE
    ModeName = VALUES(ModeName),
    CapacityUnit = VALUES(CapacityUnit),
    Description = VALUES(Description),
    IsActive = VALUES(IsActive);

-- Move the old itinerary-wide capacity into the walking-mode capacity before
-- removing the obsolete column from databases created with the earlier schema.
SET @legacy_capacity_column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Itineraries'
      AND COLUMN_NAME = 'MaxCapacity'
);
SET @legacy_capacity_migration = IF(
    @legacy_capacity_column_exists > 0,
    'INSERT INTO Itinerary_Modes (ItineraryID, TourModeID, CapacityLimit)
     SELECT i.ItineraryID, tm.TourModeID, i.MaxCapacity
     FROM Itineraries AS i
     JOIN TourModes AS tm ON tm.ModeCode = ''WALK''
     ON DUPLICATE KEY UPDATE CapacityLimit = VALUES(CapacityLimit)',
    'SELECT 1'
);
PREPARE legacy_capacity_migration_statement FROM @legacy_capacity_migration;
EXECUTE legacy_capacity_migration_statement;
DEALLOCATE PREPARE legacy_capacity_migration_statement;

-- Existing bookings are kept and assigned to their itinerary's walking option.
UPDATE Bookings AS b
JOIN TourModes AS tm ON tm.ModeCode = 'WALK'
JOIN Itinerary_Modes AS im
  ON im.ItineraryID = b.ItineraryID
 AND im.TourModeID = tm.TourModeID
SET b.TourModeID = tm.TourModeID
WHERE b.TourModeID IS NULL;

ALTER TABLE Bookings MODIFY TourModeID INT NOT NULL;
ALTER TABLE Bookings MODIFY ItineraryID INT NOT NULL;

SET @booking_mode_fk_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'Bookings'
      AND CONSTRAINT_NAME = 'fk_bookings_itinerary_mode'
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
);
SET @booking_mode_fk_migration = IF(
    @booking_mode_fk_exists = 0,
    'ALTER TABLE Bookings
     ADD CONSTRAINT fk_bookings_itinerary_mode
     FOREIGN KEY (ItineraryID, TourModeID)
     REFERENCES Itinerary_Modes (ItineraryID, TourModeID)',
    'SELECT 1'
);
PREPARE booking_mode_fk_migration_statement FROM @booking_mode_fk_migration;
EXECUTE booking_mode_fk_migration_statement;
DEALLOCATE PREPARE booking_mode_fk_migration_statement;

SET @legacy_capacity_drop = IF(
    @legacy_capacity_column_exists > 0,
    'ALTER TABLE Itineraries DROP COLUMN MaxCapacity',
    'SELECT 1'
);
PREPARE legacy_capacity_drop_statement FROM @legacy_capacity_drop;
EXECUTE legacy_capacity_drop_statement;
DEALLOCATE PREPARE legacy_capacity_drop_statement;

DELIMITER //

DROP PROCEDURE IF EXISTS GetItineraryDetails //
CREATE PROCEDURE GetItineraryDetails(IN p_ItineraryID INT)
BEGIN
    SELECT
        i.Title AS ItineraryName,
        i.DurationHours,
        ist.StopOrder,
        l.Name AS LandmarkName,
        l.Description AS LandmarkDescription,
        c.Name AS CityName,
        l.EntryFee
    FROM Itineraries AS i
    JOIN Itinerary_Stops AS ist ON i.ItineraryID = ist.ItineraryID
    JOIN Landmarks AS l ON ist.LandmarkID = l.LandmarkID
    JOIN Cities AS c ON l.CityID = c.CityID
    WHERE i.ItineraryID = p_ItineraryID
      AND i.IsActive = TRUE
      AND ist.IsActive = TRUE
      AND l.IsActive = TRUE
      AND c.IsActive = TRUE
    ORDER BY ist.StopOrder ASC;
END //

DROP TRIGGER IF EXISTS PreventDuplicateLandmark //
CREATE TRIGGER PreventDuplicateLandmark
BEFORE INSERT ON Itinerary_Stops
FOR EACH ROW
BEGIN
    DECLARE duplicate_count INT;

    SELECT COUNT(*) INTO duplicate_count
    FROM Itinerary_Stops
    WHERE ItineraryID = NEW.ItineraryID
      AND LandmarkID = NEW.LandmarkID;

    IF duplicate_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'This landmark is already included in the selected itinerary.';
    END IF;
END //

DROP TRIGGER IF EXISTS CheckCapacityConstraint //
CREATE TRIGGER CheckCapacityConstraint
BEFORE INSERT ON Bookings
FOR EACH ROW
BEGIN
    DECLARE v_capacity_limit INT DEFAULT NULL;
    DECLARE v_capacity_unit VARCHAR(20) DEFAULT NULL;
    DECLARE v_current_usage INT DEFAULT 0;
    DECLARE v_new_usage INT DEFAULT 0;

    IF NEW.GroupSize < 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'A booking must include at least one person.';
    END IF;

    SELECT im.CapacityLimit, tm.CapacityUnit
    INTO v_capacity_limit, v_capacity_unit
    FROM Itinerary_Modes AS im
    JOIN Itineraries AS i ON i.ItineraryID = im.ItineraryID
    JOIN TourModes AS tm ON tm.TourModeID = im.TourModeID
    WHERE im.ItineraryID = NEW.ItineraryID
      AND im.TourModeID = NEW.TourModeID
      AND im.IsActive = TRUE
      AND i.IsActive = TRUE
      AND tm.IsActive = TRUE;

    IF v_capacity_limit IS NULL OR v_capacity_unit IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The selected tour option is not available.';
    END IF;

    IF v_capacity_unit = 'VEHICLES' THEN
        IF NEW.VehicleCount < 1 OR NEW.VehicleCount > NEW.GroupSize THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Enter a valid number of cars for your group.';
        END IF;

        SET v_new_usage = NEW.VehicleCount;
        SELECT COALESCE(SUM(VehicleCount), 0) INTO v_current_usage
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

        SET v_new_usage = NEW.GroupSize;
        SELECT COALESCE(SUM(GroupSize), 0) INTO v_current_usage
        FROM Bookings
        WHERE ItineraryID = NEW.ItineraryID
          AND TourModeID = NEW.TourModeID
          AND TravelDate = NEW.TravelDate
          AND IsActive = TRUE;
    END IF;

    IF v_current_usage + v_new_usage > v_capacity_limit THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'The selected tour option has reached capacity for this date.';
    END IF;
END //

DELIMITER ;
