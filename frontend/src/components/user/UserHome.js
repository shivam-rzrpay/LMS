import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const UserHome = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeIssues: 0,
    overdueReturns: 0,
    totalFines: 0,
    memberships: [],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!user) return;

        // Fetch user's memberships
        const membershipsResponse = await axios.get(`/api/memberships/user/${user._id}`);
        const memberships = membershipsResponse.data;
        
        // Get membership IDs
        const membershipIds = memberships.map(m => m._id);
        
        // Fetch active transactions
        const activeResponse = await axios.get('/api/transactions/active');
        const activeTransactions = activeResponse.data;
        const userActiveTransactions = activeTransactions.filter(t => 
          membershipIds.includes(t.membership._id)
        );
        
        // Fetch overdue transactions
        const overdueResponse = await axios.get('/api/transactions/overdue');
        const overdueTransactions = overdueResponse.data;
        const userOverdueTransactions = overdueTransactions.filter(t => 
          membershipIds.includes(t.membership._id)
        );
        
        // Calculate total fines
        const totalFines = memberships.reduce((sum, membership) => 
          sum + membership.fineAmount, 0
        );
        
        setStats({
          activeIssues: userActiveTransactions.length,
          overdueReturns: userOverdueTransactions.length,
          totalFines,
          memberships,
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [user]);

  return (
    <Container>
      <h1 className="my-4">User Dashboard</h1>
      <h4 className="mb-4">Welcome, {user?.name}</h4>
      
      <Row>
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
            <Card.Body className={stats.overdueReturns > 0 ? 'text-danger' : ''}>
              <Card.Title>Overdue Returns</Card.Title>
              <h3>{stats.overdueReturns}</h3>
              <Link to="/reports/overdue" className="btn btn-outline-danger mt-2">
                View Overdue Books
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-4">
          <Card className="h-100 dashboard-stats">
            <Card.Body className={stats.totalFines > 0 ? 'text-danger' : ''}>
              <Card.Title>Total Fines</Card.Title>
              <h3>${stats.totalFines.toFixed(2)}</h3>
              {stats.totalFines > 0 && (
                <Link to="/pay-fine" className="btn btn-danger mt-2">
                  Pay Fine
                </Link>
              )}
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
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} className="mb-4">
          <Card className="dashboard-stats">
            <Card.Body>
              <Card.Title>My Memberships</Card.Title>
              {stats.memberships.length > 0 ? (
                <div className="list-group">
                  {stats.memberships.map(membership => (
                    <div key={membership._id} className="list-group-item">
                      <div className="d-flex w-100 justify-content-between">
                        <h6 className="mb-1">#{membership.membershipNumber}</h6>
                        <small className={`badge ${membership.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                          {membership.status}
                        </small>
                      </div>
                      <p className="mb-1">Type: {membership.membershipType}</p>
                      <small>
                        Expires: {new Date(membership.endDate).toLocaleDateString()}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No active memberships found.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default UserHome; 