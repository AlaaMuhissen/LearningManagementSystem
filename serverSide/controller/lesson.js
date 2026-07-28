import pool from '../config/db.js';

export const getAllLessons = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM lesson ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getLessonById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM lesson WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error(`Error fetching lesson ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createNewLesson = async (req, res) => {
  const { subject, description, code, syllabus_id = 1, language } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO lesson (syllabus_id, subject, description, code, language)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [syllabus_id, subject, description, code, language]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateLessonDetails = async (req, res) => {
  const { id } = req.params;
  const { subject, description, code } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE lesson SET subject = $1, description = $2, code = $3 WHERE id = $4 RETURNING *`,
      [subject, description, code, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const deleteLesson = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('DELETE FROM lesson WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'The lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};