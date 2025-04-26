import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditMembership = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    membershipNumber: '',
    user: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    membershipType: 'Standard',
    fineAmount: 0
  });
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { membershipNumber, user, startDate, endDate, status, membershipType, fineAmount } = formData;
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUserLoading(true);
        const response = await axios.get('/api/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        toast.error('Failed to load users');
      } finally {
        setUserLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Fetch membership data
  useEffect(() => {
    const fetchMembership = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/memberships/${id}`);
        
        // Format dates for form inputs
        const membership = response.data;
        const formattedData = {
          ...membership,
          user: membership.user?._id || '',
          startDate: new Date(membership.startDate).toISOString().split('T')[0],
          endDate: new Date(membership.endDate).toISOString().split('T')[0]
        };
        
        setFormData(formattedData);
        setError('');
      } catch (err) {
        console.error('Error fetching membership:', err);
        setError('Failed to load membership data');
        toast.error(err.response?.data?.message || 'Failed to load membership data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembership();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle fine amount as a number
    if (name === 'fineAmount') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
      return;
    }
    
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
    setSaveLoading(true);
    
    try {
      // Create update data without the user field if it hasn't changed
      const updateData = { ...formData };
      delete updateData._id; // Remove _id field
      
      await axios.put(`/api/memberships/${id}`, updateData);
      
      toast.success('Membership updated successfully!');
      navigate('/admin/memberships');
    } catch (err) {
      console.error('Error updating membership:', err);
      setError(err.response?.data?.message || 'Failed to update membership');
      toast.error(err.response?.data?.message || 'Failed to update membership');
    } finally {
      setSaveLoading(false);
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
  
  // Recalculate end date button handler
  const handleRecalculateEndDate = () => {
    if (startDate) {
      const calculatedEndDate = calculateEndDate(startDate, membershipType);
      setFormData(prev => ({ ...prev, endDate: calculatedEndDate }));
      toast.info('End date recalculated based on membership type');
    }
  };
  
  if (loading || userLoading) {
    return (
      <Container>
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading membership data...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Edit Membership</h2>
        <Link to="/admin/memberships" className="btn btn-secondary">
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
                  <Form.Label>Membership Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="membershipNumber"
                    value={membershipNumber}
                    onChange={handleChange}
                    placeholder="Enter membership number"
                    required
                  />
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
                    disabled // Prevent changing user association
                  >
                    <option value="">Select User</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    User association cannot be changed after creation
                  </Form.Text>
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
                  <div className="d-flex">
                    <Form.Control
                      type="date"
                      name="endDate"
                      value={endDate}
                      onChange={handleChange}
                      required
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={handleRecalculateEndDate}
                      className="ms-2"
                      type="button"
                    >
                      Recalculate
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={4}>
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
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Expired">Expired</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Fine Amount (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    name="fineAmount"
                    value={fineAmount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                  />
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
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving Changes...' : 'Save Changes'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditMembership; 