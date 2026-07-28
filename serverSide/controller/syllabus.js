import pool from '../config/db.js';

export const getSyllabus = async (req, res) => {
  const { syllabus_creator } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT t.*, s.* FROM syllabus_topic t
       JOIN syllabus s ON t.syllabus_id = s.id
       WHERE s.syllabus_creator = $1`,
      [syllabus_creator]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching syllabus:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getLanguageIdByLanguageName = async (req, res) => {
  const { syllabus_id, lanName } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT language_id FROM syllabus_topic WHERE "lanName" = $1 AND syllabus_id = $2`,
      [lanName, syllabus_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching language id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLanguagesNameFromSyllabus = async (req, res) => {
  const { syllabus_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT "lanName" FROM syllabus_topic WHERE syllabus_id = $1`,
      [syllabus_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching language names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};