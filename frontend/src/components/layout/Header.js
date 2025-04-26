import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Library Management System</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                {user.role === 'admin' ? (
                  <>
                    <Nav.Link as={Link} to="/admin">Dashboard</Nav.Link>
                    <NavDropdown title="Maintenance" id="admin-maintenance-dropdown">
                      <NavDropdown.Item as={Link} to="/admin/books">Books/Movies</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/memberships">Memberships</NavDropdown.Item>
                      <NavDropdown.Item as={Link} to="/admin/users">User Management</NavDropdown.Item>
                    </NavDropdown>
                  </>
                ) : (
                  <Nav.Link as={Link} to="/user">Dashboard</Nav.Link>
                )}
                
                <NavDropdown title="Transactions" id="transactions-dropdown">
                  <NavDropdown.Item as={Link} to="/book-availability">Book Availability</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/issue-book">Issue Book</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/return-book">Return Book</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/pay-fine">Pay Fine</NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown title="Reports" id="reports-dropdown">
                  <NavDropdown.Item as={Link} to="/reports/books">All Books</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/reports/movies">All Movies</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/reports/memberships">All Memberships</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/reports/active-issues">Active Issues</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/reports/overdue">Overdue Books</NavDropdown.Item>
                </NavDropdown>
                
                <NavDropdown title={user.name} id="user-dropdown">
                  <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 