import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [changePassword, setChangePassword] = useState(false);
  
  const { name, email, username, phone, currentPassword, newPassword, confirmPassword } = formData;
  
  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData({
        ...formData,
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || ''
      });
      setLoading(false);
    }
  }, [user]);
  
  // Fetch fresh user profile data
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/profile');
      
      setFormData({
        ...formData,
        name: response.data.name || '',
        email: response.data.email || '',
        username: response.data.username || '',
        phone: response.data.phone || ''
      });
      
      // Update the global user state
      updateUser(response.data);
      
      setError('');
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile information. Please try again later.');
      toast.error(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    // Basic profile update validation
    if (!name || !email) {
      setError('Please fill in all required fields');
      return false;
    }
    
    // Password change validation
    if (changePassword) {
      if (!currentPassword) {
        setError('Please enter your current password');
        return false;
      }
      
      if (!newPassword) {
        setError('Please enter a new password');
        return false;
      }
      
      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
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
      const updateData = {
        name,
        email,
        phone
      };
      
      // Add password fields if changing password
      if (changePassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }
      
      const response = await axios.put('/api/auth/profile', updateData);
      
      // Update auth context
      updateUser(response.data);
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setChangePassword(false);
      
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      toast.error(err.response?.data?.message || 'Failed to update profile');
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
          <p className="mt-2">Loading profile information...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>My Profile</h2>
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
                    placeholder="Enter your full name"
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
                    placeholder="Enter your email address"
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
                    placeholder="Enter your phone number"
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={12}>
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
                      <>
                        <Row>
                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Current Password <span className="text-danger">*</span></Form.Label>
                              <Form.Control
                                type="password"
                                name="currentPassword"
                                value={currentPassword}
                                onChange={handleChange}
                                placeholder="Enter your current password"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                        
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
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="primary" 
                type="submit"
                disabled={saving}
                className="me-2"
              >
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={fetchUserProfile}
                disabled={loading || saving}
              >
                Refresh Data
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="mt-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Account Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>Account Type:</strong> {user?.role === 'admin' ? 'Administrator' : 'Regular User'}</p>
              <p><strong>Account Status:</strong> {user?.active ? 'Active' : 'Inactive'}</p>
            </Col>
            <Col md={6}>
              <p><strong>Account ID:</strong> {user?._id}</p>
              <p><strong>Registered Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Profile; 