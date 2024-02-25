import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './Login/AuthContext';

const PointsContext = createContext();

export const usePoints = () => useContext(PointsContext);

export const PointsProvider = ({ children }) => {
  const { userData } = useAuth();
  const userId = userData?.id;
  console.log(userData);
  const [points, setPoints] = useState(0);


    const fetchPoints = async () => {
      if (userId) {
        try {
          const response = await fetch(`http://localhost:3001/api/students/getStudentPoints/${userId}`);
          const data = await response.json();
          setPoints(data);
        } catch (error) {
          console.error('Error during fetching points:', error);
        }
      }
    };


  const updatePoints = async (newPoints) => {
    try {
      if (userId) {
      const response = await fetch(`http://localhost:3001/api/students/updateStudentPoints/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          student_id: userId,
          points: newPoints
        })
      });
      const updatedData = await response.json();
      setPoints(updatedData);
    }
  } catch (error) {
    console.error('Error updating progress data:', error);
  }
};


useEffect(() => {
  if(userId){
    fetchPoints();
  }
}, []);


  return (
    <PointsContext.Provider value={{ points, updatePoints }}>
      {children}
    </PointsContext.Provider>
  );
};
