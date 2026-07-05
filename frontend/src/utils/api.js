import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const waitForCurrentUser = () => {
  if (typeof auth.authStateReady === 'function') {
    return auth.authStateReady().then(() => auth.currentUser);
  }

  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

const getAuthHeaders = async (forceRefresh = false) => {
  const user = auth.currentUser || await waitForCurrentUser();

  if (!user) {
    throw new Error('Ban can dang nhap de tiep tuc');
  }

  const token = await user.getIdToken(forceRefresh);

  return {
    Authorization: `Bearer ${token}`,
  };
};

const buildHeaders = (authHeaders, optionsHeaders = {}) => ({
  'Content-Type': 'application/json',
  ...authHeaders,
  ...optionsHeaders,
});

const requestWithToken = async (endpoint, options, forceRefresh = false) => {
  const authHeaders = await getAuthHeaders(forceRefresh);

  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(authHeaders, options.headers),
  });
};

export const fetchWithAuth = async (endpoint, options = {}) => {
  let response = await requestWithToken(endpoint, options);

  if (response.status === 401) {
    response = await requestWithToken(endpoint, options, true);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    if (response.status === 401) {
      localStorage.removeItem('user');
      await signOut(auth).catch(() => {});
    }

    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json().catch(() => null);
};
