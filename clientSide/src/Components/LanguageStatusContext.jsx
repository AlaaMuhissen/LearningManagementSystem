import React, { createContext, useContext, useState,useEffect } from 'react';
import { useAuth } from './Login/AuthContext';

const LanguageStatusContext = createContext();


export const useLanguageStatus = () => useContext(LanguageStatusContext);


export const LanguageStatusProvider = ({ children }) => {

  const [languageStatus, setLanguageStatus] = useState([]);
  const {userData} = useAuth();
  const userId = userData?.id; 

  const fetchProgressData = async (syllabus_id, language_id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/progress/getLanguageStatus/${userId}/syllabus/${syllabus_id}/language/${language_id}`);
      const data = await response.json();
      setLanguageStatus(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const updateLanguageStatus = async (started, finished) => {
    try {
      const response = await fetch(`http://localhost:3001/api/progress/updateLanguageStatus/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ started, finished }),
      });
      const updatedData = await response.json();
      setLanguageStatus(updatedData);
    } catch (error) {
      console.error('Error updating progress data:', error);
    }
  };

  useEffect(() => {
    if(userId){

        fetchProgressData();
    }
  }, []);

  return (
    <LanguageStatusContext.Provider value={{ languageStatus, updateLanguageStatus }}>
      {children}
    </LanguageStatusContext.Provider>
  );
};
