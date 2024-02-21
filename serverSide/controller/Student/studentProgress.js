import pool from '../../config/db.js';


export const insertStudentProgress = async (req, res) => {
    const { studentId , syllabus_id } = req.params;
    console.log(studentId);
    console.log(syllabus_id);
  
    try {
  
      const [topicsRows] = await pool.query(`SELECT * FROM syllabus_topic
      WHERE syllabus_id = ?`, [syllabus_id]);
      console.log(topicsRows);
  
 
      for (const row of topicsRows) {
        const { id: id, language_id } = row;
      
        const studentProgressQuery = `
        INSERT INTO student_progress (student_id, syllabus_id, language_id, started, finished)
        VALUES (?, ?, ?, ?, ?)
        `;
        const studentProgressData = [studentId,syllabus_id, language_id, 0, 0];
        await pool.query(studentProgressQuery, studentProgressData);
              }
          
      console.log('Transaction committed successfully');
      res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting student progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};


export const editStudentProgress = async (req, res) => {
  const { studentId , syllabus_id } = req.params;
  console.log(studentId);
  console.log(syllabus_id);

  try {

    const [topicsRows] = await pool.query(`SELECT * FROM topics
    WHERE syllabus_id = ?`, [syllabus_id]);
    console.log(topicsRows);

    for (const row of topicsRows) {
      const { id: topicId, topic_name, levelNum, lanName } = row;

      const studentProgressQuery = `
        INSERT INTO student_progress (student_id, level_id, completed, current_question, syllabus_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      const studentProgressData = [studentId, 1, 0, 0, syllabus_id];
      await pool.query(studentProgressQuery, studentProgressData);
 
    
      const languageProgressQuery = `
        INSERT INTO language_progress (name, student_id, syllabus_id)
        VALUES (?,?, ?)
      `;
      await pool.query(languageProgressQuery, [lanName, studentId, syllabus_id]);

      const topicProgressQuery = `
        INSERT INTO topic_progress (student_id, syllabus_id, name, topicSyllabus_id)
        VALUES (?, ?, ?, ?)
      `;
      const topicProgressData = [studentId, syllabus_id, topic_name, topicId];
      await pool.query(topicProgressQuery, topicProgressData);

     
      const levelProgressQuery = `
        INSERT INTO level_progress (name,student_id, syllabus_id,  levelSyllabus_id, completed, current_question)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const levelProgressData = ["level1", studentId, syllabus_id, levelNum, 0, 0];
      await pool.query(levelProgressQuery, levelProgressData);
    }

    console.log('Transaction committed successfully');
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error inserting student progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const updateLanguageStatus = async (req, res) => {
  const { student_id } = req.params; 
  const {  syllabus_id, language_id,started , finished } = req.body;

  try {
      const query = `
          UPDATE student_progress
          SET started = ? AND finished = ?
          WHERE student_id = ? AND language_id = ? AND syllabus_id = ?
      `;
      
      await pool.query(query, [started,finished ,student_id, language_id, syllabus_id]);
      
      res.status(200).json({ message: 'Language finish status updated successfully' });
  } catch (error) {
      console.error('Error Editing progress data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLanguageStatus = async (req, res) => {
  const { student_id ,language_id , syllabus_id} = req.params; 
  try {
      const query = `
          SELECT  started, finished  FROM student_progress
          WHERE student_id = ? AND language_id = ? AND syllabus_id = ?
      `;
      
      await pool.query(query, [student_id, language_id ,syllabus_id]);
      
      res.status(200).json({ message: 'Fetching Language status  done successfully' });
  } catch (error) {
      console.error('Error Fetching progress data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkAndUpdateProgress = async(req, res) => {
  const { student_id, syllabus_id, language_id, topic_name ,level, questionNum} = req.body;
  
  try{
    const studentIdQuery = `SELECT id FROM student WHERE user_id = ?`;
  
    const [student] = await pool.query(studentIdQuery, [student_id]);
    const studentId = student[0].id;
    console.log(studentId)
    const studentProgressQuery = `SELECT * FROM student_progress WHERE student_id = ? AND syllabus_id = ? AND language_id = ?`;
    const [studentProgressResults] = await pool.query(studentProgressQuery, [studentId, syllabus_id, language_id]);

    if (studentProgressResults.length !== 0) {
      // If row found, update the started column
      const updateStudentProgressQuery = `UPDATE student_progress SET started = 1 WHERE student_id = ? AND syllabus_id = ? AND language_id = ?`;
      await pool.query(updateStudentProgressQuery, [studentId, syllabus_id, language_id]);
    } else {
      const insertStudentProgressQuery = `INSERT INTO student_progress (student_id, syllabus_id, language_id, started, finished) VALUES (?, ?, ?, 1, 0)`;
      await pool.query(insertStudentProgressQuery, [studentId, syllabus_id, language_id]);
    }

    const topicProgressQuery = `SELECT id FROM topic_progress WHERE student_id = ? AND syllabus_id = ? AND language_id = ? AND topicName = ?`;
  
    const [topicResults] = await pool.query(topicProgressQuery, [studentId, syllabus_id, language_id, topic_name]);
    console.log(topicResults)
   
        if (topicResults.length === 0) {
            const insertTopicProgressQuery = `INSERT INTO topic_progress (student_id, syllabus_id, language_id, topicName) VALUES (?, ?, ?, ?)`;
            const [topicProgress] = await pool.query(insertTopicProgressQuery, [studentId, syllabus_id, language_id, topic_name]);
            console.log(topicProgress.insertId);
            checkOrUpdateLevelProgress(req, res,topicProgress.insertId ,studentId);
         }
         else {
         
           checkOrUpdateLevelProgress(req, res , topicResults[0].id,studentId);
        }
  }catch(err){
    console.log(err)
 }

};


const checkOrUpdateLevelProgress = async (req, res, topic_id, student_id) => {
  const { syllabus_id, language_id, level, questionNum } = req.body;

  try {
    // Check if there is a row with the same student_id, syllabus_id, language_id, and topic_id in level_progress table
    const levelProgressQuery = `
      SELECT id, currQuestion 
      FROM level_progress 
      WHERE student_id = ? 
      AND syllabus_id = ? 
      AND language_id = ? 
      AND topic_id = ? 
      AND level_id = ?
    `;
    const [levelResults] = await pool.query(levelProgressQuery, [student_id, syllabus_id, language_id, topic_id, parseInt(level)]);

    if (levelResults.length !== 0) {
      const { id, currQuestion } = levelResults[0];
      const updatedCurrQuestion = currQuestion + 1;

      // Update the completed boolean to 1 if all questions in the level are completed
      if (updatedCurrQuestion >= questionNum) {
        const updateLevelStatusQuery = `UPDATE level_progress SET completed = 1 WHERE id = ?`;
        await pool.query(updateLevelStatusQuery, [id]);
      }

      // Update the currQuestion value
      const updateLevelProgressQuery = `UPDATE level_progress SET currQuestion = ? WHERE id = ?`;
      const [updateRow] = await pool.query(updateLevelProgressQuery, [updatedCurrQuestion, id]);

      res.status(200).json(updateRow);
    } else {
      // If no row found, create one
      const insertLevelProgressQuery = `
        INSERT INTO level_progress 
          (student_id, syllabus_id, language_id, topic_id, level_id, currQuestion, completed) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [newLevelRow] = await pool.query(insertLevelProgressQuery, [student_id, syllabus_id, language_id, topic_id, parseInt(level), 0, 0]);

      res.status(200).json(newLevelRow);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getQuestionsNum = async (req, res) => {
  const { syllabus_id, language_id, current_Level } = req.body;

  try {
      // Query the database to get the questionsNum
      const query = `
          SELECT questionsNum
          FROM level
          WHERE syllabus_id = ? AND language_id = ? AND current_Level = ?
      `;
      const [rows] = await pool.query(query, [syllabus_id, language_id, current_Level]);

      if (rows.length === 0) {
          return res.status(404).json({ error: "No data found" });
      }

      const questionsNum = rows[0].questionsNum;
      return res.status(200).json({ questionsNum });
  } catch (error) {
      console.error("Error retrieving questionsNum:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const getTopicStatus = async (req, res) => {
  const { syllabus_id, language_id, topicName , student_id} = req.params;

  try {
    const studentIdQuery = `SELECT id FROM student WHERE user_id = ?`;
  
    const [student] = await pool.query(studentIdQuery, [student_id]);
    const studentId = student[0].id;
      // Query the database to get the questionsNum
      const query = `
          SELECT completed
          FROM topic_progress
          WHERE student_id = ? AND syllabus_id = ? AND language_id = ? AND topicName= ?
      `;
      const [rows] = await pool.query(query, [studentId, syllabus_id, language_id, topicName]);

      if (rows.length === 0) {
          return res.status(404).json({ error: "No data found" });
      }

      const completedStatus = rows[0].completed;

      return res.status(200).json({ isTopicCompleted: completedStatus === 1 ? true : false });
  } catch (error) {
      console.error("Error retrieving questionsNum:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTopicProgress = async (req, res) => {
  const { student_id, syllabus_id, language_id, topic_name } = req.body;
  console.log(student_id, syllabus_id, language_id, topic_name);
  try {
    // Get the topic_id for the given topic_name
    const topicQuery = `
      SELECT id
      FROM topic_progress
      WHERE topicName = ? AND syllabus_id = ? AND language_id = ?
    `;
    const [topicResult] = await pool.query(topicQuery, [topic_name, syllabus_id, language_id]);

    if (topicResult.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const topic_id = topicResult[0].id;
    console.log(topic_id);

    // Update the completed field in topic_progress table to true
    const updateTopicProgressQuery = `
      UPDATE topic_progress 
      SET completed = TRUE 
      WHERE student_id = ? 
      AND syllabus_id = ? 
      AND language_id = ? 
      AND id = ?
    `;
    await pool.query(updateTopicProgressQuery, [student_id, syllabus_id, language_id, topic_id]);

    return res.status(200).json({ message: "Topic progress updated successfully" });
  } catch (error) {
    console.error("Error updating topic progress:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const updateLevelProgress = async (req, res, student_id) => {
  const { syllabus_id, language_id, topic_name } = req.body;
  
  console.log(student_id, syllabus_id, language_id, topic_name);
  try {
    // Get the current level_id
    const getCurrentLevelQuery = `
      SELECT MAX(level_id) AS max_level_id
      FROM level_progress 
      WHERE student_id = ? 
      AND syllabus_id = ? 
      AND language_id = ? 
      AND topic_id IN (
        SELECT id
        FROM topic_progress
        WHERE topicName = ? AND syllabus_id = ? AND language_id = ?
      )
    `;
    const [currentLevelRows] = await pool.query(getCurrentLevelQuery, [student_id, syllabus_id, language_id, topic_name, syllabus_id, language_id]);
    const currentLevel = currentLevelRows[0].max_level_id;
    console.log(currentLevel);

    // Get the levelNum for the topic
    const levelNum = await getLevelNum(req, res);

    if (currentLevel + 1 > levelNum) {
      return res.status(200).json({ message: "All levels completed for the topic" });
    } else {
      // Insert a new row with incremented level_id
      const insertQuery = `
        INSERT INTO level_progress 
        (student_id, syllabus_id, language_id, topic_id, level_id, currQuestion, completed) 
        SELECT ?, ?, ?, id, ?, ?, FALSE
        FROM topic_progress
        WHERE topicName = ? AND syllabus_id = ? AND language_id = ?
      `;
      await pool.query(insertQuery, [student_id, syllabus_id, language_id, currentLevel + 1, 0, topic_name, syllabus_id, language_id]);
  
      return;
    }
  } catch (error) {
    console.error("Error updating level progress:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLevelNum = async (req, res) => {
  const { syllabus_id, language_id, topic_name } = req.body;

  try {
      // Query the database to get the questionsNum
      const query = `
          SELECT levelNum
          FROM topics
          WHERE syllabus_id = ? AND language_id = ? AND topic_name = ?
      `;
      const [rows] = await pool.query(query, [syllabus_id, language_id, topic_name]);

      if (rows.length === 0) {
          return res.status(404).json({ error: "No data found" });
      }

      const levelNum = rows[0].levelNum;
      return  levelNum ;
  } catch (error) {
      console.error("Error retrieving levelNum:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

