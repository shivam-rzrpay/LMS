import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';

const BookAvailability = () => {
  const [searchParams, setSearchParams] = useState({
    title: '',
    author: '',
    category: '',
    serialNumber: '',
    type: ''
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Build query string from search parameters
      const queryParams = new URLSearchParams();
      
      if (searchParams.title) queryParams.append('title', searchParams.title);
      if (searchParams.author) queryParams.append('author', searchParams.author);
      if (searchParams.category) queryParams.append('category', searchParams.category);
      if (searchParams.type) queryParams.append('type', searchParams.type);
      
      // If serial number is provided, search by serial number instead
      if (searchParams.serialNumber) {
        try {
          const response = await axios.get(`/api/books/check/${searchParams.serialNumber}`);
          if (response.data && response.data.book) {
            setSearchResults([response.data.book]);
          } else {
            setSearchResults([]);
          }
        } catch (err) {
          setSearchResults([]);
          if (err.response && err.response.status === 404) {
            setError('No book found with the provided serial number.');
          } else {
            setError('An error occurred while searching by serial number.');
          }
        }
      } else {
        // Search using the query parameters
        const response = await axios.get(`/api/books?${queryParams.toString()}`);
        setSearchResults(response.data);
        
        if (response.data.length === 0) {
          setError('No books found matching your search criteria.');
        }
      }
      
      setSearched(true);
    } catch (err) {
      console.error('Error searching for books:', err);
      setError('An error occurred while searching for books.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchParams({
      title: '',
      author: '',
      category: '',
      serialNumber: '',
      type: ''
    });
    setSearchResults([]);
    setError('');
    setSearched(false);
  };

  return (
    <Container>
      <h2 className="my-4">Book Availability</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Book Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={searchParams.title}
                    onChange={handleChange}
                    placeholder="Enter book title"
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Author</Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={searchParams.author}
                    onChange={handleChange}
                    placeholder="Enter author name"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={searchParams.category}
                    onChange={handleChange}
                    placeholder="Enter category"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Serial Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="serialNumber"
                    value={searchParams.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                  />
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={searchParams.type}
                    onChange={handleChange}
                  >
                    <option value="">All Types</option>
                    <option value="Book">Book</option>
                    <option value="Movie">Movie</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex">
              <Button 
                variant="primary" 
                type="submit" 
                className="me-2"
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={clearSearch}
                disabled={loading}
              >
                Clear
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {searched && searchResults.length > 0 ? (
        <>
          <h3>Search Results ({searchResults.length})</h3>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th>Serial Number</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map(book => (
                  <tr key={book._id}>
                    <td>{book.serialNumber}</td>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.category}</td>
                    <td>{book.type}</td>
                    <td>
                      {book.isAvailable ? (
                        <Badge bg="success">Available</Badge>
                      ) : (
                        <Badge bg="danger">Not Available</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : searched ? (
        <Alert variant="info">No books found matching your criteria.</Alert>
      ) : null}
    </Container>
  );
};

export default BookAvailability; 