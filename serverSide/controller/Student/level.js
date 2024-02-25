import pool from "../../config/db.js";


export const getTopicsBasedOnLanguage = async (req, res) => {
  const {syllabusId , languageName } = req.params;
  console.log(languageName);
  console.log(syllabusId);

  try {
    const query = `SELECT * FROM topics WHERE syllabus_id = ? AND lanName = ?`;
    const [results] = await pool.execute(query, [syllabusId, languageName]);

    res.json(results);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
export const getTopicsBasedOnSyllabusId = async (req, res) => {
  const {syllabusId  } = req.params;

  console.log(syllabusId);

  try {
    const query = `SELECT * FROM topics WHERE syllabus_id = ? `;
    const [results] = await pool.execute(query, [syllabusId]);
    res.json(results);
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getLevelAndQuestionNumForTopic = async (req, res) => {
  const { languageName, syllabusId , topic_name } = req.params;


  console.log(languageName);
  console.log(syllabusId);
  try {

    const LanANDTopicQuery = `
    SELECT id , language_id FROM topics 
    WHERE syllabus_id = ? AND lanName= ? AND topic_name = ?;
  `;
  const [rows] = await pool.execute(LanANDTopicQuery, [syllabusId, languageName, topic_name]);
    const query = `
      SELECT * FROM level 
      WHERE syllabus_id = ? AND language_id= ? AND topic_id = ?;
    `;
    const [results] = await pool.execute(query, [syllabusId,  rows[0].language_id , rows[0].id]);
    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching topics and levels:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

