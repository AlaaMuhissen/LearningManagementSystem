import React, { useState, useEffect } from 'react';
import CreateTable from './CreateTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditStudentInfo from '../EditForm/EditStudentInfo';
<<<<<<< HEAD

function createData(dataObject) {
  return { ...dataObject };
}

function FetchStudentTable() {
=======
import { useAuth } from '../Login/AuthContext';
import { getAuth, onIdTokenChanged } from 'firebase/auth';

function FetchStudentTable() {
  const auth = getAuth();
  const { authToken, updateUser } = useAuth();
>>>>>>> 9d4263d0 (fix: Resolve merge conflicts)
  const [rows, setRow] = useState([]);
  const [columns, setColumns] = useState([]);
  const [editRow, setEditRow] = useState(null);

<<<<<<< HEAD
  useEffect(() => {
    fetch('http://localhost:3001/api/students/getAllStudents')
      .then(res => res.json())
      .then(data => {
        setRow(data);
      })
      .catch(error => {
        console.error('Error during fetching student:', error);
      });
  }, []);

=======
  // Function to refresh the user's ID token
  const refreshIdToken = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const freshToken = await user.getIdToken(/* forceRefresh */ true);
        updateUser({ ...authToken, token: freshToken });
        return freshToken;
      }
    } catch (error) {
      console.error('Error refreshing ID token:', error);
    }
  };

  const fetchData = async () => {
    try {
      const freshToken = await refreshIdToken();
      console.log(freshToken);
      const response = await fetch('http://localhost:3001/api/students/getAllStudents', {
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
        const retryResponse = await fetch('http://localhost:3001/api/students/getAllStudents', {
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
    }
  };
  
>>>>>>> 9d4263d0 (fix: Resolve merge conflicts)
  const handleEditClick = (row) => {
    setEditRow(row);
  };

  const handleDeleteClick = async (row) => {
    try {
<<<<<<< HEAD
      const response = await fetch(`http://localhost:3001/api/students/deleteStudent/${row.id}`, {
        method: 'DELETE'
=======
      const freshToken = await refreshIdToken();
      const response = await fetch(`http://localhost:3001/api/students/deleteStudent/${row.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${freshToken}`,
          'Content-Type': 'application/json',
        },
>>>>>>> 9d4263d0 (fix: Resolve merge conflicts)
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
<<<<<<< HEAD
=======
    fetchData();
  }, [authToken]);

  useEffect(() => {
>>>>>>> 9d4263d0 (fix: Resolve merge conflicts)
    if (rows.length > 0) {
      const columnNames = Object.keys(rows[0]);
      const newColumns = columnNames.map(columnName => ({
        id: columnName,
        label: columnName,
        minWidth: 170
      }));

      setColumns(newColumns);
    }
  }, [rows]);

  return (
    <>
      {rows.length !== 0 && columns.length !== 0 && (
        <>
          <CreateTable rows={rows} columns={columns} handleEditClick={handleEditClick} handleDeleteClick={handleDeleteClick} />
          {editRow && <EditStudentInfo row={editRow} onClose={() => setEditRow(null)} />}
        </>
      )}
      <ToastContainer />
    </>
  );
}

export default FetchStudentTable;
