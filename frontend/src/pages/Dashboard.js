import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { todoAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [addingTodo, setAddingTodo] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    loadTodos();
    loadStats();
  }, []);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const response = await todoAPI.getAllTodos();
      setTodos(response.todos);
      setError('');
    } catch (error) {
      setError('Failed to load todos');
      console.error('Error loading todos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await todoAPI.getStats();
      setStats(response.statistics);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodoTitle.trim()) {
      setError('Please enter a todo title');
      return;
    }

    setAddingTodo(true);
    setError('');

    try {
      const response = await todoAPI.createTodo({ title: newTodoTitle.trim() });
      setTodos(prev => [response.todo, ...prev]);
      setNewTodoTitle('');
      loadStats(); // Refresh stats
    } catch (error) {
      setError('Failed to add todo');
      console.error('Error adding todo:', error);
    } finally {
      setAddingTodo(false);
    }
  };

  const handleToggleTodo = async (id, currentStatus) => {
    try {
      const response = await todoAPI.toggleTodo(id);
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, completed: response.todo.completed } : todo
        )
      );
      loadStats(); // Refresh stats
    } catch (error) {
      setError('Failed to update todo');
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    try {
      await todoAPI.deleteTodo(id);
      setTodos(prev => prev.filter(todo => todo.id !== id));
      loadStats(); // Refresh stats
    } catch (error) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', error);
    }
  };

  const handleEditStart = (todo) => {
    setEditingId(todo.id);
    setEditTitle(todo.title);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditSave = async (id) => {
    if (!editTitle.trim()) {
      setError('Todo title cannot be empty');
      return;
    }

    try {
      const response = await todoAPI.updateTodo(id, { title: editTitle.trim() });
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? response.todo : todo
        )
      );
      setEditingId(null);
      setEditTitle('');
      setError('');
    } catch (error) {
      setError('Failed to update todo');
      console.error('Error updating todo:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">Loading your todos...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        <Col lg={8} className="mx-auto">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-primary fw-bold">Welcome back, {user?.username}!</h2>
            <p className="text-muted">Manage your tasks and stay productive</p>
          </div>

          {/* Statistics */}
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center border-primary">
                <Card.Body>
                  <h3 className="text-primary">{stats.total}</h3>
                  <small className="text-muted">Total Tasks</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-success">
                <Card.Body>
                  <h3 className="text-success">{stats.completed}</h3>
                  <small className="text-muted">Completed</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center border-warning">
                <Card.Body>
                  <h3 className="text-warning">{stats.pending}</h3>
                  <small className="text-muted">Pending</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Add Todo Form */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <h5 className="card-title mb-3">Add New Todo</h5>
              <Form onSubmit={handleAddTodo}>
                <Row>
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder="What needs to be done?"
                      value={newTodoTitle}
                      onChange={(e) => setNewTodoTitle(e.target.value)}
                      disabled={addingTodo}
                    />
                  </Col>
                  <Col xs="auto">
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={addingTodo || !newTodoTitle.trim()}
                    >
                      {addingTodo ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Adding...
                        </>
                      ) : (
                        'Add Todo'
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Todo List */}
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Your Todos</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {todos.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <h5>No todos yet</h5>
                  <p>Add your first todo above to get started!</p>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {todos.map((todo) => (
                    <ListGroup.Item key={todo.id} className="d-flex align-items-center">
                      <Form.Check
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id, todo.completed)}
                        className="me-3"
                      />
                      
                      <div className="flex-grow-1">
                        {editingId === todo.id ? (
                          <Form.Control
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleEditSave(todo.id)}
                            autoFocus
                          />
                        ) : (
                          <div>
                            <div 
                              className={todo.completed ? 'text-decoration-line-through text-muted' : ''}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggleTodo(todo.id, todo.completed)}
                            >
                              {todo.title}
                            </div>
                            <small className="text-muted">
                              Created: {formatDate(todo.created_at)}
                              {todo.updated_at !== todo.created_at && (
                                <> • Updated: {formatDate(todo.updated_at)}</>
                              )}
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="ms-3">
                        {todo.completed && (
                          <Badge bg="success" className="me-2">Done</Badge>
                        )}
                        
                        {editingId === todo.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              className="me-2"
                              onClick={() => handleEditSave(todo.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              className="me-2"
                              onClick={() => handleEditStart(todo)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleDeleteTodo(todo.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;