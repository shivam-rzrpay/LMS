import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const MembershipsList = () => {
  const [memberships, setMemberships] = useState([]);
  const [filteredMemberships, setFilteredMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    membershipType: '',
    status: '',
    search: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [membershipToDelete, setMembershipToDelete] = useState(null);

  // Fetch memberships on component mount
  useEffect(() => {
    fetchMemberships();
  }, []);

  // Apply filters when the filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, memberships]);

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
      toast.error(err.response?.data?.message || 'Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...memberships];
    
    if (filters.membershipType) {
      result = result.filter(membership => 
        membership.membershipType === filters.membershipType
      );
    }
    
    if (filters.status) {
      result = result.filter(membership => 
        membership.status === filters.status
      );
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
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      membershipType: '',
      status: '',
      search: ''
    });
  };

  const handleShowDeleteModal = (membership) => {
    setMembershipToDelete(membership);
    setShowDeleteModal(true);
  };

  const handleDeleteMembership = async () => {
    if (!membershipToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      await axios.delete(`/api/memberships/${membershipToDelete._id}`);
      
      // Remove membership from state
      setMemberships(memberships.filter(m => m._id !== membershipToDelete._id));
      setFilteredMemberships(filteredMemberships.filter(m => m._id !== membershipToDelete._id));
      
      // Show success message
      toast.success('Membership deleted successfully!');
      
      // Close modal
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting membership:', err);
      toast.error(err.response?.data?.message || 'Failed to delete membership');
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const updateMembershipStatus = async (membership, newStatus) => {
    try {
      const response = await axios.put(`/api/memberships/${membership._id}`, {
        status: newStatus
      });
      
      // Update membership in state
      const updatedMembership = response.data;
      setMemberships(memberships.map(m => m._id === updatedMembership._id ? updatedMembership : m));
      setFilteredMemberships(filteredMemberships.map(m => m._id === updatedMembership._id ? updatedMembership : m));
      
      // Show success message
      toast.success(`Membership status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating membership status:', err);
      toast.error(err.response?.data?.message || 'Failed to update membership status');
    }
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
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Manage Memberships</h2>
        <Link to="/admin/memberships/add" className="btn btn-primary">
          Add New
        </Link>
      </div>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">Filters</h5>
          <Row>
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
                <Form.Label>Status</Form.Label>
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
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* Memberships Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading memberships...</p>
        </div>
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
                    <th>Membership #</th>
                    <th>Member Name</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days Left</th>
                    <th>Fine Amount</th>
                    <th>Actions</th>
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
                        <td>
                          <div className="d-flex gap-2">
                            <Link 
                              to={`/admin/memberships/edit/${membership._id}`} 
                              className="btn btn-sm btn-primary"
                            >
                              Edit
                            </Link>
                            {membership.status === 'Active' ? (
                              <Button 
                                variant="warning" 
                                size="sm"
                                onClick={() => updateMembershipStatus(membership, 'Inactive')}
                              >
                                Deactivate
                              </Button>
                            ) : membership.status === 'Inactive' ? (
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => updateMembershipStatus(membership, 'Active')}
                              >
                                Activate
                              </Button>
                            ) : null}
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleShowDeleteModal(membership)}
                            >
                              Delete
                            </Button>
                          </div>
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
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {membershipToDelete && (
            <p>
              Are you sure you want to delete membership <strong>{membershipToDelete.membershipNumber}</strong> for <strong>{membershipToDelete.user?.name || 'Unknown User'}</strong>?
              This action cannot be undone.
            </p>
          )}
          <div className="alert alert-warning">
            <strong>Warning:</strong> Deleting a membership will affect any active book issues and transactions tied to this membership.
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteMembership}
            disabled={deleteLoading}
          >
            {deleteLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MembershipsList; 