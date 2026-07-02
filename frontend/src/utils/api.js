import { auth } from '../config/firebase';

const BASE_URL = 'http://localhost:5000/api';

export const fetchWithAuth = async (endpoint, options = {}) => {
  // Đợi Firebase Auth khởi tạo
  const user = await new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      unsubscribe();
      resolve(u);
    });
  });

  let token = '';
  if (user) {
    token = await user.getIdToken();
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
