import pool from '../../config/db.js';

export const queryStudentTable = async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE role = 'student'`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching students from database:', error);
    res.status(500).json({ error: 'Error fetching students from database' });
  }
};

export const getStudentByEmail = async (req, res) => {
  const { email } = req.params;
  try {
    const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (rows.length === 0) {
      // Previously this fell through to res.json(undefined), which sends a
      // 200 with an EMPTY body — that's what was causing "Unexpected end of
      // JSON input" crashes on the frontend. A real 404 lets the frontend
      // distinguish "not found" from "found" cleanly via response.ok.
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewStudent = async (req, res) => {
  const studentData = req.body;
  try {
    const { rows: userRows } = await pool.query(`
      INSERT INTO users (username, phone, email, password, address)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [studentData.username, studentData.phone, studentData.email, studentData.password, studentData.address]
    );
    const userId = userRows[0].id;

    const { rows: syllabusRows } = await pool.query(
      `SELECT id FROM syllabus WHERE syllabus_creator = 'CodeQuest' LIMIT 1`
    );
    if (syllabusRows.length === 0) throw new Error('Default syllabus not found');

    await pool.query(`
      INSERT INTO student (user_id, topic_id, level_id, question_id, completed, current_question)
      VALUES ($1, $2, $3, $4, FALSE, 1)`,
      [userId, 1, 1, 1]
    );

    res.status(201).json({ id: userId, ...studentData });
  } catch (error) {
    console.error('Error creating new student:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const updateStudent = async (req, res) => {
  const { user_id } = req.params;
  const { name, username, email, phone, address } = req.body;
  try {
    const { rowCount } = await pool.query(
      `UPDATE users SET username = $1, email = $2, phone = $3, address = $4 WHERE id = $5`,
      [name || username, email, phone, address, user_id]
    );
    if (rowCount === 1) {
      res.status(200).json({ message: 'Student record updated successfully' });
    } else {
      res.status(404).json({ error: 'Student not found' });
    }
  } catch (error) {
    console.error('Error updating student record:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

export const deleteStudent = async (req, res) => {
  const { email } = req.params;
  try {
    const { rows } = await pool.query(`
      SELECT s.id, s.user_id FROM student s
      JOIN users u ON s.user_id = u.id
      WHERE u.email = $1`,
      [email]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const { id: studentId, user_id: userId } = rows[0];

    const { rowCount: r1 } = await pool.query(`DELETE FROM student WHERE id = $1`, [studentId]);
    const { rowCount: r2 } = await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

    if (r1 === 1 && r2 === 1) {
      res.status(200).json({ message: 'The student and user deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete student and user' });
    }
  } catch (error) {
    console.error('Error deleting student and user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getPointsForStudent = async (req, res) => {
  const { user_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT "Points" FROM student WHERE user_id = $1`,
      [user_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No points found for the user_id' });
    res.status(200).json({ points: rows[0].Points });
  } catch (error) {
    console.error('Error fetching points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePointsFoStudent = async (req, res) => {
  const { user_id } = req.params;
  const { points } = req.body;
  try {
    await pool.query(
      `UPDATE student SET "Points" = $1 WHERE user_id = $2`,
      [points, user_id]
    );
    res.status(200).json({ message: 'Points updated successfully', points });
  } catch (error) {
    console.error('Error updating points:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};