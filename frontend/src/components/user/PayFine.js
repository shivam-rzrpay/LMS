import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const PayFine = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [totalFines, setTotalFines] = useState(0);

  useEffect(() => {
    const fetchFineData = async () => {
      if (!user) return;
      
      try {
        // Fetch user's memberships
        const membershipsResponse = await axios.get(`/api/memberships/user/${user._id}`);
        const userMemberships = membershipsResponse.data;
        setMemberships(userMemberships);
        
        // Calculate total fines
        const total = userMemberships.reduce((sum, membership) => sum + membership.fineAmount, 0);
        setTotalFines(total);
        
        // Fetch transactions with unpaid fines
        const transactionsResponse = await axios.get('/api/transactions');
        const membershipIds = userMemberships.map(m => m._id);
        
        // Filter transactions that belong to user's memberships and have unpaid fines
        const userTransactions = transactionsResponse.data.filter(t => 
          membershipIds.includes(t.membership._id) && 
          t.fine > 0 && 
          !t.finePaid
        );
        
        setTransactions(userTransactions);
        setError('');
      } catch (err) {
        console.error('Error fetching fine data:', err);
        setError('Failed to load fine information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFineData();
  }, [user]);

  const handleShowPaymentModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };

  const handlePayFine = async () => {
    if (!selectedTransaction) return;
    
    setPaymentLoading(true);
    setError('');
    
    try {
      await axios.post('/api/transactions/payfine', {
        transactionId: selectedTransaction._id
      });
      
      // Remove the paid transaction from the list
      setTransactions(transactions.filter(t => t._id !== selectedTransaction._id));
      
      // Update total fines
      setTotalFines(prevTotal => prevTotal - selectedTransaction.fine);
      
      // Display success message
      setSuccess('Fine paid successfully!');
      toast.success('Fine paid successfully!');
      
      // Close modal
      setShowModal(false);
    } catch (err) {
      console.error('Error paying fine:', err);
      setError(err.response?.data?.message || 'Failed to pay fine. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const calculateOverdueDays = (dueDate, returnDate) => {
    const due = new Date(dueDate);
    const returned = returnDate ? new Date(returnDate) : new Date();
    
    if (returned <= due) return 0;
    
    const diffTime = Math.abs(returned - due);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <Container>
      <h2 className="my-4">Pay Fine</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      {/* Fine Summary Card */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <h5>Fine Summary</h5>
              <p><strong>Total Outstanding Fine:</strong> ${totalFines.toFixed(2)}</p>
              <p><strong>Number of Unpaid Fines:</strong> {transactions.length}</p>
            </Col>
            {totalFines > 0 && (
              <Col md={6} className="d-flex align-items-center justify-content-md-end">
                <Button 
                  variant="warning" 
                  disabled={transactions.length === 0}
                  onClick={() => handleShowPaymentModal(transactions[0])}
                >
                  Pay All Fines
                </Button>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
      
      {/* Memberships with Fines */}
      {memberships.filter(m => m.fineAmount > 0).length > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <h5>Memberships with Outstanding Fines</h5>
            <Table responsive>
              <thead>
                <tr>
                  <th>Membership Number</th>
                  <th>Membership Type</th>
                  <th>Status</th>
                  <th>Fine Amount</th>
                </tr>
              </thead>
              <tbody>
                {memberships.filter(m => m.fineAmount > 0).map(membership => (
                  <tr key={membership._id}>
                    <td>{membership.membershipNumber}</td>
                    <td>{membership.membershipType}</td>
                    <td>
                      <Badge bg={membership.status === 'Active' ? 'success' : 'secondary'}>
                        {membership.status}
                      </Badge>
                    </td>
                    <td className="text-danger">${membership.fineAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
      
      {/* Transactions with Fines */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading fine information...</p>
        </div>
      ) : transactions.length > 0 ? (
        <Card>
          <Card.Body>
            <h5 className="mb-4">Transactions with Unpaid Fines</h5>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Book Title</th>
                    <th>Issue Date</th>
                    <th>Return Date</th>
                    <th>Overdue Days</th>
                    <th>Fine Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(transaction => (
                    <tr key={transaction._id}>
                      <td>{transaction.book.title}</td>
                      <td>{formatDate(transaction.issueDate)}</td>
                      <td>{formatDate(transaction.returnDate)}</td>
                      <td>
                        {calculateOverdueDays(transaction.returnDate, transaction.actualReturnDate)}
                      </td>
                      <td className="text-danger">${transaction.fine.toFixed(2)}</td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleShowPaymentModal(transaction)}
                          disabled={paymentLoading}
                        >
                          Pay Fine
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
          You don't have any outstanding fines to pay.
        </Alert>
      )}
      
      {/* Payment Confirmation Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTransaction && (
            <>
              <p><strong>Book:</strong> {selectedTransaction.book.title}</p>
              <p><strong>Serial Number:</strong> {selectedTransaction.book.serialNumber}</p>
              <p><strong>Issue Date:</strong> {formatDate(selectedTransaction.issueDate)}</p>
              <p><strong>Return Date:</strong> {formatDate(selectedTransaction.returnDate)}</p>
              <p><strong>Fine Amount:</strong> ${selectedTransaction.fine.toFixed(2)}</p>
              
              <Form.Group className="mb-3">
                <Form.Label>Payment Method</Form.Label>
                <Form.Select>
                  <option>Credit Card</option>
                  <option>Debit Card</option>
                  <option>Cash</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handlePayFine}
            disabled={paymentLoading}
          >
            {paymentLoading ? 'Processing...' : 'Confirm Payment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PayFine; 