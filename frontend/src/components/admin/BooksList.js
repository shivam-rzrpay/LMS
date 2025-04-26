import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const BooksList = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    title: '',
    author: '',
    category: '',
    type: '',
    status: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  // Apply filters when the filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, books]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/books');
      setBooks(response.data);
      setFilteredBooks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to load books. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...books];
    
    if (filters.title) {
      result = result.filter(book => 
        book.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    
    if (filters.author) {
      result = result.filter(book => 
        book.author.toLowerCase().includes(filters.author.toLowerCase())
      );
    }
    
    if (filters.category) {
      result = result.filter(book => 
        book.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.type) {
      result = result.filter(book => book.type === filters.type);
    }
    
    if (filters.status) {
      result = result.filter(book => book.status === filters.status);
    }
    
    setFilteredBooks(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      title: '',
      author: '',
      category: '',
      type: '',
      status: ''
    });
  };

  const handleShowDeleteModal = (book) => {
    setBookToDelete(book);
    setShowDeleteModal(true);
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await axios.delete(`/api/books/${bookToDelete._id}`);
      
      // Remove book from state
      setBooks(books.filter(b => b._id !== bookToDelete._id));
      setFilteredBooks(filteredBooks.filter(b => b._id !== bookToDelete._id));
      
      // Show success message
      toast.success('Book deleted successfully!');
      
      // Close modal
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting book:', err);
      toast.error(err.response?.data?.message || 'Failed to delete book');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(books.map(book => book.category))];

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Manage Books & Movies</h2>
        <Link to="/admin/books/add" className="btn btn-primary">
          Add New
        </Link>
      </div>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={filters.title}
                  onChange={handleFilterChange}
                  placeholder="Search by title"
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Author</Form.Label>
                <Form.Control
                  type="text"
                  name="author"
                  value={filters.author}
                  onChange={handleFilterChange}
                  placeholder="Search by author"
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
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
          </Row>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                >
                  <option value="">All Types</option>
                  <option value="Book">Book</option>
                  <option value="Movie">Movie</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
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
            
            <Col md={4} className="d-flex align-items-end">
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
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Books Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading books and movies...</p>
        </div>
      ) : filteredBooks.length > 0 ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Books & Movies ({filteredBooks.length})</h5>
            </div>
            
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Serial Number</th>
                    <th>Title</th>
                    <th>Author</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map(book => (
                    <tr key={book._id}>
                      <td>{book.serialNumber}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>
                        <Badge bg={book.type === 'Book' ? 'primary' : 'info'}>
                          {book.type}
                        </Badge>
                      </td>
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
                      <td>
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/admin/books/edit/${book._id}`} 
                            className="btn btn-sm btn-primary"
                          >
                            Edit
                          </Link>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleShowDeleteModal(book)}
                            disabled={book.status === 'Issued'}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
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
            <h5 className="text-muted">No books or movies found matching your filters.</h5>
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
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookToDelete && (
            <p>
              Are you sure you want to delete <strong>{bookToDelete.title}</strong>? 
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteBook}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BooksList; 