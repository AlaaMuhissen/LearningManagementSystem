import React, { useState, useEffect } from 'react';
import CreateTable from './CreateTable';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditStudentInfo from '../EditForm/EditStudentInfo';

function createData(dataObject) {
  return { ...dataObject };
}

function FetchStudentTable() {
  const [rows, setRow] = useState([]);
  const [columns, setColumns] = useState([]);
  const [editRow, setEditRow] = useState(null);

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

  const handleEditClick = (row) => {
    setEditRow(row);
  };

  const handleDeleteClick = async (row) => {
    try {
      const response = await fetch(`http://localhost:3001/api/students/deleteStudent/${row.id}`, {
        method: 'DELETE'
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
