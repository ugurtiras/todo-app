const express = require('express');
const Todo = require('../models/Todo');
const { authenticateToken } = require('../middleware/auth');
const { validate, createTodoSchema, updateTodoSchema, idParamSchema } = require('../utils/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all todos for logged in user
router.get('/', async (req, res, next) => {
  try {
    const todos = await Todo.findByUserId(req.user.id);
    
    res.json({
      todos: todos,
      count: todos.length
    });
  } catch (error) {
    next(error);
  }
});

// Get todo statistics for logged in user
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await Todo.getStats(req.user.id);
    
    res.json({
      statistics: stats
    });
  } catch (error) {
    next(error);
  }
});

// Get specific todo by ID
router.get('/:id', validate(idParamSchema, 'params'), async (req, res, next) => {
  try {
    const todo = await Todo.findById(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ 
        error: 'Todo not found' 
      });
    }

    // Check if todo belongs to logged in user
    if (todo.user_id !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied - this todo does not belong to you' 
      });
    }

    res.json({
      todo: todo
    });
  } catch (error) {
    next(error);
  }
});

// Create new todo
router.post('/', validate(createTodoSchema), async (req, res, next) => {
  try {
    const { title } = req.body;

    const newTodo = await Todo.create({
      user_id: req.user.id,
      title: title.trim()
    });

    res.status(201).json({
      message: 'Todo created successfully',
      todo: newTodo
    });
  } catch (error) {
    next(error);
  }
});

// Update existing todo
router.put('/:id', 
  validate(idParamSchema, 'params'),
  validate(updateTodoSchema), 
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = {};

      // Only include fields that are provided and valid
      if (req.body.title !== undefined) {
        updateData.title = req.body.title.trim();
      }
      
      if (req.body.completed !== undefined) {
        updateData.completed = req.body.completed;
      }

      const updatedTodo = await Todo.update(id, req.user.id, updateData);

      if (!updatedTodo) {
        return res.status(404).json({ 
          error: 'Todo not found or access denied' 
        });
      }

      res.json({
        message: 'Todo updated successfully',
        todo: updatedTodo
      });
    } catch (error) {
      next(error);
    }
  }
);

// Toggle todo completion status
router.patch('/:id/toggle', validate(idParamSchema, 'params'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // First get the current todo to check its completion status
    const currentTodo = await Todo.findById(id);
    
    if (!currentTodo) {
      return res.status(404).json({ 
        error: 'Todo not found' 
      });
    }

    // Check if todo belongs to logged in user
    if (currentTodo.user_id !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied - this todo does not belong to you' 
      });
    }

    // Toggle the completion status
    const updatedTodo = await Todo.update(id, req.user.id, {
      completed: !currentTodo.completed
    });

    res.json({
      message: 'Todo status toggled successfully',
      todo: updatedTodo
    });
  } catch (error) {
    next(error);
  }
});

// Delete todo
router.delete('/:id', validate(idParamSchema, 'params'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Todo.delete(id, req.user.id);

    if (!deleted) {
      return res.status(404).json({ 
        error: 'Todo not found or access denied' 
      });
    }

    res.json({
      message: 'Todo deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;