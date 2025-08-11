-- PMC Seed Data
-- Sample data for testing the application

-- Insert a test user (for development)
INSERT INTO users (id, email, username, display_name) VALUES 
('00000000-0000-0000-0000-000000000001', 'test@example.com', 'testuser', 'Test User')
ON CONFLICT (email) DO NOTHING;

-- Insert sample media items
INSERT INTO media_items (title, creator, media_type, status, release_date, genre, description, user_id) VALUES 
-- Movies
('The Matrix', 'The Wachowskis', 'movie', 'owned', '1999', 'Sci-Fi', 'A computer programmer discovers reality is a simulation.', '00000000-0000-0000-0000-000000000001'),
('Inception', 'Christopher Nolan', 'movie', 'wishlist', '2010', 'Sci-Fi', 'A thief who enters dreams to steal secrets.', '00000000-0000-0000-0000-000000000001'),
('Parasite', 'Bong Joon-ho', 'movie', 'completed', '2019', 'Thriller', 'A poor family schemes to infiltrate a wealthy household.', '00000000-0000-0000-0000-000000000001'),

-- Music
('Dark Side of the Moon', 'Pink Floyd', 'music', 'owned', '1973', 'Progressive Rock', 'Iconic progressive rock album exploring themes of conflict and mental illness.', '00000000-0000-0000-0000-000000000001'),
('Blonde', 'Frank Ocean', 'music', 'owned', '2016', 'R&B', 'Critically acclaimed album blending R&B, pop, and experimental sounds.', '00000000-0000-0000-0000-000000000001'),
('Random Access Memories', 'Daft Punk', 'music', 'wishlist', '2013', 'Electronic', 'Electronic duo''s Grammy-winning album with disco influences.', '00000000-0000-0000-0000-000000000001'),

-- Games
('The Legend of Zelda: Breath of the Wild', 'Nintendo', 'game', 'completed', '2017', 'Action-Adventure', 'Open-world adventure game in the Zelda series.', '00000000-0000-0000-0000-000000000001'),
('Cyberpunk 2077', 'CD Projekt Red', 'game', 'owned', '2020', 'RPG', 'Futuristic role-playing game set in Night City.', '00000000-0000-0000-0000-000000000001'),
('Hades', 'Supergiant Games', 'game', 'currently_in_use', '2020', 'Roguelike', 'Action roguelike featuring Greek mythology.', '00000000-0000-0000-0000-000000000001'),

-- Books
('Dune', 'Frank Herbert', 'book', 'completed', '1965', 'Science Fiction', 'Epic science fiction novel about power, religion, and ecology.', '00000000-0000-0000-0000-000000000001'),
('The Name of the Wind', 'Patrick Rothfuss', 'book', 'owned', '2007', 'Fantasy', 'First book in The Kingkiller Chronicle series.', '00000000-0000-0000-0000-000000000001'),
('Sapiens', 'Yuval Noah Harari', 'book', 'wishlist', '2011', 'Non-fiction', 'A brief history of humankind.', '00000000-0000-0000-0000-000000000001'),

-- TV Shows
('Breaking Bad', 'Vince Gilligan', 'tv_show', 'completed', '2008', 'Crime Drama', 'A chemistry teacher turned methamphetamine manufacturer.', '00000000-0000-0000-0000-000000000001'),
('The Office', 'Greg Daniels', 'tv_show', 'owned', '2005', 'Comedy', 'Mockumentary sitcom about office workers.', '00000000-0000-0000-0000-000000000001'),
('Stranger Things', 'The Duffer Brothers', 'tv_show', 'currently_in_use', '2016', 'Sci-Fi Horror', 'Supernatural horror series set in the 1980s.', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert sample collections
INSERT INTO collections (name, description, user_id) VALUES 
('Sci-Fi Favorites', 'My favorite science fiction movies and books', '00000000-0000-0000-0000-000000000001'),
('Currently Playing', 'Games I am currently playing', '00000000-0000-0000-0000-000000000001'),
('Want to Watch', 'Movies and shows on my watchlist', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert sample tags
INSERT INTO tags (name, color, user_id) VALUES 
('Must Watch', '#FF6B6B', '00000000-0000-0000-0000-000000000001'),
('Classic', '#4ECDC4', '00000000-0000-0000-0000-000000000001'),
('Indie', '#45B7D1', '00000000-0000-0000-0000-000000000001'),
('Award Winner', '#FFA726', '00000000-0000-0000-0000-000000000001'),
('Nostalgic', '#AB47BC', '00000000-0000-0000-0000-000000000001')
ON CONFLICT (name, user_id) DO NOTHING; 