import pool from '../../config/db.js';


export const insertStudentProgress = async (req, res) => {
    const { studentId , syllabus_id } = req.params;
  
    try {
  
      const [topicsRows] = await pool.query(`SELECT * FROM syllabus_topic
      WHERE syllabus_id = ?`, [syllabus_id]);
      console.log(topicsRows);
      const randomId = Math.floor(Math.random() * 1000000);
 
      for (const row of topicsRows) {
        const { id: id, language_id } = row;
      
        const studentProgressQuery = `
        INSERT INTO student_progress (id,student_id, syllabus_id, language_id, started, finished)
        VALUES (?,?, ?, ?, ?, ?)
        `;
        const studentProgressData = [randomId,studentId,syllabus_id, language_id, 0, 0];
        await pool.query(studentProgressQuery, studentProgressData);
              }
          

      res.status(200).json({ message: 'Data inserted successfully' });
    } catch (error) {
      console.error('Error inserting student progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
};


export const editStudentProgress = async (req, res) => {
  const { studentId , syllabus_id } = req.params;
 
  try {

    const [topicsRows] = await pool.query(`SELECT * FROM topics
    WHERE syllabus_id = ?`, [syllabus_id]);
    const randomId = Math.floor(Math.random() * 1000000);
    for (const row of topicsRows) {
      const { id: topicId, topic_name, levelNum, lanName } = row;

      const studentProgressQuery = `
        INSERT INTO student_progress (id,student_id, level_id, completed, current_question, syllabus_id)
        VALUES (?,?, ?, ?, ?, ?)
      `;
      const studentProgressData = [randomId, studentId, 1, 0, 0, syllabus_id];
      await pool.query(studentProgressQuery, studentProgressData);
 
    
      const languageProgressQuery = `
        INSERT INTO language_progress (id,name, student_id, syllabus_id)
        VALUES (?,?,?, ?)
      `;
      await pool.query(languageProgressQuery, [(randomId+1),lanName, studentId, syllabus_id]);

    
      const topicProgressQuery = `
        INSERT INTO topic_progress (id,student_id, syllabus_id, name, topicSyllabus_id)
        VALUES (?,?, ?, ?, ?)
      `;
      const topicProgressData = [(randomId+2),studentId, syllabus_id, topic_name, topicId];
      await pool.query(topicProgressQuery, topicProgressData);

      const levelProgressQuery = `
        INSERT INTO level_progress (id,name,student_id, syllabus_id,  levelSyllabus_id, completed, current_question)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const levelProgressData = [(randomId+3),"level1", studentId, syllabus_id, levelNum, 0, 0];
      await pool.query(levelProgressQuery, levelProgressData);
    }

 
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
    const studentIdQuery = `SELECT id FROM student WHERE user_id = ?`;
  
    const [student] = await pool.query(studentIdQuery, [student_id]);
    const studentId = student[0].id;
   
      const query = `
          SELECT  started, finished  FROM student_progress
          WHERE student_id = ? AND language_id = ? AND syllabus_id = ?
      `;
      const [status] = await pool.query(query, [studentId, language_id ,syllabus_id]);
     
      
      res.status(200).json(status);
  } catch (error) {
      console.error('Error Fetching progress data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopicProgress = async (req, res) => {
  const { student_id ,syllabus_id , language_id} = req.params; 
  try {
    const studentIdQuery = `SELECT id FROM student WHERE user_id = ?`;
  
    const [student] = await pool.query(studentIdQuery, [student_id]);
    const studentId = student[0].id;

      const query = `
          SELECT  *  FROM topic_progress
          WHERE student_id = ? AND syllabus_id = ? AND language_id = ?  
      `;
      
      const [topicProgress]= await pool.query(query, [studentId, syllabus_id , language_id]);
      
      res.status(200).json(topicProgress);
  } catch (error) {
      console.error('Error Fetching progress data:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
};
export const ifThereIsStatus = async (req, res) => {
  const { student_id ,syllabus_id } = req.params; 
  try {
    const studentIdQuery = `SELECT id FROM student WHERE user_id = ?`;
  
    const [student] = await pool.query(studentIdQuery, [student_id]);
    const studentId = student[0].id;

      const query = `
          SELECT  *  FROM language_progress
          WHERE student_id = ? AND syllabus_id = ?
      `;
      
      const [languageProgress]= await pool.query(query, [studentId, syllabus_id]);
      const isThereProgress = languageProgress.some((lan)=> lan.started === 1);
      if(isThereProgress){
        res.status(200).json(true);
      }
      else{
        res.status(200).json(false);
      }
      
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
 
    const studentProgressQuery = `SELECT * FROM student_progress WHERE student_id = ? AND syllabus_id = ? AND language_id = ?`;
    const [studentProgressResults] = await pool.query(studentProgressQuery, [studentId, syllabus_id, language_id]);

    if (studentProgressResults.length !== 0) {
     
      const updateStudentProgressQuery = `UPDATE student_progress SET started = 1 WHERE student_id = ? AND syllabus_id = ? AND language_id = ?`;
      await pool.query(updateStudentProgressQuery, [studentId, syllabus_id, language_id]);
    } else {
      const randomId = Math.floor(Math.random() * 1000000);
      const insertStudentProgressQuery = `INSERT INTO student_progress (id,student_id, syllabus_id, language_id, started, finished) VALUES (?, ?, ?, ?, 1, 0)`;
      await pool.query(insertStudentProgressQuery, [randomId, studentId, syllabus_id, language_id]);
    }

    const topicProgressQuery = `SELECT id FROM topic_progress WHERE student_id = ? AND syllabus_id = ? AND language_id = ? AND topicName = ?`;
  
    const [topicResults] = await pool.query(topicProgressQuery, [studentId, syllabus_id, language_id, topic_name]);
 
    const randomId = Math.floor(Math.random() * 1000000);
        if (topicResults.length === 0) {
            const insertTopicProgressQuery = `INSERT INTO topic_progress (id, student_id, syllabus_id, language_id, topicName) VALUES (?,?, ?, ?, ?)`;
            const [topicProgress] = await pool.query(insertTopicProgressQuery, [randomId, studentId, syllabus_id, language_id, topic_name]);
            
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

      if (updatedCurrQuestion === questionNum || updatedCurrQuestion > questionNum) {
        const updateLevelStatusQuery = `
          UPDATE level_progress 
          SET completed = 1, currQuestion = ? 
          WHERE id = ?
        `;
        await pool.query(updateLevelStatusQuery, [questionNum, id]);
      } else {
        const updateLevelProgressQuery = `
          UPDATE level_progress 
          SET currQuestion = ? 
          WHERE id = ?
        `;
        await pool.query(updateLevelProgressQuery, [updatedCurrQuestion, id]);
      }

      res.status(200).json({ message: 'Level progress updated successfully' });
    } else {
      const randomId = Math.floor(Math.random() * 1000000);
      const insertLevelProgressQuery = `
        INSERT INTO level_progress 
          (id, student_id, syllabus_id, language_id, topic_id, level_id, currQuestion, completed) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [newLevelRow] = await pool.query(insertLevelProgressQuery, [randomId, student_id, syllabus_id, language_id, topic_id, parseInt(level), 1, 0]);

      if (questionNum === 1) {
        const updateLevelStatusQuery = `
          UPDATE level_progress 
          SET completed = 1 
          WHERE id = ?
        `;
        await pool.query(updateLevelStatusQuery, [randomId]);
      }

      res.status(200).json({ message: 'New level progress created successfully' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getQuestionsNum = async (req, res) => {
  const { syllabus_id, language_id, topic_id, current_Level } = req.params;

  try {
      // Query the database to get the questionsNum
      const query = `
          SELECT questionsNum
          FROM level
          WHERE syllabus_id = ? AND language_id = ? AND current_Level = ? AND topic_id = ?
      `;
      const [rows] = await pool.query(query, [syllabus_id, language_id, current_Level ,topic_id]);
      const questionsNum = rows[0]?.questionsNum || 0;
      
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
    const studentId = student[0]?.id;
      // Query the database to get the questionsNum
      const query = `
          SELECT completed
          FROM topic_progress
          WHERE student_id = ? AND syllabus_id = ? AND language_id = ? AND topicName= ?
      `;
      const [rows] = await pool.query(query, [studentId, syllabus_id, language_id, topicName]);

      if (rows.length === 0) {
        return res.status(200).json({ isTopicCompleted: false });
      }

      const completedStatus = rows[0].completed;

      return res.status(200).json({ isTopicCompleted: completedStatus === 1 ? true : false });
  } catch (error) {
      console.error("Error retrieving questionsNum:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLevelStatus = async (req, res) => {
  const { syllabus_id, language_id, topic_name , level_id, student_id} = req.params;
 
  try {
    const studentIdQuery = `SELECT id FROM student WHERE user_id = ?`;
  
    const [student] = await pool.execute(studentIdQuery, [student_id]);
    const studentId = student[0]?.id;
    const topicIdQuery = `SELECT id FROM topic_progress WHERE topicName = ?`;
  
    const [topic] = await pool.query(topicIdQuery, [topic_name]);
    const topic_id = topic[0]?.id;

    if(!topic_id){
      return res.status(200).json({ isTopicCompleted: false , currQuestion :0 });
    }
      // Query the database to get the questionsNum
      const query = `
          SELECT completed , currQuestion
          FROM level_progress
          WHERE student_id = ? AND syllabus_id = ? AND language_id = ? AND topic_id= ? AND level_id= ?
      `;
      const [rows] = await pool.query(query, [studentId, syllabus_id, language_id, topic_id , level_id]);

      if (rows.length === 0) {
        return res.status(200).json({ isTopicCompleted: false , currQuestion :0 });
      }

      const completedStatus = rows[0].completed;
      const currQues = rows[0].currQuestion;

      return res.status(200).json({ isTopicCompleted: completedStatus === 1 ? true : false , currQuestion: completedStatus === 1 ? currQues : 0 });
  } catch (error) {
      console.error("Error retrieving questionsNum:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTopicProgress = async (req, res) => {
  const { student_id, syllabus_id, language_id, topic_name } = req.body;
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

    // Get the levelNum for the topic
    const levelNum = await getLevelNum(req, res);

    if (currentLevel + 1 > levelNum) {
      return res.status(200).json({ message: "All levels completed for the topic" });
    } else {
      // Insert a new row with incremented level_id
      const randomId = Math.floor(Math.random() * 1000000);
      const insertQuery = `
        INSERT INTO level_progress 
        (id, student_id, syllabus_id, language_id, topic_id, level_id, currQuestion, completed) 
        SELECT ?, ?, ?, id, ?, ?, FALSE
        FROM topic_progress
        WHERE topicName = ? AND syllabus_id = ? AND language_id = ?
      `;
      await pool.query(insertQuery, [randomId,student_id, syllabus_id, language_id, currentLevel + 1, 1, topic_name, syllabus_id, language_id]);
  
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

export const getLevelProgress = async (req, res) =>{
    const {student_id ,syllabus_id,topic_id } = req.params;
    try{
      const studentIdQuery = `SELECT id FROM student WHERE user_id = ?`;
    
      const [student] = await pool.query(studentIdQuery, [student_id]);
      const studentId = student[0].id;

      const query = `
          SELECT *
          FROM level_progress
          WHERE student_id = ?
          AND syllabus_id = ?
          AND topic_id = ?
      `;
      const [rows] = await pool.query(query, [studentId ,  syllabus_id,topic_id]);
      console.log(rows);
      if (rows.length === 0) {
          return res.status(404).json({ error: "No data found" });
      }
      res.status(200).json(rows) ;
      
    }catch (error) {
      console.error("Error fetching rows:", error);
      return res.status(500).json({ error: "Internal server error" });
  }

}

