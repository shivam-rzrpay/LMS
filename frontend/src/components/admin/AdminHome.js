import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMovies: 0,
    totalUsers: 0,
    totalMemberships: 0,
    activeIssues: 0,
    overdueReturns: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real implementation, you would fetch actual stats from the backend
        // For now, we'll just simulate some data
        
        // Books count
        const booksResponse = await axios.get('/api/books');
        const books = booksResponse.data;
        const booksCount = books.filter(book => book.type === 'Book').length;
        const moviesCount = books.filter(book => book.type === 'Movie').length;
        
        // Users count 
        const usersResponse = await axios.get('/api/users');
        const usersCount = usersResponse.data.length;
        
        // Memberships count
        const membershipsResponse = await axios.get('/api/memberships');
        const membershipsCount = membershipsResponse.data.length;
        
        // Active issues
        const activeResponse = await axios.get('/api/transactions/active');
        const activeCount = activeResponse.data.length;
        
        // Overdue returns
        const overdueResponse = await axios.get('/api/transactions/overdue');
        const overdueCount = overdueResponse.data.length;
        
        setStats({
          totalBooks: booksCount,
          totalMovies: moviesCount,
          totalUsers: usersCount,
          totalMemberships: membershipsCount,
          activeIssues: activeCount,
          overdueReturns: overdueCount
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchDashboardData();
  }, []);

  return (
    <Container>
      <h1 className="my-4">Admin Dashboard</h1>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 dashboard-stats">
            <Card.Body>
              <Card.Title>Books</Card.Title>
              <h3>{stats.totalBooks}</h3>
              <Link to="/admin/books" className="btn btn-outline-primary mt-2">
                Manage Books
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 dashboard-stats">
            <Card.Body>
              <Card.Title>Movies</Card.Title>
              <h3>{stats.totalMovies}</h3>
              <Link to="/admin/books" className="btn btn-outline-primary mt-2">
                Manage Movies
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 dashboard-stats">
            <Card.Body>
              <Card.Title>Users</Card.Title>
              <h3>{stats.totalUsers}</h3>
              <Link to="/admin/users" className="btn btn-outline-primary mt-2">
                Manage Users
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 dashboard-stats">
            <Card.Body>
              <Card.Title>Memberships</Card.Title>
              <h3>{stats.totalMemberships}</h3>
              <Link to="/admin/memberships" className="btn btn-outline-primary mt-2">
                Manage Memberships
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 dashboard-stats">
            <Card.Body>
              <Card.Title>Active Issues</Card.Title>
              <h3>{stats.activeIssues}</h3>
              <Link to="/reports/active-issues" className="btn btn-outline-primary mt-2">
                View Active Issues
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 dashboard-stats">
            <Card.Body>
              <Card.Title>Overdue Returns</Card.Title>
              <h3>{stats.overdueReturns}</h3>
              <Link to="/reports/overdue" className="btn btn-outline-primary mt-2">
                View Overdue Returns
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6} className="mb-4">
          <Card className="dashboard-stats">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2">
                <Link to="/book-availability" className="btn btn-primary">
                  Check Book Availability
                </Link>
                <Link to="/issue-book" className="btn btn-success">
                  Issue Book
                </Link>
                <Link to="/return-book" className="btn btn-warning">
                  Return Book
                </Link>
                <Link to="/pay-fine" className="btn btn-danger">
                  Pay Fine
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="dashboard-stats">
            <Card.Body>
              <Card.Title>Maintenance</Card.Title>
              <div className="d-grid gap-2">
                <Link to="/admin/books/add" className="btn btn-outline-primary">
                  Add New Book/Movie
                </Link>
                <Link to="/admin/memberships/add" className="btn btn-outline-success">
                  Add New Membership
                </Link>
                <Link to="/admin/users/add" className="btn btn-outline-info">
                  Add New User
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminHome; 