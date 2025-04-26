import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const AllMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [filteredMemberships, setFilteredMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    membershipType: '',
    search: ''
  });

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/memberships');
        
        // Filter out memberships with invalid user data
        const validMemberships = response.data.filter(membership => membership.user != null);
        
        setMemberships(validMemberships);
        setFilteredMemberships(validMemberships);
        setError('');
      } catch (err) {
        console.error('Error fetching memberships:', err);
        setError('Failed to load memberships. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMemberships();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters state changes
    let result = [...memberships];
    
    if (filters.status) {
      result = result.filter(membership => membership.status === filters.status);
    }
    
    if (filters.membershipType) {
      result = result.filter(membership => membership.membershipType === filters.membershipType);
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(membership => {
        // Safely access user properties
        const userName = membership.user?.name || '';
        const userEmail = membership.user?.email || '';
        const userUsername = membership.user?.username || '';
        
        return (
          membership.membershipNumber.toLowerCase().includes(searchTerm) ||
          userName.toLowerCase().includes(searchTerm) ||
          userEmail.toLowerCase().includes(searchTerm) ||
          userUsername.toLowerCase().includes(searchTerm)
        );
      });
    }
    
    setFilteredMemberships(result);
  }, [filters, memberships]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      membershipType: '',
      search: ''
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDaysLeft = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const timeDiff = end - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  return (
    <Container>
      <h2 className="my-4">All Memberships</h2>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Membership Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Membership Type</Form.Label>
                <Form.Select
                  name="membershipType"
                  value={filters.membershipType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by member name, email..."
                />
              </Form.Group>
            </Col>
            
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="secondary" 
                onClick={clearFilters}
                className="mb-3"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {/* Memberships Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading memberships...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredMemberships.length > 0 ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Memberships ({filteredMemberships.length})</h5>
            </div>
            
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Membership Number</th>
                    <th>Member Name</th>
                    <th>Member Email</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days Left</th>
                    <th>Fine Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMemberships.map(membership => {
                    const daysLeft = calculateDaysLeft(membership.endDate);
                    return (
                      <tr key={membership._id}>
                        <td>{membership.membershipNumber}</td>
                        <td>{membership.user?.name || 'Unknown'}</td>
                        <td>{membership.user?.email || 'Unknown'}</td>
                        <td>
                          <Badge bg={membership.membershipType === 'Premium' ? 'info' : 'secondary'}>
                            {membership.membershipType}
                          </Badge>
                        </td>
                        <td>
                          <Badge 
                            bg={
                              membership.status === 'Active' ? 'success' : 
                              membership.status === 'Inactive' ? 'warning' : 'danger'
                            }
                          >
                            {membership.status}
                          </Badge>
                        </td>
                        <td>{formatDate(membership.startDate)}</td>
                        <td>{formatDate(membership.endDate)}</td>
                        <td>
                          <Badge bg={daysLeft > 30 ? 'success' : daysLeft > 0 ? 'warning' : 'danger'}>
                            {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                          </Badge>
                        </td>
                        <td>
                          {membership.fineAmount > 0 ? (
                            <span className="text-danger">₹{membership.fineAmount.toFixed(2)}</span>
                          ) : (
                            <span className="text-success">₹0.00</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <h5 className="text-muted">No memberships found matching your filters.</h5>
            <Button 
              variant="primary" 
              onClick={clearFilters}
              className="mt-3"
            >
              Clear Filters
            </Button>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AllMemberships; 