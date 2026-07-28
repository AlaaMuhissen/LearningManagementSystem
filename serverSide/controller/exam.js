import pool from '../config/db.js';

export const getAllExams = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM exam ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getExamById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM exam WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching exam ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewExam = async (req, res) => {
  const { description, grade = 100, exerciseids, syllabus_id = 1, time_limit, language } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO exam (syllabus_id, description, grade, exercise_ids, time_limit, language)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [syllabus_id, description, grade, JSON.stringify(exerciseids), time_limit, language]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateExamDetails = async (req, res) => {
  const { id } = req.params;
  const { description, grade, exerciseids } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE exam SET description = $1, grade = $2, exercise_ids = $3 WHERE id = $4 RETURNING *`,
      [description, grade, JSON.stringify(exerciseids), id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteExam = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM exam WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Exam not found' });
    res.json({ message: 'The exam deleted successfully' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};