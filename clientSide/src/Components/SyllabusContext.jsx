import React, { createContext, useContext, useState, useEffect } from 'react';


const SyllabusContext = createContext();

export const SyllabusProvider = ({ children }) => {
  const [syllabus, setSyllabus] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/syllabus/getSyllabus/main")
      .then(res => res.json())
      .then(data => {
        setSyllabus(data);
      })
      .catch(error => {
        console.error('Error during fetching syllabus:', error);
      });
  }, []);

  return (
    <SyllabusContext.Provider value={syllabus}>
      {children}
    </SyllabusContext.Provider>
  );
};


export const useSyllabus = () => {
  const syllabus = useContext(SyllabusContext);
  if (!syllabus) {
    throw new Error('useSyllabus must be used within a SyllabusProvider');
  }
  return syllabus;
};
