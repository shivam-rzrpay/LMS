const bcrypt = require('bcrypt');

async function testBcrypt() {
  try {
    // Test password
    const plainPassword = 'admin123';
    
    // Create hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(plainPassword, salt);
    
    console.log('Plain password:', plainPassword);
    console.log('Generated hash:', hash);
    
    // Compare correctly
    const result1 = await bcrypt.compare(plainPassword, hash);
    console.log('Correct comparison result:', result1);
    
    // Compare incorrectly
    const result2 = await bcrypt.compare('wrongpassword', hash);
    console.log('Incorrect comparison result:', result2);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testBcrypt(); 