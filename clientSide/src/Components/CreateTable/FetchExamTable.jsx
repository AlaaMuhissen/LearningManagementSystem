import React, { useState, useEffect } from 'react';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../Login/AuthContext';
import { getAuth } from 'firebase/auth';
import EditExamInfo from '../EditForm/EditExamInfo';
import { Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CreateTable from '../CreateTable/CreateTable';

function FetchExamTable() {
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
      const response = await fetch('http://localhost:3001/api/exams/getAllExams', {
        headers: {
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRow(data);
      } else if (response.status === 401) {
        const retryFreshToken = await refreshIdToken();
        const retryResponse = await fetch('http://localhost:3001/api/exams/getAllExams', {
          headers: {
            Authorization: `Bearer ${retryFreshToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          setRow(retryData);
        } else {
          console.error('Failed to fetch exams after token refresh:', retryResponse.statusText);
        }
      } else {
        console.error('Failed to fetch exams:', response.statusText);
      }
    } catch (error) {
      console.error('API request error:', error);
    } finally {
      setLoading(false); 
    }
  };
  
  const handleEditClick = (row) => {
    setEditRow(row);
  };

  const handleDeleteClick = async (row) => {
    try {
      const freshToken = await refreshIdToken();
      const response = await fetch(`http://localhost:3001/api/exams/deleteExam/${row.id}`, {
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
        console.error('Failed to delete exam:', response.statusText);
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
          {editRow && <EditExamInfo row={editRow} onClose={() => setEditRow(null)} />}
        </>
      )}
      <ToastContainer />
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          navigate('/addExam');
        }}
        sx={{ margin: '20px auto', display: 'block' }}
      >
        Add New Exam
      </Button>
    </>
  );
}

export default FetchExamTable;
