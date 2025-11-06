-- Sample data for todo app
USE todo_app;

-- Sample users (passwords are hashed for 'password123')
INSERT INTO users (username, email, password_hash) VALUES
('john_doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeH0EO4vAx2.7LaIe'),
('jane_smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeH0EO4vAx2.7LaIe'),
('demo_user', 'demo@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeH0EO4vAx2.7LaIe');

-- Sample todos for the users
INSERT INTO todos (user_id, title, completed, created_at) VALUES
-- Todos for john_doe (user_id: 1)
(1, 'Learn React basics', TRUE, '2024-01-10 09:00:00'),
(1, 'Set up Node.js backend', TRUE, '2024-01-10 10:30:00'),
(1, 'Create MySQL database', FALSE, '2024-01-10 14:15:00'),
(1, 'Implement user authentication', FALSE, '2024-01-11 09:00:00'),
(1, 'Design responsive UI', FALSE, '2024-01-11 11:20:00'),

-- Todos for jane_smith (user_id: 2)
(2, 'Review project requirements', TRUE, '2024-01-09 08:30:00'),
(2, 'Write API documentation', FALSE, '2024-01-10 13:45:00'),
(2, 'Test user registration', FALSE, '2024-01-10 16:00:00'),
(2, 'Deploy to staging environment', FALSE, '2024-01-11 10:00:00'),

-- Todos for demo_user (user_id: 3)
(3, 'Welcome to Todo App!', FALSE, '2024-01-12 08:00:00'),
(3, 'Create your first todo', FALSE, '2024-01-12 08:01:00'),
(3, 'Mark todos as complete when done', FALSE, '2024-01-12 08:02:00'),
(3, 'Edit todos by clicking the edit button', FALSE, '2024-01-12 08:03:00'),
(3, 'Delete todos you no longer need', FALSE, '2024-01-12 08:04:00'),
(3, 'Stay organized and productive!', FALSE, '2024-01-12 08:05:00');

-- Update some todos to show recent activity
UPDATE todos 
SET updated_at = '2024-01-12 15:30:00' 
WHERE id IN (1, 2);

UPDATE todos 
SET completed = TRUE, updated_at = '2024-01-12 14:20:00' 
WHERE id = 6;