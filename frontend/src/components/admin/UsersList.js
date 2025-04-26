import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Form, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    username: '',
    role: '',
    active: ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters when the filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data);
      setFilteredUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...users];
    
    if (filters.name) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }
    
    if (filters.email) {
      result = result.filter(user => 
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }
    
    if (filters.username) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(filters.username.toLowerCase())
      );
    }
    
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    
    if (filters.active !== '') {
      const activeStatus = filters.active === 'true';
      result = result.filter(user => user.active === activeStatus);
    }
    
    setFilteredUsers(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      email: '',
      username: '',
      role: '',
      active: ''
    });
  };

  const handleShowDeleteModal = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setActionLoading(true);
    
    try {
      await axios.delete(`/api/users/${userToDelete._id}`);
      
      // Remove user from state
      setUsers(users.filter(u => u._id !== userToDelete._id));
      setFilteredUsers(filteredUsers.filter(u => u._id !== userToDelete._id));
      
      // Show success message
      toast.success('User deleted successfully!');
      
      // Close modal
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    setActionLoading(true);
    
    try {
      const response = await axios.put(`/api/users/${user._id}`, {
        active: !user.active
      });
      
      // Update user in state
      const updatedUser = response.data;
      setUsers(users.map(u => u._id === updatedUser._id ? updatedUser : u));
      setFilteredUsers(filteredUsers.map(u => u._id === updatedUser._id ? updatedUser : u));
      
      // Show success message
      toast.success(`User ${updatedUser.active ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error('Error toggling user status:', err);
      toast.error(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Manage Users</h2>
        <Link to="/admin/users/add" className="btn btn-primary">
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
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={filters.name}
                  onChange={handleFilterChange}
                  placeholder="Search by name"
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="text"
                  name="email"
                  value={filters.email}
                  onChange={handleFilterChange}
                  placeholder="Search by email"
                />
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={filters.username}
                  onChange={handleFilterChange}
                  placeholder="Search by username"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  name="role"
                  value={filters.role}
                  onChange={handleFilterChange}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="active"
                  value={filters.active}
                  onChange={handleFilterChange}
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
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
      
      {/* Users Table */}
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading users...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>Users ({filteredUsers.length})</h5>
            </div>
            
            <div className="table-responsive">
              <Table striped hover>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || '-'}</td>
                      <td>
                        <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Badge 
                          bg={user.active ? 'success' : 'secondary'}
                        >
                          {user.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link 
                            to={`/admin/users/edit/${user._id}`} 
                            className="btn btn-sm btn-primary"
                          >
                            Edit
                          </Link>
                          <Button 
                            variant={user.active ? 'warning' : 'success'} 
                            size="sm"
                            onClick={() => toggleUserStatus(user)}
                            disabled={actionLoading}
                          >
                            {user.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleShowDeleteModal(user)}
                            disabled={actionLoading}
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
            <h5 className="text-muted">No users found matching your filters.</h5>
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
          {userToDelete && (
            <>
              <p>
                Are you sure you want to delete the user <strong>{userToDelete.name}</strong> ({userToDelete.username})? 
                This action cannot be undone.
              </p>
              <div className="alert alert-warning">
                <strong>Warning:</strong> Deleting a user will also remove all their associated records (memberships, borrows, etc.).
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteUser}
            disabled={actionLoading}
          >
            {actionLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UsersList; 