const axios = require('axios');

const testAuth = async () => {
  try {
    console.log('Testing admin login...');
    const adminResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('Admin login successful!');
    console.log('Admin data:', adminResponse.data);
    
    console.log('\nTesting user login...');
    const userResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'user',
      password: 'user123'
    });
    
    console.log('User login successful!');
    console.log('User data:', userResponse.data);
    
  } catch (error) {
    console.error('Authentication error:', error.response?.data || error.message);
  }
};

testAuth(); 