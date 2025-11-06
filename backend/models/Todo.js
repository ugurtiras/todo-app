const { pool } = require('../config/database');

class Todo {
  constructor(id, user_id, title, completed, created_at, updated_at) {
    this.id = id;
    this.user_id = user_id;
    this.title = title;
    this.completed = completed;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  // Create new todo
  static async create(todoData) {
    const { user_id, title } = todoData;
    
    try {
      const query = `
        INSERT INTO todos (user_id, title, completed, created_at, updated_at) 
        VALUES (?, ?, false, NOW(), NOW())
      `;
      
      const [result] = await pool.execute(query, [user_id, title]);
      
      return {
        id: result.insertId,
        user_id,
        title,
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all todos for a user
  static async findByUserId(user_id) {
    try {
      const query = `
        SELECT * FROM todos 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      `;
      const [rows] = await pool.execute(query, [user_id]);
      
      return rows.map(row => new Todo(
        row.id,
        row.user_id,
        row.title,
        row.completed,
        row.created_at,
        row.updated_at
      ));
    } catch (error) {
      throw error;
    }
  }

  // Find todo by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM todos WHERE id = ?';
      const [rows] = await pool.execute(query, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Todo(
        rows[0].id,
        rows[0].user_id,
        rows[0].title,
        rows[0].completed,
        rows[0].created_at,
        rows[0].updated_at
      );
    } catch (error) {
      throw error;
    }
  }

  // Update todo
  static async update(id, user_id, updateData) {
    try {
      const allowedFields = ['title', 'completed'];
      const updates = [];
      const values = [];

      // Build dynamic update query
      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      // Add updated_at
      updates.push('updated_at = NOW()');
      values.push(id, user_id);

      const query = `
        UPDATE todos 
        SET ${updates.join(', ')} 
        WHERE id = ? AND user_id = ?
      `;
      
      const [result] = await pool.execute(query, values);
      
      if (result.affectedRows === 0) {
        return null;
      }

      return await Todo.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete todo
  static async delete(id, user_id) {
    try {
      const query = 'DELETE FROM todos WHERE id = ? AND user_id = ?';
      const [result] = await pool.execute(query, [id, user_id]);
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get user's todo statistics
  static async getStats(user_id) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN completed = false THEN 1 ELSE 0 END) as pending
        FROM todos 
        WHERE user_id = ?
      `;
      const [rows] = await pool.execute(query, [user_id]);
      
      return {
        total: parseInt(rows[0].total),
        completed: parseInt(rows[0].completed),
        pending: parseInt(rows[0].pending)
      };
    } catch (error) {
      throw error;
    }
  }

  // Convert to JSON (remove sensitive data if needed)
  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      title: this.title,
      completed: this.completed,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Todo;