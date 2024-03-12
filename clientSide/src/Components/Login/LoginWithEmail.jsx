import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import LoginWithGmail from './LoginWithGmail';

export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log(user);
      setIsAuthenticated(true);
     fetchUserRole(user.email); 
    } catch (error) {
      console.log(error.message);
    }
  };

 // Fetch user role from backend
const fetchUserRole = async (email) => {
  try {
    const response = await fetch(`http://localhost:3001/api/students/getStudent/${encodeURIComponent(email)}`);
    if (response.ok) {
      const data = await response.json();
      setUserRole(data.role);
    } else {
      console.error('Failed to fetch user role');
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
  }
};


  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
    <form className='isolate aspect-video rounded-xl bg-white/60 shadow-lg ring-1 ring-black/10 md:h-90 w-full md:w-96 flex flex-col gap-4 items-center p-11'>
  <div className='relative'>
    <input
      type="url"
      placeholder='Email'
      className="h-14 p-2 border border-gray-500 rounded w-full md:w-80"
      required
      onChange={(e) => setEmail(e.target.value)}
    />
  </div>
  <div className='relative'>
    <input
      type="password"
      placeholder="*******"
      className="h-14 p-2 border border-gray-500 rounded w-full md:w-80"
      required
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>
  <button
    className="bg-[#5698f0] text-[#0d1d32] font-bold p-2 rounded-md w-full md:w-24"
    onClick={signIn}
  >
    Login
  </button>

  <p className="text-sm font-bold text-[#0d1d32]">
    Don't have an account? <a href="#">Sign up</a>
  </p>
  <div className="flex justify-between items-center">
    <LoginWithGmail />
  </div>
</form>

    </>
  );
}
