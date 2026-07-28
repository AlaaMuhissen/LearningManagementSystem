import pool from '../config/db.js';

export const fetchUserProfile = async (req, res) => {
  const { userId } = req.params;

  try {
    // Use $1 parameterized query — never interpolate user input directly into SQL
    const { rows } = await pool.query(`
      SELECT u.username, u.email, u.phone, u.address, u.role,
             s."syllbusNum", s."pimarySyllbus_id", s."resTeacherNum", s."Points"
      FROM users u
      JOIN student s ON u.id = s.user_id
      WHERE u.id = $1
    `, [userId]);
  
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};