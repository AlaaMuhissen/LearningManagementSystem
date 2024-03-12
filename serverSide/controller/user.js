import pool from "../config/db.js";

export const fetchUserProfile = async (req , res) => {

    const {userId} = req.params;
    try { 
      const [userData] = await pool.execute(`
      SELECT u.username, u.email, u.password, u.phone, u.address, u.role,
             s.syllbusNum, s.pimarySyllbus_id, s.resTeacherNum, s.Points
      FROM users u
      JOIN student s ON u.id = s.user_id
      WHERE u.id = ${userId};
    `, [userId]);
      console.log(userData)
      res.status(200).json(userData[0]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  