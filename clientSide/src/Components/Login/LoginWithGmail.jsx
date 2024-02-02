import React from 'react';
import { auth } from '../../config/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FaGoogle } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
export default function LoginWithGmail() {
  const provider = new GoogleAuthProvider();
  const navigate = useNavigate();
  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <div>
      <button onClick={signIn}><FaGoogle color='#704F38' size={"25px"} /></button>
    </div>
  );
}
