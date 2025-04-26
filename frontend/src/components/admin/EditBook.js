import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    serialNumber: '',
    category: '',
    type: 'Book',
    status: 'Available',
    cost: '',
    description: ''
  });
  const [procurementDate, setProcurementDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { title, author, serialNumber, category, type, status, cost, description } = formData;
  
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(`/api/books/${id}`);
        const book = response.data;
        
        setFormData({
          title: book.title,
          author: book.author,
          serialNumber: book.serialNumber,
          category: book.category,
          type: book.type,
          status: book.status,
          cost: book.cost.toString(),
          description: book.description || ''
        });
        
        if (book.procurementDate) {
          setProcurementDate(new Date(book.procurementDate));
        }
        
        setError('');
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!title || !author || !serialNumber || !category || !cost) {
      setError('Please fill all required fields');
      return;
    }
    
    setSaveLoading(true);
    setError('');
    
    try {
      await axios.put(`/api/books/${id}`, {
        ...formData,
        procurementDate,
        cost: parseFloat(cost)
      });
      
      toast.success(`${type} updated successfully!`);
      navigate('/admin/books');
    } catch (err) {
      console.error('Error updating book:', err);
      setError(err.response?.data?.message || `Failed to update ${type.toLowerCase()}`);
    } finally {
      setSaveLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading book details...</p>
      </Container>
    );
  }
  
  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center my-4">
        <h2>Edit {type}</h2>
        <Link to="/admin/books" className="btn btn-secondary">
          Back to List
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="type"
                    value={type}
                    onChange={handleChange}
                    required
                  >
                    <option value="Book">Book</option>
                    <option value="Movie">Movie</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={title}
                    onChange={handleChange}
                    placeholder="Enter title"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Author <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="author"
                    value={author}
                    onChange={handleChange}
                    placeholder="Enter author"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Serial Number <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="serialNumber"
                    value={serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="category"
                    value={category}
                    onChange={handleChange}
                    placeholder="Enter category (e.g., Science, Fiction)"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={status}
                    onChange={handleChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Lost">Lost</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Cost ($) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="cost"
                    value={cost}
                    onChange={handleChange}
                    placeholder="Enter cost"
                    step="0.01"
                    min="0"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Procurement Date</Form.Label>
                  <DatePicker
                    selected={procurementDate}
                    onChange={(date) => setProcurementDate(date)}
                    className="form-control"
                    dateFormat="MM/dd/yyyy"
                    maxDate={new Date()}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={description}
                onChange={handleChange}
                placeholder="Enter description"
                rows={3}
              />
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                type="submit"
                disabled={saveLoading}
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Link to="/admin/books" className="btn btn-secondary">
                Cancel
              </Link>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditBook; 