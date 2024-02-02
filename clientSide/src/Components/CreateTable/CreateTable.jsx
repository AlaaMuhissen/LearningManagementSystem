import React, { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function CreateTable({ rows, columns ,handleEditClick , handleDeleteClick }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

const getExerciseNameById = async (id) =>{
  try {
    const freshToken = await refreshIdToken();
    const response = await fetch(`http://localhost:3001/api/exercises/getExercise/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${freshToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
    } else {
      console.error('Failed to delete student:', response.statusText);
    }
  } catch (error) {
    console.error('Error during delete request:', error);
  }
}


  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
    
              <TableCell key="edit" align="center" style={{ minWidth: 50 }}>
                Edit
              </TableCell>
              <TableCell key="delete" align="center" style={{ minWidth: 50 }}>
                Delete
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
  {rows
    ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((row, i) => {
      return (
        <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
          {columns.map((column) => {
            const value =
              column.id !== 'id' ? row[column.id] : i + 1;

            // Modify this block to handle the exercieseid column
            // if (column.id === 'exerciseids') {
            //   return (
            //     <TableCell key={column.id} align={column.align}>
            //       {row.exercieseids.map((exerciseId, index) => (
            //         // Assuming you have a function to get the exercise name by ID
            //         <span key={index}>{getExerciseNameById(exerciseId)}</span>
            //       ))}
            //     </TableCell>
            //   );
            // }

            return (
              <TableCell key={column.id} align={column.align}>
                {column.format && typeof value === 'number'
                  ? column.format(value)
                  : value}
              </TableCell>
            );
          })}
          {/* Edit and Delete icons with click handlers */}
          <TableCell align="center">
            <EditIcon
              onClick={() => handleEditClick(row)}
              style={{ cursor: 'pointer' }}
            />
          </TableCell>
          <TableCell align="center">
            <DeleteIcon
              onClick={() => handleDeleteClick(row)}
              style={{ cursor: 'pointer' }}
            />
          </TableCell>
        </TableRow>
      );
    })}
</TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
