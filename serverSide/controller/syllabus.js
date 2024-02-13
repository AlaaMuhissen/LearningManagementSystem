
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