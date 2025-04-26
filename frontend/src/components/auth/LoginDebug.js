import React, { useState } from 'react';
import { Button, Container, Card, Form, Alert } from 'react-bootstrap';
import axios from 'axios';

const LoginDebug = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResponse(null);
    
    try {
      console.log('Making direct request to:', 'http://localhost:5000/api/auth/login');
      console.log('With data:', { username, password });
      
      const res = await axios.post('http://localhost:5000/api/auth/login', { 
        username, 
        password 
      });
      
      console.log('Response received:', res.data);
      
      setResponse({
        success: true,
        data: res.data
      });
    } catch (err) {
      console.error('Error occurred:', err);
      
      setResponse({
        success: false,
        error: err.response?.data || err.message
      });
      
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Login Debug</h2>
      
      <Card className="mb-4">
        <Card.Body>
          <h4>Direct API Request</h4>
          <p>This will make a direct request to the backend API at http://localhost:5000/api/auth/login</p>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleDirectLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter username"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter password"
                required
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Testing...' : 'Test Direct Login'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {response && (
        <Card className={response.success ? 'border-success' : 'border-danger'}>
          <Card.Header>{response.success ? 'Success Response' : 'Error Response'}</Card.Header>
          <Card.Body>
            <pre>{JSON.stringify(response, null, 2)}</pre>
          </Card.Body>
        </Card>
      )}
      
      <Card className="mt-4 bg-light">
        <Card.Body>
          <h5>Debug Instructions</h5>
          <p>Use username <strong>admin</strong> with password <strong>admin123</strong> or username <strong>user</strong> with password <strong>user123</strong>.</p>
          <p>If the direct API request works but the normal login doesn't, the issue is likely with the proxy configuration or how axios is configured in the React app.</p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default LoginDebug; 