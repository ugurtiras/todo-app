import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AppNavbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand href="/" className="fw-bold">
           Todo App
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated() && (
              <Nav.Link href="/" className="text-light">
                My Todos
              </Nav.Link>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {isAuthenticated() ? (
              <>
                <Navbar.Text className="me-3">
                  Welcome, <strong>{user?.username}</strong>!
                </Navbar.Text>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline-light" 
                  size="sm" 
                  className="me-2"
                  onClick={handleLogin}
                >
                  Login
                </Button>
                <Button 
                  variant="light" 
                  size="sm"
                  onClick={handleRegister}
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;