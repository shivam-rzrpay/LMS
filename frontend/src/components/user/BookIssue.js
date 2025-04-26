import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const BookIssue = () => {
  const { user } = useAuth();
  const [serialNumber, setSerialNumber] = useState('');
  const [book, setBook] = useState(null);
  const [bookFound, setBookFound] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState('');
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)); // Default 2 weeks
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch user's memberships on component mount
  useEffect(() => {
    const fetchMemberships = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get(`/api/memberships/user/${user._id}`);
        // Filter only active memberships
        const activeMemberships = response.data.filter(m => m.status === 'Active');
        setMemberships(activeMemberships);
        
        // Set default selected membership if available
        if (activeMemberships.length > 0) {
          setSelectedMembership(activeMemberships[0]._id);
        }
      } catch (err) {
        console.error('Error fetching memberships:', err);
        setError('Failed to load your memberships. Please try again later.');
      }
    };
    
    fetchMemberships();
  }, [user]);

  const searchBook = async () => {
    if (!serialNumber) {
      setError('Please enter a serial number');
      return;
    }
    
    setSearchLoading(true);
    setBookFound(false);
    setBook(null);
    setError('');
    
    try {
      const response = await axios.get(`/api/books/check/${serialNumber}`);
      
      if (response.data && response.data.book) {
        setBook(response.data.book);
        setBookFound(true);
        
        if (!response.data.isAvailable) {
          setError('This book is currently not available for issue.');
        }
      }
    } catch (err) {
      console.error('Error searching for book:', err);
      if (err.response && err.response.status === 404) {
        setError('No book found with the provided serial number.');
      } else {
        setError('An error occurred while searching for the book.');
      }
    } finally {
      setSearchLoading(false);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    
    if (!book || !selectedMembership || !returnDate) {
      setError('Please select all required fields');
      return;
    }
    
    if (!book.isAvailable) {
      setError('This book is not available for issue');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/transactions/issue', {
        bookId: book._id,
        membershipId: selectedMembership,
        returnDate: returnDate
      });
      
      if (response.data) {
        setSuccess('Book issued successfully!');
        toast.success('Book issued successfully!');
        
        // Reset form
        setSerialNumber('');
        setBook(null);
        setBookFound(false);
        setReturnDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
      }
    } catch (err) {
      console.error('Error issuing book:', err);
      setError(err.response?.data?.message || 'Failed to issue book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2 className="my-4">Issue Book</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <h5>Step 1: Find Book</h5>
          <Row className="align-items-end">
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Book Serial Number</Form.Label>
                <Form.Control
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Enter book serial number"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Button 
                variant="primary" 
                onClick={searchBook}
                disabled={searchLoading || !serialNumber}
                className="mb-3 w-100"
              >
                {searchLoading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-2">Searching...</span>
                  </>
                ) : 'Search'}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {bookFound && book && (
        <Card className="mb-4">
          <Card.Body>
            <h5>Book Details</h5>
            <Row>
              <Col md={6}>
                <p><strong>Title:</strong> {book.title}</p>
                <p><strong>Author:</strong> {book.author}</p>
                <p><strong>Serial Number:</strong> {book.serialNumber}</p>
              </Col>
              <Col md={6}>
                <p><strong>Category:</strong> {book.category}</p>
                <p><strong>Type:</strong> {book.type}</p>
                <p><strong>Status:</strong> {book.isAvailable ? 'Available' : 'Not Available'}</p>
              </Col>
            </Row>
            
            {book.isAvailable && (
              <>
                <hr />
                <h5>Step 2: Issue Details</h5>
                <Form onSubmit={handleIssueBook}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Select Membership</Form.Label>
                        <Form.Select
                          value={selectedMembership}
                          onChange={(e) => setSelectedMembership(e.target.value)}
                          required
                          disabled={loading || memberships.length === 0}
                        >
                          {memberships.length === 0 ? (
                            <option value="">No active memberships found</option>
                          ) : (
                            memberships.map(membership => (
                              <option key={membership._id} value={membership._id}>
                                {membership.membershipNumber} ({membership.membershipType})
                              </option>
                            ))
                          )}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Return Date</Form.Label>
                        <DatePicker
                          selected={returnDate}
                          onChange={date => setReturnDate(date)}
                          minDate={new Date()}
                          dateFormat="MM/dd/yyyy"
                          className="form-control"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Button 
                    variant="success" 
                    type="submit" 
                    disabled={loading || !selectedMembership || memberships.length === 0}
                    className="mt-3"
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        <span className="ms-2">Processing...</span>
                      </>
                    ) : 'Issue Book'}
                  </Button>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>
      )}
      
      {!bookFound && !searchLoading && !success && (
        <Alert variant="info">
          Enter a book serial number and click Search to begin.
        </Alert>
      )}
    </Container>
  );
};

export default BookIssue; 