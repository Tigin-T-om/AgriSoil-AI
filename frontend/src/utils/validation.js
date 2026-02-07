// Validation utility functions

export const validateRequired = (value) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return 'This field is required';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  if (password.length > 72) {
    return 'Password cannot exceed 72 characters';
  }
  return null;
};

export const validateNumeric = (value) => {
  if (!value) return 'This field is required';
  if (isNaN(value) || value === '') {
    return 'Please enter a valid number';
  }
  return null;
};

export const validateRange = (value, min, max) => {
  const numValue = Number(value);
  if (isNaN(numValue)) {
    return 'Please enter a valid number';
  }
  if (numValue < min || numValue > max) {
    return `Value must be between ${min} and ${max}`;
  }
  return null;
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  return null;
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return null; // Optional field
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }
  return null;
};
