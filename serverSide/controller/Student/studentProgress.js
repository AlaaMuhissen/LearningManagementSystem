import pool from '../../config/db.js';

export const insertStudentProgress = async (req, res) => {
    const { studentId , syllabus_id } = req.params;
    console.log(studentId);
    console.log(syllabus_id);
  
    try {
      // Fetch topics from topics table
      const [topicsRows] = await pool.query(`SELECT * FROM topics
      WHERE syllabus_id = ?`, [syllabus_id]);
      console.log(topicsRows);
  
 
      for (const row of topicsRows) {
        const { id: topicId, topic_name, levelNum, lanName } = row;
  
        // Insert records into student_progress table
        const studentProgressQuery = `
          INSERT INTO student_progress (student_id, level_id, completed, current_question, syllabus_id)
          VALUES (?, ?, ?, ?, ?)
        `;
        const studentProgressData = [studentId, 1, 0, 0, syllabus_id];
        await pool.query(studentProgressQuery, studentProgressData);
   
        // Insert records into language_progress table
        const languageProgressQuery = `
          INSERT INTO language_progress (name, student_id, syllabus_id)
          VALUES (?,?, ?)
        `;
        await pool.query(languageProgressQuery, [lanName, studentId, syllabus_id]);
  
        // Insert records into topic_progress table
        const topicProgressQuery = `
          INSERT INTO topic_progress (student_id, syllabus_id, name, topicSyllabus_id)
          VALUES (?, ?, ?, ?)
        `;
        const topicProgressData = [studentId, syllabus_id, topic_name, topicId];
        await pool.query(topicProgressQuery, topicProgressData);
  
        // Insert records into level_progress table
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


export const editStudentProgress = async (req, res) => {
  const { studentId , syllabus_id } = req.params;
  console.log(studentId);
  console.log(syllabus_id);

  try {
   

    // Fetch topics from topics table
    const [topicsRows] = await pool.query(`SELECT * FROM topics
    WHERE syllabus_id = ?`, [syllabus_id]);
    console.log(topicsRows);

    // Begin transaction
    
    for (const row of topicsRows) {
      const { id: topicId, topic_name, levelNum, lanName } = row;

      // Insert records into student_progress table
      const studentProgressQuery = `
        INSERT INTO student_progress (student_id, level_id, completed, current_question, syllabus_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      const studentProgressData = [studentId, 1, 0, 0, syllabus_id];
      await pool.query(studentProgressQuery, studentProgressData);
 
      // Insert records into language_progress table
      const languageProgressQuery = `
        INSERT INTO language_progress (name, student_id, syllabus_id)
        VALUES (?,?, ?)
      `;
      await pool.query(languageProgressQuery, [lanName, studentId, syllabus_id]);

      // Insert records into topic_progress table
      const topicProgressQuery = `
        INSERT INTO topic_progress (student_id, syllabus_id, name, topicSyllabus_id)
        VALUES (?, ?, ?, ?)
      `;
      const topicProgressData = [studentId, syllabus_id, topic_name, topicId];
      await pool.query(topicProgressQuery, topicProgressData);

      // Insert records into level_progress table
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


export const getFormattedProgressData = async (req, res) => {
  const { student_id } = req.params; // Assuming the student_id is passed as a request parameter
  try {
    const query = `
        SELECT 
            lp.id AS language_progress_id,
            t.id AS topic_id,
            t.topic_name AS topic_name,
            lp2.id AS level_id,
            lp2.name AS level_name,
            sp2.completed AS completed,
            sp2.current_question AS current_question
        FROM 
            language_progress lp
        JOIN syllabus_topic st ON lp.id = st.language_id
        JOIN topics t ON st.id = t.syllabus_id
        JOIN level_progress lp2 ON lp2.syllabus_id = lp.syllabus_id
        LEFT JOIN student_progress sp2 ON lp2.id = sp2.level_id AND sp2.student_id = lp.student_id
        WHERE 
            sp2.current_question = t.topic_id
            AND lp.student_id = ?;
    `;

    const [rows] = await pool.query(query, [student_id]);
    res.status(200).json(rows);
} catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: 'Internal server error' });
}
};



export const checkAndUpdateProgress = async(req, res) => {
  const { student_id, syllabus_id, language_id, topicName , questionNum} = req.body;
  console.log(student_id, syllabus_id, language_id, topicName)
  // Check if there is a row with the same student_id, syllabus_id, language_id, and topicName in topic_progress table
  try{

    const topicProgressQuery = `SELECT id FROM topic_progress WHERE student_id = ? AND syllabus_id = ? AND language_id = ? AND topicName = ?`;
  
    const [topicResults] = await pool.query(topicProgressQuery, [student_id, syllabus_id, language_id, topicName]);
    console.log(topicResults)
   
        if (topicResults.length === 0) {
            // If no row found, create one
            const insertTopicProgressQuery = `INSERT INTO topic_progress (student_id, syllabus_id, language_id, topicName) VALUES (?, ?, ?, ?)`;
            const [topicProgress] = await pool.query(insertTopicProgressQuery, [student_id, syllabus_id, language_id, topicName]);
            console.log(topicProgress.insertId);
                // Proceed to check or update level_progress table
             checkOrUpdateLevelProgress(req, res,topicProgress.insertId);
         }
         else {
          console.log("kdd")
            // Proceed to check or update level_progress table
            checkOrUpdateLevelProgress(req, res , topicResults[0].id);
        }
  }catch(err){
    console.log(err)
      }
  // });
};


const checkOrUpdateLevelProgress = async (req, res ,topic_id) => {
  const { student_id, syllabus_id, language_id  } = req.body;

  console.log(student_id, syllabus_id, language_id, topic_id )
  // Check if there is a row with the same student_id, syllabus_id, language_id, and topic_id in level_progress table

  try{

    const levelProgressQuery = `SELECT id, currQuestion FROM level_progress WHERE student_id = ? AND syllabus_id = ? AND language_id = ? AND topic_id = ?`;
    const [levelResults] = await pool.query(levelProgressQuery, [student_id, syllabus_id, language_id, topic_id]);
        if (levelResults.length === 0) {
          // If no row found, create one
          const insertLevelProgressQuery = `INSERT INTO level_progress (student_id, syllabus_id, language_id, topic_id, currQuestion) VALUES (?, ?, ?, ?, ?)`;
          const [newLevelrow] =await pool.query(insertLevelProgressQuery, [student_id, syllabus_id, language_id, topic_id, 0]);
          res.status(200).json(newLevelrow)
        } else {
          // If row found, update currQuestion
          const { id, currQuestion } = levelResults[0];
          const updatedCurrQuestion = currQuestion + 1;
       
      
          // Update the row in the database with the incremented currQuestion value
          const updateLevelProgressQuery = `UPDATE level_progress SET currQuestion = ? WHERE id = ?`;
          const [updateRow] =await pool.query(updateLevelProgressQuery, [updatedCurrQuestion, id]);
          res.status(200).json(updateRow)
      }
  }catch(err){
    console.log(err)
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


export const updateLevelProgress = async (req, res) => {
  const { student_id, syllabus_id, language_id, topic_name } = req.body;
  console.log(student_id, syllabus_id, language_id, topic_name );
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

    // Update the completed field to true for the current level_id
    const updateQuery = `
      UPDATE level_progress 
      SET completed = TRUE 
      WHERE student_id = ? 
      AND syllabus_id = ? 
      AND language_id = ? 
      AND topic_id = ?
    `;
   await pool.query(updateQuery, [student_id, syllabus_id, language_id, topic_id]);

    // Get the current level_id
    const getCurrentLevelQuery = `
    SELECT MAX(level_id) AS max_level_id
    FROM level_progress 
    WHERE student_id = ? 
    AND syllabus_id = ? 
    AND language_id = ? 
    AND topic_id = ?
    `;
    const [currentLevelRows] = await pool.query(getCurrentLevelQuery, [student_id, syllabus_id, language_id, topic_id]);
    const currentLevel = currentLevelRows[0].max_level_id;
    console.log(currentLevel);
    // Get the levelNum for the topic
    const levelNum = await getLevelNum(req, res);

    if (currentLevel + 1 > levelNum) {
      // Update completed field in topic_progress table to true
      const updateTopicProgressQuery = `
        UPDATE topic_progress 
        SET completed = TRUE 
        WHERE student_id = ? 
        AND syllabus_id = ? 
        AND language_id = ? 
        AND id = ?
      `;
      await pool.query(updateTopicProgressQuery, [student_id, syllabus_id, language_id, topic_id]);
      return res.status(200).json({ message: "topic progress updated successfully" });
    }
    else{

      // Insert a new row with incremented level_id
      const insertQuery = `
        INSERT INTO level_progress 
        (student_id, syllabus_id, language_id, topic_id, level_id, currQuestion, completed) 
        VALUES (?, ?, ?, ?, ?, ?, FALSE)
      `;
      await pool.query(insertQuery, [student_id, syllabus_id, language_id, topic_id, currentLevel + 1, 0]);
  
      return res.status(200).json({ message: "Level progress updated successfully" });
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

