import API_URL from '../config/api.js';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './Login/AuthContext';

const PointsContext = createContext();

export const usePoints = () => useContext(PointsContext);

export const PointsProvider = ({ children }) => {
  const { userData } = useAuth();
  const userId = userData?.id;
  const [points, setPoints] = useState(0);
  const pointsRef = useRef(0);

  const fetchPoints = async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${API_URL}/api/students/getStudentPoints/${userId}`);
      const data = await response.json();
      const p = data.points ?? 0;
      setPoints(p);
      pointsRef.current = p;
    } catch (error) {
      console.error('Error fetching points:', error);
    }
  };

  const updatePoints = async (newPoints) => {
    if (!userId) return;

    // Only update if new points are higher than current — prevents double earning
    if (newPoints <= pointsRef.current) return;

    pointsRef.current = newPoints;
    setPoints(newPoints);

    try {
      await fetch(`${API_URL}/api/students/updateStudentPoints/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: newPoints }),
      });
    } catch (error) {
      console.error('Error saving points:', error);
      fetchPoints();
    }
  };

  useEffect(() => {
    if (userId) fetchPoints();
  }, [userId]);

  return (
    <PointsContext.Provider value={{ points, updatePoints }}>
      {children}
    </PointsContext.Provider>
  );
};