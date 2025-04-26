import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const AllBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    available: ''
  });

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('/api/books');
        // Filter only books (not movies)
        const booksOnly = response.data.filter(item => item.type === 'Book');
        setBooks(booksOnly);
        setFilteredBooks(booksOnly);
        setError('');
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBooks();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters state changes
    let result = [...books];
    
    if (filters.category) {
      result = result.filter(book => 
        book.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.status) {
      result = result.filter(book => book.status === filters.status);
    }
    
    if (filters.available === 'true') {
      result = result.filter(book => book.isAvailable);
    } else if (filters.available === 'false') {
      result = result.filter(book => !book.isAvailable);
    }
    
    setFilteredBooks(result);
  }, [filters, books]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      status: '',
      available: ''
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(books.map(book => book.category))];

  return (
    <Container>
      <h2 className="my-4">All Books</h2>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Issued">Issued</option>
                  <option value="Under Maintenance">Under Maintenance</option>
                  <option value="Lost">Lost</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Availability</Form.Label>
                <Form.Select
                  name="available"
                  value={filters.available}
                  onChange={handleFilterChange}
                >
                  <option value="">All</option>
                  <option value="true">Available</option>
                  <option value="false">Not Available</option>
                </Form.Select>
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
      
      {/* Books Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading books...</p>
        </div>
      ) : filteredBooks.length > 0 ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Books ({filteredBooks.length})</h5>
            </div>
            
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Procurement Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map(book => (
                    <tr key={book._id}>
                      <td>{book.serialNumber}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.category}</td>
                      <td>
                        <Badge 
                          bg={
                            book.status === 'Available' ? 'success' : 
                            book.status === 'Issued' ? 'primary' :
                            book.status === 'Under Maintenance' ? 'warning' : 'danger'
                          }
                        >
                          {book.status}
                        </Badge>
                      </td>
                      <td>${book.cost.toFixed(2)}</td>
                      <td>{formatDate(book.procurementDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body className="text-center py-5">
            <h5 className="text-muted">No books found matching your filters.</h5>
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

export default AllBooks; 