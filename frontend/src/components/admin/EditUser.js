import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    role: 'user',
    active: true,
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  
  const { name, email, username, phone, role, active, newPassword, confirmPassword } = formData;
  
  // Fetch user data on component mount
  useEffect(() => {
    fetchUser();
  }, [id]);
  
  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/${id}`);
      
      // Set form data with user information
      setFormData({
        ...formData,
        name: response.data.name,
        email: response.data.email,
        username: response.data.username,
        phone: response.data.phone || '',
        role: response.data.role,
        active: response.data.active,
      });
      
      setError('');
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to load user information. Please try again later.');
      toast.error(err.response?.data?.message || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const validateForm = () => {
    if (!name || !email) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (changePassword) {
      if (!newPassword) {
        setError('Please enter a new password');
        return false;
      }
      
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setSaving(true);
    
    try {
      // Create update data without the username and password fields if not changing
      const userData = {
        name,
        email,
        phone,
        role,
        active
      };
      
      // Add password if changing
      if (changePassword && newPassword) {
        userData.password = newPassword;
      }
      
      await axios.put(`/api/users/${id}`, userData);
      
      toast.success('User updated successfully!');
      navigate('/admin/users');
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.message || 'Failed to update user');
      toast.error(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading user information...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Edit User</h2>
        <Link to="/admin/users" className="btn btn-secondary">
          Back to List
        </Link>
      </div>
      
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    value={username}
                    disabled
                    readOnly
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Username cannot be changed
                  </Form.Text>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <Form.Select
                    name="role"
                    value={role}
                    onChange={handleChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3 mt-4">
                  <Form.Check
                    type="checkbox"
                    name="active"
                    checked={active}
                    onChange={handleChange}
                    label="Active Account"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Card className="bg-light mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    id="changePassword"
                    label="Change Password"
                    checked={changePassword}
                    onChange={() => setChangePassword(!changePassword)}
                  />
                </Form.Group>
                
                {changePassword && (
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="newPassword"
                          value={newPassword}
                          onChange={handleChange}
                          placeholder="Enter new password"
                        />
                        <Form.Text className="text-muted">
                          Password must be at least 6 characters long
                        </Form.Text>
                      </Form.Group>
                    </Col>
                    
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm new password"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="secondary" 
                as={Link} 
                to="/admin/users" 
                className="me-2"
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditUser; 