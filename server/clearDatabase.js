import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const clearDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all users
    const result = await User.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} users from database`);

    // Clear all collections if needed
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      const count = await collection.countDocuments();
      console.log(`📊 Collection ${collection.collectionName}: ${count} documents`);
    }

    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    console.log('💡 If MongoDB connection failed, use the clear_storage.html file to clear localStorage instead');
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

clearDatabase();
