-- Create database
CREATE DATABASE IF NOT EXISTS todo_app;
USE todo_app;

-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Create todos table
CREATE TABLE todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_completed (completed),
    INDEX idx_created_at (created_at)
);

-- Optional: Create a view for user todo statistics
CREATE VIEW user_todo_stats AS
SELECT 
    u.id as user_id,
    u.username,
    u.email,
    COUNT(t.id) as total_todos,
    SUM(CASE WHEN t.completed = TRUE THEN 1 ELSE 0 END) as completed_todos,
    SUM(CASE WHEN t.completed = FALSE THEN 1 ELSE 0 END) as pending_todos,
    u.created_at as user_created_at
FROM users u
LEFT JOIN todos t ON u.id = t.user_id
GROUP BY u.id, u.username, u.email, u.created_at;