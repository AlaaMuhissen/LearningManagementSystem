
import pool from "../config/db.js";

export const getSyllabus = async (req, res) => {
    const { syllabus_creator } = req.params;
  
    try {
      const [results] = await pool.execute(
        `SELECT t.*, s.* FROM syllabus_topic t
        JOIN syllabus s ON t.syllabus_id = s.id
        WHERE s.syllabus_creator = ?`,
        [syllabus_creator]
      );
  
      res.json(results);
    } catch (error) {
      console.error('Error fetching syllabus:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };


  export const getLanguageIdByLanguageName = async (req, res) => {
    const { syllabus_id, lanName } = req.params; 
    try {
      const query = `
          SELECT language_id FROM syllabus_topic WHERE lanName = ? AND syllabus_id = ?
      `;
  
      const [rows] = await pool.query(query, [lanName, syllabus_id]);
      res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };