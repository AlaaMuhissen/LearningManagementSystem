import React, { useState, useEffect } from 'react';
import CreateTable from './CreateTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../Login/AuthContext';
import { getAuth } from 'firebase/auth';
import EditLessonInfo from '../EditForm/EditLessonInfo';
import { Button, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function FetchLessonTable() {
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();
  const [rows, setRow] = useState([]);
  const [columns, setColumns] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  const refreshIdToken = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken(true);
        updateUser({ ...authToken, token: freshToken });
        return freshToken;
      }
    } catch (error) {
      console.error('Error refreshing ID token:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true); 
    try {
      const freshToken = await refreshIdToken();
      console.log(freshToken);
      const response = await fetch('http://localhost:3001/api/lessons/getAllLessons', {
        headers: {
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRow(data);
      } else if (response.status === 401) {
        // Unauthorized, refresh token and retry the request
        const retryFreshToken = await refreshIdToken();
        const retryResponse = await fetch('http://localhost:3001/api/lessons/getAllLessons', {
          headers: {
            Authorization: `Bearer ${retryFreshToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          setRow(retryData);
        } else {
          console.error('Failed to fetch lessons after token refresh:', retryResponse.statusText);
        }
      } else {
        console.error('Failed to fetch lessons:', response.statusText);
      }
    } catch (error) {
      console.error('API request error:', error);
    } finally {
      setLoading(false); // Set loading to false when fetching is completed (success or failure)
    }
  };

  const handleEditClick = (row) => {
    setEditRow(row);
  };

  const handleDeleteClick = async (row) => {
    try {
      const freshToken = await refreshIdToken();
      const response = await fetch(`http://localhost:3001/api/lessons/deleteLesson/${row.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        window.location.reload();
        toast(data.message);
      } else {
        console.error('Failed to delete lesson:', response.statusText);
      }
    } catch (error) {
      console.error('Error during delete request:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [authToken]);

  useEffect(() => {
    if (rows.length > 0) {
      const columnNames = Object.keys(rows[0]);
      const newColumns = columnNames.map((columnName) => ({
        id: columnName,
        label: columnName,
        minWidth: 70,
      }));

      setColumns(newColumns);
    }
  }, [rows]);

  return (
    <>
      {loading && <CircularProgress sx={{ margin: '20px auto', display: 'block' }} />}
      {!loading && rows.length !== 0 && columns.length !== 0 && (
        <>
          <CreateTable rows={rows} columns={columns} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick} />
          {editRow && <EditLessonInfo row={editRow} onClose={() => setEditRow(null)} />}
        </>
      )}
      <ToastContainer />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          navigate('/addLesson');
        }}
        sx={{ margin: '20px auto', display: 'block' }}
      >
        Add New Lesson
      </Button>
    </>
  );
}

export default FetchLessonTable;
