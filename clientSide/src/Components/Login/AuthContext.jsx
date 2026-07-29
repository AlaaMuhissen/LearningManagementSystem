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

  const fetchUserData = async (email, attempt = 0) => {
    try {
      const encodedEmail = encodeURIComponent(email);
      const response = await fetch(`${API_URL}/api/students/getStudent/${encodedEmail}`);

      if (!response.ok) {
        console.error('Failed to fetch user data — status', response.status);
        return;
      }

      // Read as text first — a 200 with an empty body (e.g. the backend did
      // res.json(undefined) because no row was found yet) would otherwise
      // throw "Unexpected end of JSON input" on response.json().
      const text = await response.text();
      if (!text) {
        // Right after signup, this endpoint can genuinely be hit before the
        // student row has finished being inserted (createUserWithEmailAndPassword
        // fires this listener before SignUpPage's separate addNewStudent call
        // resolves). Retry a few times with a short delay before giving up.
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 600));
          return fetchUserData(email, attempt + 1);
        }
        console.error('User data not found after retries — the student record may not exist yet.');
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
    <AuthContext.Provider value={{ user, updateUser, userData, loading, authToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);