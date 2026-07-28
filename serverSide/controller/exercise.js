import pool from '../config/db.js';

export const getAllExercises = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM exercise ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getExerciseById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM exercise WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching exercise ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewExercise = async (req, res) => {
  const { description, code, grade = 0, lessonid, language, level = 1 } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO exercise (lesson_id, description, code, grade, language, level)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [lessonid, description, code, grade, language, level]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateExerciseDetails = async (req, res) => {
  const { id } = req.params;
  const { description, code, grade, lessonid } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE exercise SET description = $1, code = $2, grade = $3, lesson_id = $4 WHERE id = $5 RETURNING *`,
      [description, code, grade, lessonid, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteExercise = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM exercise WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Exercise not found' });
    res.json({ message: 'The exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};