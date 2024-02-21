
import pool from '../../config/db.js';
import {  createUserWithEmailAndPassword } from "firebase/auth";
// import {auth} from '../../../clientSide/src/config/firebase.js'
/** Retrieves all students from the database */
export const queryStudentTable = async (req, res) => {
  try {
    const [results] = await pool.execute('SELECT * FROM Users WHERE role = "student"');
    res.json(results);
  } catch (error) {
    console.error('Error fetching students from database:', error);
    res.status(500).json({ error: 'Error fetching students from database' });
  }
};


/** Retrieves a specific student by email */
export const getStudentByEmail = async (req, res) => {
  const { email } = req.params;

  try {

    // Construct SQL query to fetch student by email
    const [result] = await pool.execute(`SELECT * FROM Users WHERE email = ?`, 
    [email]
    );
    console.log(`result is ${result}`)
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**Creates a new student */
export const createNewStudent = async (req, res) => {
  const studentData = req.body;

  try {
    // Insert new student data into the MySQL database
    const [result] = await pool.execute(`
      INSERT INTO Users (username, phone, email, password, address)
      VALUES (?, ?, ?, ?, ?)`, 
      [studentData.username, studentData.phone, studentData.email, studentData.password, studentData.address]
    );

    console.log('New student created:', result);
    // Get the inserted user ID
    const userId = result.insertId;

    // Get the default syllabus ID
    const [syllabusResult] = await pool.execute(`
      SELECT id FROM syllabus WHERE syllabus_creator = 'main' LIMIT 1`
    );

    if (syllabusResult.length === 0) {
      throw new Error('Default syllabus not found');
    }
    // createUserWithEmailAndPassword(auth, studentData.email, studentData.password)
    // .then((userCredential) => {
    //   // Signed up 
    //   const user = userCredential.user;
    // })
    // .catch((error) => {
    //   console.log(error.message);
    // });
    // Insert the new student into the students table
    const [studentResult] = await pool.execute(`
      INSERT INTO student (user_id , topic_id, level_id, question_id, completed, current_question)
      VALUES (?,?, ?, ?, FALSE, 1)`,
      [userId, 1, 1, 1]
    );

    console.log('New student added to students table:', studentResult);



  //   const defaultSyllabusId = syllabusResult[0].id;

  //   // Fill the student progress with default syllabus
  const defaultSyllabusId = 1; 


    // Respond with the created student data
    res.status(201).json({ id: userId, ...studentData });
  } catch (error) {
    console.error('Error creating new student:', error);
    res.status(500).json({ error: 'Internal Server Error' , message: error.sqlMessage });
  }
};

/**Updates details of a specific student by ID */  
export const updateStudent = async (req, res) => {
  const { user_id } = req.params; 
  const updateFields = req.body; // Data to update

  try {
    // Construct the SET clause dynamically based on the fields provided in the request body
    let setClause = '';
    const values = [];
    Object.keys(updateFields).forEach((key, index) => {
      if (index !== 0) setClause += ', ';
      setClause += `${key} = ?`;
      values.push(updateFields[key]);
    });

    // Update the student record in the MySQL database
    const [result] = await pool.execute(`
      UPDATE student
      SET ${setClause}
      WHERE user_id = ?`,
      [...values, user_id]
    );

    // Check if the student record was successfully updated
    if (result.affectedRows === 1) {
      console.log('Student record updated successfully');
      res.status(200).json({ message: 'Student record updated successfully' });
    } else {
      console.error('Failed to update student record');
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    console.error('Error updating student record:', error);
    res.status(500).json({ error: 'Internal Server Error' , message: error.sqlMessage });
  }
};

/**Deletes a specific student by ID */
export const deleteStudent = async (req, res) => {
  const { email } = req.params;

  try {
    // Get the student_id associated with the email from the students table
    const [getStudentResult] = await pool.execute(`
      SELECT id, user_id
      FROM student
      WHERE user_id = (
        SELECT id
        FROM Users
        WHERE email = ?
      )`,
      [email]
    );

    // Check if a student with the specified email exists
    if (getStudentResult.length === 0) {
      console.error('Student not found');
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const { id: studentId, user_id: userId } = getStudentResult[0];

    // Delete the student from the students table
    const [deleteStudentResult] = await pool.execute(`
      DELETE FROM student
      WHERE id = ?`,
      [studentId]
    );

    // Delete the user from the users table
    const [deleteUserResult] = await pool.execute(`
      DELETE FROM Users
      WHERE id = ?`,
      [userId]
    );

    // Check if the student and user were successfully deleted from all tables
    if (deleteStudentResult.affectedRows === 1 && deleteUserResult.affectedRows === 1) {
      // Successfully deleted from all tables
      console.log('Student and user deleted successfully');
      res.status(200).json({ message: 'The student and user deleted successfully' });
    } else {
      console.error('Failed to delete student and user');
      res.status(500).json({ error: 'Failed to delete student and user' });
    }
  } catch (error) {
    console.error('Error deleting student and user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPointsForStudent = async (req, res) => {
  
  const { user_id } = req.params;
  console.log(user_id);
  try {
    const query = `
      SELECT Points
      FROM student
      WHERE user_id = ?
    `;
    const [rows] = await pool.query(query, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "No points found for the user_id" });
    }
    const points = rows[0].Points;
    return res.status(200).json({ points });
  } catch (error) {
    console.error("Error fetching points:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const updatePointsFoStudent = async (req, res) => {
  const { user_id } = req.params;
  const { points } = req.body;

  try {
    const updateQuery = `
      UPDATE student
      SET Points = ?
      WHERE user_id = ?
    `;
    await pool.query(updateQuery, [points, user_id]);
    return res.status(200).json({ message: "Points updated successfully" });
  } catch (error) {
    console.error("Error updating points:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



