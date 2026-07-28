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
        await fetchUserData(userCred.email);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (email) => {
    try {
      const encodedEmail = encodeURIComponent(email);
     
      const response = await fetch(`${API_URL}/api/students/getStudent/${encodedEmail}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data');
      }
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
    <AuthContext.Provider value={{ user, updateUser, userData, loading, authToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);