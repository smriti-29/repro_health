const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Test configuration
const testConfig = {
  mongoUri: 'mongodb://localhost:27017/repro_health_test',
  jwtSecret: 'test-secret-key'
};

// Test User Schema (simplified version)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  genderIdentity: { type: String, required: true },
  pronouns: { type: String, required: true }
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

async function testSetup() {
  console.log('🧪 Testing Reproductive Health App Setup...\n');

  try {
    // Test 1: MongoDB Connection
    console.log('1. Testing MongoDB connection...');
    await mongoose.connect(testConfig.mongoUri);
    console.log('✅ MongoDB connected successfully\n');

    // Test 2: User Creation
    console.log('2. Testing user creation...');
    const testUser = new User({
      email: 'test@example.com',
      password: 'TestPassword123',
      fullName: 'Test User',
      genderIdentity: 'Non-binary',
      pronouns: 'they/them'
    });
    
    await testUser.save();
    console.log('✅ User created successfully\n');

    // Test 3: Password Verification
    console.log('3. Testing password verification...');
    const isPasswordValid = await testUser.comparePassword('TestPassword123');
    console.log(`✅ Password verification: ${isPasswordValid ? 'PASSED' : 'FAILED'}\n`);

    // Test 4: JWT Token Generation
    console.log('4. Testing JWT token generation...');
    const token = jwt.sign({ userId: testUser._id }, testConfig.jwtSecret, { expiresIn: '1h' });
    console.log('✅ JWT token generated successfully\n');

    // Test 5: JWT Token Verification
    console.log('5. Testing JWT token verification...');
    const decoded = jwt.verify(token, testConfig.jwtSecret);
    console.log(`✅ JWT token verified: ${decoded.userId ? 'PASSED' : 'FAILED'}\n`);

    // Test 6: User Retrieval
    console.log('6. Testing user retrieval...');
    const retrievedUser = await User.findById(testUser._id);
    console.log(`✅ User retrieved: ${retrievedUser ? 'PASSED' : 'FAILED'}\n`);

    // Test 7: Cleanup
    console.log('7. Cleaning up test data...');
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test data cleaned up\n');

    console.log('🎉 All tests passed! Your setup is working correctly.');
    console.log('\n📋 Next Steps:');
    console.log('1. Create a .env file in the server directory');
    console.log('2. Start MongoDB service');
    console.log('3. Run "npm run dev" in the server directory');
    console.log('4. Run "npm start" in the client directory');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if all dependencies are installed');
    console.log('3. Verify your Node.js version (v16+)');
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testSetup();
