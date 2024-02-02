import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth0, setAuth] = useState(
		false || window.localStorage.getItem('auth') === 'true'
	);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState("");

  const updateUser = (userData) => {
    setUser(userData);
  };

  useEffect(() => {
    auth.onAuthStateChanged((userCred) => {
			if (userCred) {
				setAuth(true);
				window.localStorage.setItem('auth', 'true');
				userCred.getIdToken().then((token) => {
					setAuthToken(token);
				});
			}
		});
  }, []);

  return (
    <AuthContext.Provider value={{ user, updateUser, loading, authToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
