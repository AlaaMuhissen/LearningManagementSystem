import pool from '../../config/db.js';

export const getTopicsBasedOnLanguage = async (req, res) => {
  const { syllabusId, languageName } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM topics WHERE syllabus_id = $1 AND "lanName" = $2`,
      [syllabusId, languageName]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getTopicsBasedOnSyllabusId = async (req, res) => {
  const { syllabusId } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT * FROM topics WHERE syllabus_id = $1`,
      [syllabusId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getLevelAndQuestionNumForTopic = async (req, res) => {
  const { languageName, syllabusId, topic_name } = req.params;
  try {
    const { rows: topicRows } = await pool.query(
      `SELECT id, language_id FROM topics
       WHERE syllabus_id = $1 AND "lanName" = $2 AND topic_name = $3`,
      [syllabusId, languageName, topic_name]
    );
    if (topicRows.length === 0) return res.status(404).json({ error: 'Topic not found' });

    const { rows } = await pool.query(
      `SELECT * FROM level
       WHERE syllabus_id = $1 AND language_id = $2 AND topic_id = $3`,
      [syllabusId, topicRows[0].language_id, topicRows[0].id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching topics and levels:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};