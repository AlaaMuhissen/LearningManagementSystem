import React, { useState, useEffect } from 'react';
import CreateTable from './CreateTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditStudentInfo from '../EditForm/EditStudentInfo';
import { useAuth } from '../Login/AuthContext';
import { getAuth, onIdTokenChanged } from 'firebase/auth';
import { Button, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

function FetchStudentTable() {
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();
  const [rows, setRow] = useState([]);
  const [columns, setColumns] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [loading, setLoading] = useState(true); // New state for loading
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
    setLoading(true); // Set loading to true when starting to fetch data
    try {
      const freshToken = await refreshIdToken();
      const response = await fetch('https://learningmanagementsystem.onrender.com/api/students/getAllStudents', {
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
        const retryResponse = await fetch('https://learningmanagementsystem.onrender.com/api/students/getAllStudents', {
          headers: {
            Authorization: `Bearer ${retryFreshToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          setRow(retryData);
        } else {
          console.error('Failed to fetch student after token refresh:', retryResponse.statusText);
        }
      } else {
        console.error('Failed to fetch student:', response.statusText);
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
      const response = await fetch(`https://learningmanagementsystem.onrender.com/api/students/deleteStudent/${row.id}`, {
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
        console.error('Failed to delete student:', response.statusText);
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
          {editRow && <EditStudentInfo row={editRow} onClose={() => setEditRow(null)} />}
        </>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          navigate('/addStudent');
        }}
        sx={{ margin: '20px auto', display: 'block' }}
      >
        Add New Student
      </Button>
      <ToastContainer />
    </>
  );
}

export default FetchStudentTable;
