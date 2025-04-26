import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const OverdueBooks = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    bookType: '',
    search: '',
    daysOverdue: ''
  });

  useEffect(() => {
    const fetchOverdueTransactions = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/transactions/overdue');
        
        // Filter out transactions with invalid data
        const validTransactions = response.data.filter(transaction => 
          transaction.book != null && transaction.membership != null && transaction.membership.user != null
        );
        
        setTransactions(validTransactions);
        setFilteredTransactions(validTransactions);
        setError('');
      } catch (err) {
        console.error('Error fetching overdue transactions:', err);
        setError('Failed to load overdue books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOverdueTransactions();
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
    
    if (filters.daysOverdue) {
      const daysOverdue = parseInt(filters.daysOverdue);
      result = result.filter(transaction => {
        const returnDate = new Date(transaction.returnDate);
        const today = new Date();
        const timeDiff = today - returnDate;
        const overdueDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        
        switch(daysOverdue) {
          case 1: // 1-7 days
            return overdueDays >= 1 && overdueDays <= 7;
          case 8: // 8-14 days
            return overdueDays >= 8 && overdueDays <= 14;
          case 15: // 15-30 days
            return overdueDays >= 15 && overdueDays <= 30;
          case 31: // 30+ days
            return overdueDays > 30;
          default:
            return true;
        }
      });
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
      daysOverdue: ''
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateDaysOverdue = (returnDate) => {
    const today = new Date();
    const end = new Date(returnDate);
    const timeDiff = today - end;
    const daysOverdue = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysOverdue > 0 ? daysOverdue : 0;
  };

  const calculateFine = (daysOverdue) => {
    // Fine calculation logic - ₹1 per day
    return daysOverdue * 1;
  };

  return (
    <Container>
      <h2 className="my-4">Overdue Books & Movies</h2>
      
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
                <Form.Label>Days Overdue</Form.Label>
                <Form.Select
                  name="daysOverdue"
                  value={filters.daysOverdue}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="1">1-7 Days</option>
                  <option value="8">8-14 Days</option>
                  <option value="15">15-30 Days</option>
                  <option value="31">More than 30 Days</option>
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
      
      {/* Summary Card */}
      {!loading && !error && filteredTransactions.length > 0 && (
        <Card className="mb-4 bg-light">
          <Card.Body>
            <Row>
              <Col md={4} className="text-center">
                <h4 className="mb-0">{filteredTransactions.length}</h4>
                <p className="text-muted">Total Overdue Items</p>
              </Col>
              <Col md={4} className="text-center">
                <h4 className="mb-0">
                  {filteredTransactions.reduce((acc, curr) => {
                    const daysOverdue = calculateDaysOverdue(curr.returnDate);
                    return acc + daysOverdue;
                  }, 0)}
                </h4>
                <p className="text-muted">Total Days Overdue</p>
              </Col>
              <Col md={4} className="text-center">
                <h4 className="mb-0 text-danger">
                  ₹{filteredTransactions.reduce((acc, curr) => {
                    const daysOverdue = calculateDaysOverdue(curr.returnDate);
                    return acc + calculateFine(daysOverdue);
                  }, 0).toFixed(2)}
                </h4>
                <p className="text-muted">Total Fine Amount</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {/* Transactions Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading overdue books and movies...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : filteredTransactions.length > 0 ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Overdue Items ({filteredTransactions.length})</h5>
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
                    <th>Days Overdue</th>
                    <th>Fine Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map(transaction => {
                    const daysOverdue = calculateDaysOverdue(transaction.returnDate);
                    const fine = calculateFine(daysOverdue);
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
                              daysOverdue > 30 ? 'danger' : 
                              daysOverdue > 14 ? 'warning' : 'secondary'
                            }
                          >
                            {daysOverdue} days
                          </Badge>
                        </td>
                        <td className="text-danger">
                          ₹{fine.toFixed(2)}
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
            <h5 className="text-muted">No overdue books or movies found.</h5>
            <p>All items have been returned on time!</p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default OverdueBooks; 