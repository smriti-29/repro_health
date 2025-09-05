// Utility function to clear localStorage for testing
export const clearLocalStorage = () => {
  localStorage.removeItem('registeredUsers');
  localStorage.removeItem('pendingRegistration');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('healthLogs');
  console.log('🧹 localStorage cleared for testing');
};

// Function to check what's in localStorage
export const checkLocalStorage = () => {
  console.log('📋 localStorage contents:');
  console.log('registeredUsers:', localStorage.getItem('registeredUsers'));
  console.log('pendingRegistration:', localStorage.getItem('pendingRegistration'));
  console.log('token:', localStorage.getItem('token'));
  console.log('user:', localStorage.getItem('user'));
  console.log('healthLogs:', localStorage.getItem('healthLogs'));
};
