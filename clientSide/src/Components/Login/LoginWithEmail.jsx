import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';
import LoginWithGmail from './LoginWithGmail';



export default function LoginWithEmail() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const signIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setIsAuthenticated(true);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <form className='isolate aspect-video rounded-xl bg-white/20 shadow-lg ring-1 ring-black/5 h-90 w-30 flex flex-col gap-4 items-center p-11'>
        <div className='relative'>
          <input
            type="url"
            placeholder='Email'
            className="h-14 p-2 border border-gray-500 rounded w-80"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='relative'>
          <input
            type="password"
            placeholder="*******"
            className="h-14 p-2 border border-gray-500 rounded w-80"
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="bg-[#704F38] text-white font-bold p-2 rounded-md w-24"
          onClick={signIn}
        >
          Login
        </button>

        <p className="text-sm font-bold">
          Don't have an account? <a href="#">Sign up</a>
        </p>
        <div className="flex justify-between items-center">
          <LoginWithGmail />
        </div>
      </form>
    </>
  );
}
