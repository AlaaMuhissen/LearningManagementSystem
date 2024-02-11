import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; 
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [auth0, setAuth] = useState(
    false || window.localStorage.getItem('auth') === 'true'
  );

  const [user, setUser] = useState(null); // Firebase user data
  const [userData, setUserData] = useState(null); // User data from backend
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState("");

  const updateUser = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((userCred) => {
      if (userCred) {
        setAuth(true);
        window.localStorage.setItem('auth', 'true');
        userCred.getIdToken().then((token) => {
          setAuthToken(token);
        });

        // Fetch user data from the backend API
        fetchUserData(userCred.email);
      }
    });
    
    return () => {
      unsubscribe(); // Unsubscribe from the auth state listener
    };
  }, []);

  const fetchUserData = async (email) => {
    try {
      const response = await fetch(`http://localhost:3001/api/students/getStudent/${encodeURIComponent(email)}`);
      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
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
      setAuth(false);
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

export const useAuth = () => {
  return useContext(AuthContext);
};
