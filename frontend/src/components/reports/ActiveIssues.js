import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const ActiveIssues = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    bookType: '',
    search: '',
    daysLeft: ''
  });

  useEffect(() => {
    const fetchActiveIssues = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/transactions/active');
        
        // Filter out transactions with invalid data
        const validTransactions = response.data.filter(transaction => 
          transaction.book != null && transaction.membership != null && transaction.membership.user != null
        );
        
        setTransactions(validTransactions);
        setFilteredTransactions(validTransactions);
        setError('');
      } catch (err) {
        console.error('Error fetching active issues:', err);
        setError('Failed to load active issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveIssues();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters state changes
    let result = [...transactions];
    
    if (filters.bookType) {
      result = result.filter(transaction => 
        transaction.book?.type === filters.bookType
      );
    }
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(transaction => {
        // Safely access object properties
        const bookTitle = transaction.book?.title || '';
        const bookAuthor = transaction.book?.author || '';
        const bookSerial = transaction.book?.serialNumber || '';
        const userName = transaction.membership?.user?.name || '';
        const userEmail = transaction.membership?.user?.email || '';
        
        return (
          bookTitle.toLowerCase().includes(searchTerm) ||
          bookAuthor.toLowerCase().includes(searchTerm) ||
          bookSerial.toLowerCase().includes(searchTerm) ||
          userName.toLowerCase().includes(searchTerm) ||
          userEmail.toLowerCase().includes(searchTerm)
        );
      });
    }
    
    if (filters.daysLeft) {
      const today = new Date();
      switch (filters.daysLeft) {
        case 'overdue':
          result = result.filter(transaction => {
            const returnDate = new Date(transaction.returnDate);
            return returnDate < today;
          });
          break;
        case 'today':
          result = result.filter(transaction => {
            const returnDate = new Date(transaction.returnDate);
            return isSameDay(returnDate, today);
          });
          break;
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          result = result.filter(transaction => {
            const returnDate = new Date(transaction.returnDate);
            return isSameDay(returnDate, tomorrow);
          });
          break;
        case 'thisWeek':
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          result = result.filter(transaction => {
            const returnDate = new Date(transaction.returnDate);
            return returnDate > today && returnDate <= nextWeek;
          });
          break;
        default:
          break;
      }
    }
    
    setFilteredTransactions(result);
  }, [filters, transactions]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      bookType: '',
      search: '',
      daysLeft: ''
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const isSameDay = (date1, date2) => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const calculateDaysLeft = (returnDate) => {
    const today = new Date();
    const end = new Date(returnDate);
    const timeDiff = end - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  return (
    <Container>
      <h2 className="my-4">Active Issues</h2>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Item Type</Form.Label>
                <Form.Select
                  name="bookType"
                  value={filters.bookType}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Book">Books</option>
                  <option value="Movie">Movies</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Select
                  name="daysLeft"
                  value={filters.daysLeft}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Due Today</option>
                  <option value="tomorrow">Due Tomorrow</option>
                  <option value="thisWeek">Due This Week</option>
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
                  placeholder="Search by title, member..."
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
      
      {/* Transactions Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading active issues...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredTransactions.length > 0 ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Active Issues ({filteredTransactions.length})</h5>
            </div>
            
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Title</th>
                    <th>Member Name</th>
                    <th>Type</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Days Left</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => {
                    const daysLeft = calculateDaysLeft(transaction.returnDate);
                    return (
                      <tr key={transaction._id}>
                        <td>{transaction.book?.serialNumber || 'Unknown'}</td>
                        <td>{transaction.book?.title || 'Unknown'}</td>
                        <td>{transaction.membership?.user?.name || 'Unknown'}</td>
                        <td>
                          <Badge bg={(transaction.book?.type || '') === 'Book' ? 'primary' : 'info'}>
                            {transaction.book?.type || 'Unknown'}
                          </Badge>
                        </td>
                        <td>{formatDate(transaction.issueDate)}</td>
                        <td>{formatDate(transaction.returnDate)}</td>
                        <td>
                          <Badge 
                            bg={
                              daysLeft > 3 ? 'success' : 
                              daysLeft > 0 ? 'warning' : 'danger'
                            }
                          >
                            {daysLeft > 0 ? `${daysLeft} days` : 'Overdue'}
                          </Badge>
                        </td>
                        <td>
                          <Badge 
                            bg={
                              daysLeft > 0 ? 'success' : 'danger'
                            }
                          >
                            {daysLeft > 0 ? 'Active' : 'Overdue'}
                          </Badge>
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
            <h5 className="text-muted">No active issues found matching your filters.</h5>
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

export default ActiveIssues; 