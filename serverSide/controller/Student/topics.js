import pool from "../../config/db.js";


export const getTopicsBasedOnLanguage = async (req, res) => {
  const {syllabusId , languageName } = req.params;
  console.log(languageName);
  console.log(syllabusId);

  try {
    const query = `SELECT topic_name FROM topics WHERE syllabus_id = ? AND lanName = ?`;
    const [results] = await pool.execute(query, [syllabusId, languageName]);

    res.json(results);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getLevelAndQuestionNumForTopic = async (req, res) => {
  const { languageName, syllabusId } = req.params;
  console.log(languageName);
  console.log(syllabusId);
  try {
    const query = `
      SELECT t.id AS language_id, t.topic_name, t.syllabus_id AS topic_syllabus_id, t.levelNum, t.lanName,
             l.id AS level_id, l.current_Level, l.questionsNum, l.syllabus_id AS level_syllabus_id
      FROM topics t
      JOIN level l ON t.language_id = l.language_id AND t.syllabus_id = l.syllabus_id
      WHERE t.syllabus_id = ? AND t.lanName = ?;
    `;
    const [results] = await pool.execute(query, [syllabusId, languageName]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching topics and levels:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

