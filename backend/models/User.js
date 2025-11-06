const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(id, username, email, password_hash) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password_hash = password_hash;
  }

  // Create new user
  static async create(userData) {
    const { username, email, password } = userData;
    
    try {
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (username, email, password_hash) 
        VALUES (?, ?, ?)
      `;
      
      const [result] = await pool.execute(query, [username, email, password_hash]);
      
      return {
        id: result.insertId,
        username,
        email
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = ?';
      const [rows] = await pool.execute(query, [email]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(
        rows[0].id,
        rows[0].username,
        rows[0].email,
        rows[0].password_hash
      );
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const query = 'SELECT * FROM users WHERE username = ?';
      const [rows] = await pool.execute(query, [username]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(
        rows[0].id,
        rows[0].username,
        rows[0].email,
        rows[0].password_hash
      );
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM users WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new User(
        rows[0].id,
        rows[0].username,
        rows[0].email,
        rows[0].password_hash
      );
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Get user without password
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      email: this.email
    };
  }
}

module.exports = User;