import API_URL from '../../config/api.js';
import { createContext, useContext, useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [, setIsAuthenticated] = useState(
    window.localStorage.getItem('auth') === 'true'
  );
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState('');

  const updateUser = (newUser) => setUser(newUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (userCred) => {
      if (userCred) {
        setIsAuthenticated(true);
        window.localStorage.setItem('auth', 'true');
        const token = await userCred.getIdToken();
        setAuthToken(token);
        await fetchUserData(userCred.email, token);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (email, token, attempt = 0) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`${API_URL}/api/students/getStudent/${encodedEmail}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.status === 404) {
        // Genuinely not found — retrying won't help here, this is a real
        // "no such student" case now that the backend returns a proper 404
        // instead of an empty 200. (Signup race conditions still land here
        // briefly right after account creation, hence the retry below.)
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 600));
          return fetchUserData(email, token, attempt + 1);
        }
        console.error('User data not found after retries — the student record may not exist yet.');
        return;
      }

      if (!response.ok) {
        console.error('Failed to fetch user data — status', response.status);
        return;
      }

      const text = await response.text();
      if (!text) {
        console.error('Empty response body from getStudent despite a 200 status.');
        return;
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('Error fetching user data: invalid JSON from server:', text.slice(0, 200));
        return;
      }

      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAuthenticated(false);
      setUser(null);
      setUserData(null);
      window.localStorage.setItem('auth', 'false');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, updateUser, userData, loading, authToken, logout,
      refreshUserData: () => userData?.email && fetchUserData(userData.email, authToken),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);