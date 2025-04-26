import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddMembership = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    membershipNumber: '',
    user: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active',
    membershipType: 'Standard'
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { membershipNumber, user, startDate, endDate, status, membershipType } = formData;
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUserLoading(true);
        const response = await axios.get('/api/users');
        // Filter only active users
        const activeUsers = response.data.filter(user => user.active);
        setUsers(activeUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      } finally {
        setUserLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Generate a membership number when the component mounts
  useEffect(() => {
    generateMembershipNumber();
  }, []);
  
  const generateMembershipNumber = () => {
    const prefix = 'MEM';
    const randomNum = Math.floor(10000 + Math.random() * 90000); // 5 digit number
    const timestamp = Date.now().toString().substr(-4); // Last 4 digits of timestamp
    const newMembershipNumber = `${prefix}${randomNum}-${timestamp}`;
    setFormData(prev => ({ ...prev, membershipNumber: newMembershipNumber }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    if (!membershipNumber || !user || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return false;
    }
    
    // Validate end date is after start date
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) {
      setError('End date must be after start date');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setError('');
    setLoading(true);
    
    try {
      await axios.post('/api/memberships', formData);
      
      toast.success('Membership created successfully!');
      navigate('/admin/memberships');
    } catch (err) {
      console.error('Error creating membership:', err);
      setError(err.response?.data?.message || 'Failed to create membership');
      toast.error(err.response?.data?.message || 'Failed to create membership');
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate end date based on start date and membership type
  const calculateEndDate = (startDate, type) => {
    const start = new Date(startDate);
    let end;
    
    if (type === 'Standard') {
      // Standard membership is 3 months
      end = new Date(start);
      end.setMonth(end.getMonth() + 3);
    } else {
      // Premium membership is 1 year
      end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };
  
  // Auto-calculate end date when start date or membership type changes
  useEffect(() => {
    if (startDate) {
      const calculatedEndDate = calculateEndDate(startDate, membershipType);
      setFormData(prev => ({ ...prev, endDate: calculatedEndDate }));
    }
  }, [startDate, membershipType]);
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Add New Membership</h2>
        <Link to="/admin/memberships" className="btn btn-secondary">
          Back to List
        </Link>
      </div>
      
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {userLoading ? (
            <div className="text-center my-4">
              <Spinner animation="border" size="sm" />
              <span className="ms-2">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <Alert variant="warning">
              No active users found. Please <Link to="/admin/users/add">add a user</Link> first.
            </Alert>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Membership Number <span className="text-danger">*</span></Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        name="membershipNumber"
                        value={membershipNumber}
                        onChange={handleChange}
                        placeholder="Enter membership number"
                        required
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={generateMembershipNumber}
                        className="ms-2"
                      >
                        Generate
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>User <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="user"
                      value={user}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select User</option>
                      {users.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.email})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      name="startDate"
                      value={startDate}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>End Date <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={handleChange}
                      required
                    />
                    <Form.Text className="text-muted">
                      Auto-calculated based on membership type, but can be adjusted.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Membership Type</Form.Label>
                    <Form.Select
                      name="membershipType"
                      value={membershipType}
                      onChange={handleChange}
                    >
                      <option value="Standard">Standard (3 months)</option>
                      <option value="Premium">Premium (1 year)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={status}
                      onChange={handleChange}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-4">
                <Button 
                  variant="secondary" 
                  as={Link} 
                  to="/admin/memberships" 
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Membership...' : 'Create Membership'}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddMembership; 