// Simple script to clear localStorage user data
// Run this in the browser console or use the clear_storage.html file

console.log('🧹 Clearing all user data from localStorage...');

// Clear all user-related data
localStorage.removeItem('registeredUsers');
localStorage.removeItem('pendingRegistration');
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('healthLogs');

console.log('✅ All user data cleared from localStorage!');
console.log('📋 Remaining localStorage items:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  - ${key}: ${localStorage.getItem(key)}`);
}

console.log('🔄 Please refresh the page to start fresh!');
