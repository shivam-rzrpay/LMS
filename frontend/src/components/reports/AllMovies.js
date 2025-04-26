import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const AllMovies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    available: ''
  });

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('/api/books');
        // Filter only movies (not books)
        const moviesOnly = response.data.filter(item => item.type === 'Movie');
        setMovies(moviesOnly);
        setFilteredMovies(moviesOnly);
        setError('');
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMovies();
  }, []);

  useEffect(() => {
    // Apply filters whenever filters state changes
    let result = [...movies];
    
    if (filters.category) {
      result = result.filter(movie => 
        movie.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.status) {
      result = result.filter(movie => movie.status === filters.status);
    }
    
    if (filters.available === 'true') {
      result = result.filter(movie => movie.isAvailable);
    } else if (filters.available === 'false') {
      result = result.filter(movie => !movie.isAvailable);
    }
    
    setFilteredMovies(result);
  }, [filters, movies]);

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
  const categories = [...new Set(movies.map(movie => movie.category))];

  return (
    <Container>
      <h2 className="my-4">All Movies</h2>
      
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
      
      {/* Movies Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading movies...</p>
        </div>
      ) : filteredMovies.length > 0 ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Movies ({filteredMovies.length})</h5>
            </div>
            
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Title</th>
                    <th>Director</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Cost</th>
                    <th>Procurement Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map(movie => (
                    <tr key={movie._id}>
                      <td>{movie.serialNumber}</td>
                      <td>{movie.title}</td>
                      <td>{movie.author}</td> {/* Director is stored in author field */}
                      <td>{movie.category}</td>
                      <td>
                        <Badge 
                          bg={
                            movie.status === 'Available' ? 'success' : 
                            movie.status === 'Issued' ? 'primary' :
                            movie.status === 'Under Maintenance' ? 'warning' : 'danger'
                          }
                        >
                          {movie.status}
                        </Badge>
                      </td>
                      <td>${movie.cost.toFixed(2)}</td>
                      <td>{formatDate(movie.procurementDate)}</td>
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
            <h5 className="text-muted">No movies found matching your filters.</h5>
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

export default AllMovies; 