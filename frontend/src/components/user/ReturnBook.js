import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const ReturnBook = () => {
  const { user } = useAuth();
  const [activeTransactions, setActiveTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnLoading, setReturnLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchActiveTransactions = async () => {
      if (!user) return;
      
      try {
        const response = await axios.get('/api/transactions/active');
        setActiveTransactions(response.data);
        setError('');
      } catch (err) {
        console.error('Error fetching active transactions:', err);
        setError('Failed to load active transactions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveTransactions();
  }, [user]);

  const handleReturn = async (transactionId) => {
    setReturnLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await axios.post('/api/transactions/return', {
        transactionId
      });
      
      // Remove the returned book from the active transactions list
      setActiveTransactions(activeTransactions.filter(t => t._id !== transactionId));
      
      // Display success message
      setSuccess('Book returned successfully!');
      toast.success('Book returned successfully!');
      
      // Show fine info if applicable
      if (response.data.fine > 0) {
        setSelectedTransaction(response.data);
      } else {
        setSelectedTransaction(null);
      }
    } catch (err) {
      console.error('Error returning book:', err);
      setError(err.response?.data?.message || 'Failed to return book. Please try again.');
    } finally {
      setReturnLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isOverdue = (date) => {
    return new Date(date) < new Date();
  };

  return (
    <Container>
      <h2 className="my-4">Return Book</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {selectedTransaction && (
        <Card className="mb-4 border-warning">
          <Card.Body>
            <Card.Title className="text-warning">Fine Information</Card.Title>
            <Row>
              <Col md={6}>
                <p><strong>Book Title:</strong> {selectedTransaction.book.title}</p>
                <p><strong>Serial Number:</strong> {selectedTransaction.book.serialNumber}</p>
                <p><strong>Issue Date:</strong> {formatDate(selectedTransaction.issueDate)}</p>
                <p><strong>Return Date:</strong> {formatDate(selectedTransaction.returnDate)}</p>
              </Col>
              <Col md={6}>
                <p><strong>Actual Return Date:</strong> {formatDate(selectedTransaction.actualReturnDate)}</p>
                <p className="text-danger">
                  <strong>Fine Amount:</strong> ${selectedTransaction.fine.toFixed(2)}
                </p>
                <p><strong>Fine Paid:</strong> {selectedTransaction.finePaid ? 'Yes' : 'No'}</p>
                {!selectedTransaction.finePaid && selectedTransaction.fine > 0 && (
                  <Button 
                    variant="warning" 
                    href="/pay-fine"
                    className="mt-2"
                  >
                    Pay Fine
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading active transactions...</p>
        </div>
      ) : activeTransactions.length > 0 ? (
        <Card>
          <Card.Body>
            <h5 className="mb-4">Your Active Transactions</h5>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Serial Number</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTransactions.map(transaction => (
                    <tr key={transaction._id}>
                      <td>{transaction.book.title}</td>
                      <td>{transaction.book.serialNumber}</td>
                      <td>{formatDate(transaction.issueDate)}</td>
                      <td>
                        {formatDate(transaction.returnDate)}
                        {isOverdue(transaction.returnDate) && (
                          <Badge bg="danger" className="ms-2">Overdue</Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg="primary">{transaction.status}</Badge>
                      </td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleReturn(transaction._id)}
                          disabled={returnLoading}
                        >
                          {returnLoading ? 'Processing...' : 'Return'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info">
          You don't have any active book transactions.
        </Alert>
      )}
    </Container>
  );
};

export default ReturnBook; 