USE HeritageWalks;

INSERT INTO Cities
    (CityID, Name, State, HistoricalSignificance)
VALUES
    (1, 'Mangaluru', 'Karnataka', 'A historic port city shaped by coastal trade, regional kingdoms, and diverse religious traditions.'),
    (2, 'Delhi', 'Delhi', 'India''s capital region, with layers of Sultanate, Mughal, and modern history.'),
    (3, 'Jaipur', 'Rajasthan', 'The planned Pink City, known for its royal palaces, observatories, and hill forts.'),
    (4, 'Agra', 'Uttar Pradesh', 'A historic Mughal city on the Yamuna River, home to major imperial monuments.'),
    (5, 'Varanasi', 'Uttar Pradesh', 'One of India''s oldest living cities, known for its riverfront ghats and sacred sites.'),
    (6, 'Mysuru', 'Karnataka', 'A former royal capital known for its palace, markets, and religious landmarks.'),
    (7, 'Hampi', 'Karnataka', 'The former Vijayanagara capital, known for its temples and monumental ruins.'),
    (8, 'Kochi', 'Kerala', 'A historic port city shaped by Indian Ocean trade and its Fort Kochi and Mattancherry heritage districts.')
ON DUPLICATE KEY UPDATE
    Name = VALUES(Name),
    State = VALUES(State),
    HistoricalSignificance = VALUES(HistoricalSignificance),
    IsActive = TRUE;

INSERT INTO Landmarks
    (LandmarkID, CityID, Name, Description, EntryFee)
VALUES
    (1, 1, 'Mangaluru Junction Railway Station', 'A major railway gateway to the city and a starting point for visitors exploring Mangaluru.', 0.00),
    (2, 1, 'St. Aloysius Chapel', 'A chapel known for its interior paintings and its place in the city''s educational and religious history.', 0.00),
    (3, 1, 'Sultan Battery', 'A coastal watchtower built during the rule of Tipu Sultan, overlooking the Gurupura River.', 50.00),
    (4, 1, 'Kudroli Gokarnath Temple', 'A prominent temple dedicated to Gokarnanatheshwara and an important centre of local festivals.', 0.00),
    (5, 1, 'Kadri Manjunath Temple', 'An ancient temple complex associated with Kadri hill and the region''s history of worship and sculpture.', 0.00),
    (6, 1, 'Mangaladevi Temple', 'A historic temple dedicated to Goddess Mangaladevi, whose name is associated with the origin of Mangaluru.', 0.00),
    (7, 1, 'Rosario Cathedral', 'A landmark Catholic church near the old port, reflecting Mangaluru''s long coastal connections.', 0.00),
    (8, 1, 'Old Mangaluru Port', 'A traditional harbour area that recalls the city''s historic role in coastal trade and fishing.', 0.00),
    (9, 2, 'Red Fort', 'A major Mughal-era fort complex and a landmark of Old Delhi.', 50.00),
    (10, 2, 'Jama Masjid', 'One of India''s largest mosques, built during the Mughal period in Old Delhi.', 0.00),
    (11, 2, 'Humayun''s Tomb', 'A garden tomb built for the Mughal emperor Humayun and a UNESCO World Heritage Site.', 40.00),
    (12, 2, 'Qutub Minar', 'A landmark minaret within a historic complex associated with the Delhi Sultanate.', 40.00),
    (13, 3, 'Hawa Mahal', 'Jaipur''s iconic palace facade, built with many small windows facing the city streets.', 50.00),
    (14, 3, 'City Palace Jaipur', 'A royal palace complex that reflects Jaipur''s history as a princely capital.', 300.00),
    (15, 3, 'Jantar Mantar Jaipur', 'An eighteenth-century astronomical observatory and UNESCO World Heritage Site.', 50.00),
    (16, 3, 'Amber Fort', 'A hilltop fort and palace complex overlooking Maota Lake near Jaipur.', 100.00),
    (17, 4, 'Taj Mahal', 'A white marble mausoleum commissioned by Mughal emperor Shah Jahan.', 50.00),
    (18, 4, 'Agra Fort', 'A walled Mughal fort and palace complex beside the Yamuna River.', 50.00),
    (19, 4, 'Itimad-ud-Daulah''s Tomb', 'A Mughal tomb often noted for its detailed marble inlay work.', 30.00),
    (20, 4, 'Mehtab Bagh', 'A garden across the Yamuna River with views toward the Taj Mahal.', 30.00),
    (21, 5, 'Kashi Vishwanath Temple', 'A prominent Hindu temple dedicated to Lord Shiva in the old city of Varanasi.', 0.00),
    (22, 5, 'Dashashwamedh Ghat', 'A well-known riverfront ghat on the Ganges in Varanasi.', 0.00),
    (23, 5, 'Dhamek Stupa', 'A large Buddhist monument at Sarnath associated with the Buddha''s first sermon.', 25.00),
    (24, 5, 'Sarnath Archaeological Museum', 'A museum displaying archaeological finds from the Sarnath area.', 25.00),
    (25, 6, 'Mysore Palace', 'The historic palace of the Wadiyar royal family and a major Mysuru landmark.', 100.00),
    (26, 6, 'Devaraja Market', 'A historic market known for its produce, flowers, spices, and everyday city life.', 0.00),
    (27, 6, 'St. Philomena''s Cathedral', 'A neo-Gothic cathedral and one of Mysuru''s best-known landmarks.', 0.00),
    (28, 6, 'Chamundeshwari Temple', 'A hilltop temple on Chamundi Hill overlooking Mysuru.', 0.00),
    (29, 7, 'Virupaksha Temple', 'A historic temple that remains an active place of worship in Hampi.', 0.00),
    (30, 7, 'Vijaya Vittala Temple', 'A celebrated temple complex known for its stone architecture and musical pillars.', 40.00),
    (31, 7, 'Hampi Bazaar', 'A historic street near Virupaksha Temple, lined with the remains of market buildings.', 0.00),
    (32, 7, 'Lotus Mahal', 'An ornate pavilion within the Zenana Enclosure at Hampi.', 40.00),
    (33, 3, 'Jaigarh Fort', 'A hill fort overlooking the Amber Fort complex and the surrounding landscape.', 100.00),
    (34, 3, 'Nahargarh Fort', 'A hilltop fort with views over Jaipur and the surrounding Aravalli hills.', 50.00),
    (35, 7, 'Elephant Stables', 'A monumental row of domed chambers built for royal elephants in Vijayanagara.', 40.00),
    (36, 8, 'Chinese Fishing Nets', 'Iconic shore-operated fishing nets along the Fort Kochi waterfront, reflecting the port city''s maritime history.', 0.00),
    (37, 8, 'Fort Kochi Beach', 'A public waterfront beside the historic Fort Kochi district.', 0.00),
    (38, 8, 'St. Francis Church', 'A historic church in Fort Kochi associated with the early Portuguese period.', 0.00),
    (39, 8, 'Santa Cruz Basilica', 'A prominent basilica in Fort Kochi known for its historic and religious significance.', 0.00),
    (40, 8, 'Mattancherry Palace', 'A palace museum with murals and exhibits on the former rulers of Kochi.', 20.00),
    (41, 8, 'Paradesi Synagogue', 'A historic synagogue in the Mattancherry Jewish quarter.', 10.00),
    (42, 8, 'Jain Temple, Mattancherry', 'A historic Jain temple in the Mattancherry area of Kochi.', 0.00),
    (43, 5, 'Manikarnika Ghat', 'A major Varanasi riverfront ghat with deep religious and cultural significance.', 0.00),
    (44, 5, 'Assi Ghat', 'A southern Ganges ghat known as a gathering place for residents, pilgrims, and visitors.', 0.00),
    (45, 5, 'Chaukhandi Stupa', 'An ancient Buddhist monument near the Sarnath archaeological site.', 25.00),
    (46, 2, 'Mehrauli Archaeological Park', 'A historic park with monuments from several periods of Delhi''s past, near the Qutub complex.', 0.00),
    (47, 2, 'Alai Darwaza', 'An ornate gateway built by Alauddin Khalji within the Qutub complex.', 0.00),
    (48, 6, 'Nandi Statue, Chamundi Hill', 'A large monolithic Nandi statue on the route up Chamundi Hill.', 0.00),
    (49, 7, 'Queen''s Bath', 'A monumental bathing pavilion associated with the royal centre of Vijayanagara.', 40.00),
    (50, 7, 'Mahanavami Dibba', 'A large ceremonial platform within Hampi''s Royal Enclosure.', 40.00),
    (51, 8, 'Dutch Cemetery, Fort Kochi', 'A historic cemetery in the Fort Kochi heritage district.', 0.00),
    (52, 8, 'Mattancherry Spice Market', 'A historic trading area associated with Kochi''s spice trade.', 0.00),
    (53, 4, 'Chini Ka Rauza', 'A Mughal tomb in Agra known for its glazed tile decoration.', 30.00)
ON DUPLICATE KEY UPDATE
    CityID = VALUES(CityID),
    Name = VALUES(Name),
    Description = VALUES(Description),
    EntryFee = VALUES(EntryFee),
    IsActive = TRUE;

INSERT INTO Itineraries
    (ItineraryID, Title, BasePrice, DurationHours)
VALUES
    (1, 'Mangaluru Heritage Highlights', 500.00, 6),
    (2, 'Temples of Mangaluru', 350.00, 3),
    (3, 'Port & Coastal Stories', 400.00, 3),
    (4, 'Sacred Art & Architecture', 450.00, 4),
    (5, 'Delhi Mughal Heritage', 750.00, 6),
    (6, 'Delhi Sultanate Trail', 600.00, 4),
    (7, 'Royal Jaipur', 800.00, 4),
    (8, 'Jaipur Hill Forts', 900.00, 5),
    (9, 'Mughal Agra', 900.00, 6),
    (10, 'Agra Riverfront & Mughal Tombs', 700.00, 5),
    (11, 'Varanasi Ghats and Temples', 600.00, 4),
    (12, 'Sarnath Buddhist Heritage', 750.00, 5),
    (13, 'Mysuru Palace & City Highlights', 700.00, 4),
    (14, 'Mysuru Sacred Landmarks', 500.00, 4),
    (15, 'Hampi Temples and Bazaar', 850.00, 5),
    (16, 'Hampi Royal Enclosure', 800.00, 5),
    (17, 'Fort Kochi Waterfront & Heritage', 500.00, 3),
    (18, 'Mattancherry Palace & Jewish Town', 600.00, 3)
ON DUPLICATE KEY UPDATE
    Title = VALUES(Title),
    BasePrice = VALUES(BasePrice),
    DurationHours = VALUES(DurationHours),
    IsActive = TRUE;

INSERT INTO Itinerary_Modes
    (ItineraryID, TourModeID, CapacityLimit)
VALUES
    (1, 1, 20), (1, 2, 8), (1, 3, 30),
    (2, 1, 16), (2, 2, 6), (2, 3, 24),
    (3, 1, 18), (3, 2, 7), (3, 3, 28),
    (4, 1, 16), (4, 2, 6), (4, 3, 24),
    (5, 1, 24), (5, 2, 8), (5, 3, 32),
    (6, 1, 18), (6, 2, 6), (6, 3, 24),
    (7, 1, 20), (7, 2, 7), (7, 3, 30),
    (8, 1, 16), (8, 2, 6), (8, 3, 24),
    (9, 1, 20), (9, 2, 8), (9, 3, 30),
    (10, 1, 16), (10, 2, 6), (10, 3, 24),
    (11, 1, 24), (11, 2, 8), (11, 3, 32),
    (12, 1, 18), (12, 2, 6), (12, 3, 24),
    (13, 1, 20), (13, 2, 7), (13, 3, 30),
    (14, 1, 18), (14, 2, 6), (14, 3, 24),
    (15, 1, 20), (15, 2, 8), (15, 3, 30),
    (16, 1, 16), (16, 2, 6), (16, 3, 24),
    (17, 1, 20), (17, 2, 8), (17, 3, 30),
    (18, 1, 18), (18, 2, 6), (18, 3, 24)
ON DUPLICATE KEY UPDATE
    CapacityLimit = VALUES(CapacityLimit),
    IsActive = TRUE;

DELETE FROM Itinerary_Stops
WHERE ItineraryID BETWEEN 1 AND 18;

INSERT INTO Itinerary_Stops
    (ItineraryID, LandmarkID, StopOrder)
VALUES
    (1, 1, 1), (1, 2, 2), (1, 3, 3), (1, 4, 4),
    (1, 5, 5), (1, 6, 6), (1, 7, 7), (1, 8, 8),
    (2, 6, 1), (2, 4, 2), (2, 5, 3),
    (3, 1, 1), (3, 8, 2), (3, 3, 3), (3, 7, 4),
    (4, 2, 1), (4, 7, 2), (4, 4, 3), (4, 5, 4),
    (5, 9, 1), (5, 10, 2), (5, 11, 3),
    (6, 12, 1), (6, 47, 2), (6, 46, 3),
    (7, 14, 1), (7, 13, 2), (7, 15, 3),
    (8, 16, 1), (8, 33, 2), (8, 34, 3),
    (9, 17, 1), (9, 18, 2), (9, 19, 3),
    (10, 20, 1), (10, 17, 2), (10, 53, 3), (10, 19, 4),
    (11, 44, 1), (11, 22, 2), (11, 21, 3), (11, 43, 4),
    (12, 45, 1), (12, 23, 2), (12, 24, 3),
    (13, 25, 1), (13, 26, 2), (13, 27, 3),
    (14, 27, 1), (14, 28, 2), (14, 48, 3),
    (15, 29, 1), (15, 31, 2), (15, 30, 3),
    (16, 32, 1), (16, 35, 2), (16, 49, 3), (16, 50, 4),
    (17, 36, 1), (17, 37, 2), (17, 38, 3), (17, 39, 4), (17, 51, 5),
    (18, 40, 1), (18, 41, 2), (18, 42, 3), (18, 52, 4);

INSERT INTO Bookings
    (BookingID, CustomerName, CustomerEmail, ItineraryID, TourModeID,
     TravelDate, FinalPrice, PaymentStatus)
VALUES
    (1, 'Likhitha', 'likhitha@example.com', 1, 1, '2026-11-15', 550.00, 'Completed'),
    (2, 'Shreya', 'shreya@example.com', 1, 1, '2026-11-15', 550.00, 'Completed')
ON DUPLICATE KEY UPDATE
    CustomerName = VALUES(CustomerName),
    CustomerEmail = VALUES(CustomerEmail),
    ItineraryID = VALUES(ItineraryID),
    TourModeID = VALUES(TourModeID),
    TravelDate = VALUES(TravelDate),
    FinalPrice = VALUES(FinalPrice),
    PaymentStatus = VALUES(PaymentStatus),
    IsActive = TRUE;
