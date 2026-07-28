import pool from '../../config/db.js';

export const insertStudentProgress = async (req, res) => {
  const { studentId, syllabus_id } = req.params;
  try {
    const { rows: topicsRows } = await pool.query(
      `SELECT * FROM syllabus_topic WHERE syllabus_id = $1`,
      [syllabus_id]
    );
    for (const row of topicsRows) {
      const { language_id } = row;
      await pool.query(
        `INSERT INTO student_progress (student_id, syllabus_id, language_id, started, finished)
         VALUES ($1, $2, $3, false, false)
         ON CONFLICT (student_id, syllabus_id, language_id) DO NOTHING`,
        [studentId, syllabus_id, language_id]
      );
    }
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error inserting student progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLanguageStatus = async (req, res) => {
  const { student_id } = req.params;
  const { syllabus_id, language_id, started, finished } = req.body;
  try {
    await pool.query(
      `UPDATE student_progress
       SET started = $1, finished = $2
       WHERE student_id = $3 AND language_id = $4 AND syllabus_id = $5`,
      [started, finished, student_id, language_id, syllabus_id]
    );
    res.status(200).json({ message: 'Language finish status updated successfully' });
  } catch (error) {
    console.error('Error editing progress data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLanguageStatus = async (req, res) => {
  const { student_id, language_id, syllabus_id } = req.params;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [student_id]
    );
    const studentId = studentRows[0]?.id;

    const { rows } = await pool.query(
      `SELECT started, finished FROM student_progress
       WHERE student_id = $1 AND language_id = $2 AND syllabus_id = $3`,
      [studentId, language_id, syllabus_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopicProgress = async (req, res) => {
  const { student_id, syllabus_id, language_id } = req.params;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [student_id]
    );
    const studentId = studentRows[0]?.id;

    const { rows } = await pool.query(
      `SELECT * FROM topic_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3`,
      [studentId, syllabus_id, language_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const ifThereIsStatus = async (req, res) => {
  const { student_id, syllabus_id } = req.params;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [student_id]
    );
    const studentId = studentRows[0]?.id;

    const { rows } = await pool.query(
      `SELECT * FROM language_progress WHERE student_id = $1 AND syllabus_id = $2`,
      [studentId, syllabus_id]
    );
  
    const isThereProgress = rows.some(lan => lan.started === true);
    
    res.status(200).json(isThereProgress);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkAndUpdateProgress = async (req, res) => {
  const { student_id, syllabus_id, language_id, topic_name, level, questionNum } = req.body;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [student_id]
    );
    const studentId = studentRows[0]?.id;

    const { rows: spRows } = await pool.query(
      `SELECT * FROM student_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3`,
      [studentId, syllabus_id, language_id]
    );

    if (spRows.length !== 0) {
      await pool.query(
        `UPDATE student_progress SET started = true
         WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3`,
        [studentId, syllabus_id, language_id]
      );
    } else {
      await pool.query(
        `INSERT INTO student_progress (student_id, syllabus_id, language_id, started, finished)
         VALUES ($1, $2, $3, true, false)`,
        [studentId, syllabus_id, language_id]
      );
    }

    // Also insert into language_progress if not already there
    const { rows: lpRows } = await pool.query(
      `SELECT id FROM language_progress WHERE student_id = $1 AND syllabus_id = $2`,
      [studentId, syllabus_id]
    );
    if (lpRows.length === 0) {
      await pool.query(
        `INSERT INTO language_progress (name, student_id, syllabus_id, started)
         VALUES ($1, $2, $3, true)`,
        [topic_name, studentId, syllabus_id]
      );
    } else {
      await pool.query(
        `UPDATE language_progress SET started = true WHERE student_id = $1 AND syllabus_id = $2`,
        [studentId, syllabus_id]
      );
    }

    const { rows: topicResults } = await pool.query(
      `SELECT id FROM topic_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3 AND "topicName" = $4`,
      [studentId, syllabus_id, language_id, topic_name]
    );

    if (topicResults.length === 0) {
      const { rows: newTopic } = await pool.query(
        `INSERT INTO topic_progress (student_id, syllabus_id, language_id, "topicName")
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [studentId, syllabus_id, language_id, topic_name]
      );
      await checkOrUpdateLevelProgress(req, res, newTopic[0].id, studentId);
    } else {
      await checkOrUpdateLevelProgress(req, res, topicResults[0].id, studentId);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkOrUpdateLevelProgress = async (req, res, topic_id, student_id) => {
  const { syllabus_id, language_id, level, questionNum } = req.body;
  try {
    const { rows: levelResults } = await pool.query(
      `SELECT id, "currQuestion" FROM level_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3
       AND topic_id = $4 AND level_id = $5`,
      [student_id, syllabus_id, language_id, topic_id, parseInt(level)]
    );

    if (levelResults.length !== 0) {
      const { id, currQuestion } = levelResults[0];
      const updatedCurrQuestion = currQuestion + 1;
      if (updatedCurrQuestion >= questionNum) {
        await pool.query(
          `UPDATE level_progress SET completed = true, "currQuestion" = $1 WHERE id = $2`,
          [questionNum, id]
        );
      } else {
        await pool.query(
          `UPDATE level_progress SET "currQuestion" = $1 WHERE id = $2`,
          [updatedCurrQuestion, id]
        );
      }
      res.status(200).json({ message: 'Level progress updated successfully' });
    } else {
      const { rows: newLevel } = await pool.query(
        `INSERT INTO level_progress
           (student_id, syllabus_id, language_id, topic_id, level_id, "currQuestion", completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [student_id, syllabus_id, language_id, topic_id, parseInt(level), 1, false]
      );
      if (questionNum === 1) {
        await pool.query(
          `UPDATE level_progress SET completed = true WHERE id = $1`,
          [newLevel[0].id]
        );
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
    const { rows } = await pool.query(
      `SELECT "questionsNum" FROM level
       WHERE syllabus_id = $1 AND language_id = $2 AND current_Level = $3 AND topic_id = $4`,
      [syllabus_id, language_id, current_Level, topic_id]
    );
    res.status(200).json({ questionsNum: rows[0]?.questionsNum || 0 });
  } catch (error) {
    console.error('Error retrieving questionsNum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTopicStatus = async (req, res) => {
  const { syllabus_id, language_id, topicName, student_id } = req.params;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [student_id]
    );
    const studentId = studentRows[0]?.id;

    const { rows } = await pool.query(
      `SELECT completed FROM topic_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3 AND "topicName" = $4`,
      [studentId, syllabus_id, language_id, topicName]
    );
    if (rows.length === 0) return res.status(200).json({ isTopicCompleted: false });
    res.status(200).json({ isTopicCompleted: rows[0].completed === true });
  } catch (error) {
    console.error('Error retrieving topic status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLevelStatus = async (req, res) => {
  const { syllabus_id, language_id, topic_name, level_id, student_id } = req.params;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [student_id]
    );
    const studentId = studentRows[0]?.id;

    const { rows: topicRows } = await pool.query(
      `SELECT id FROM topic_progress 
       WHERE "topicName" = $1 AND student_id = $2`,
      [topic_name, studentId]
    );
    if (!topicRows[0]?.id) return res.status(200).json({ isTopicCompleted: false, currQuestion: 0 });

    const { rows } = await pool.query(
      `SELECT completed, "currQuestion" FROM level_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3
       AND topic_id = $4 AND level_id = $5`,
      [studentId, syllabus_id, language_id, topicRows[0].id, level_id]
    );

    if (rows.length === 0) return res.status(200).json({ isTopicCompleted: false, currQuestion: 0 });

    const { completed, currQuestion } = rows[0];

    res.status(200).json({
      isTopicCompleted: completed === true,
      currQuestion: currQuestion ?? 0
    });
  } catch (error) {
    console.error('Error retrieving level status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const updateTopicProgress = async (req, res) => {
  const { student_id, syllabus_id, language_id, topic_name } = req.body;
  try {
    const { rows: topicResult } = await pool.query(
      `SELECT id FROM topic_progress
       WHERE "topicName" = $1 AND syllabus_id = $2 AND language_id = $3`,
      [topic_name, syllabus_id, language_id]
    );
    if (topicResult.length === 0) return res.status(404).json({ message: 'Topic not found' });

    await pool.query(
      `UPDATE topic_progress SET completed = true
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3 AND id = $4`,
      [student_id, syllabus_id, language_id, topicResult[0].id]
    );
    res.status(200).json({ message: 'Topic progress updated successfully' });
  } catch (error) {
    console.error('Error updating topic progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLevelProgress = async (req, res) => {
  const { syllabus_id, language_id, topic_name } = req.body;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [req.body.student_id]
    );
    const student_id = studentRows[0]?.id;

    const { rows: currentLevelRows } = await pool.query(
      `SELECT MAX(level_id) AS max_level_id FROM level_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND language_id = $3
       AND topic_id IN (
         SELECT id FROM topic_progress
         WHERE "topicName" = $4 AND syllabus_id = $5 AND language_id = $6
       )`,
      [student_id, syllabus_id, language_id, topic_name, syllabus_id, language_id]
    );
    const currentLevel = currentLevelRows[0]?.max_level_id;
    const levelNum = await getLevelNum(req, res);

    if (currentLevel + 1 > levelNum) {
      return res.status(200).json({ message: 'All levels completed for the topic' });
    }

    await pool.query(
      `INSERT INTO level_progress
         (student_id, syllabus_id, language_id, topic_id, level_id, "currQuestion", completed)
       SELECT $1, $2, $3, id, $4, 1, false
       FROM topic_progress
       WHERE "topicName" = $5 AND syllabus_id = $6 AND language_id = $7`,
      [student_id, syllabus_id, language_id, currentLevel + 1, topic_name, syllabus_id, language_id]
    );
  } catch (error) {
    console.error('Error updating level progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLevelNum = async (req, res) => {
  const { syllabus_id, language_id, topic_name } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT "levelNum" FROM topics
       WHERE syllabus_id = $1 AND language_id = $2 AND topic_name = $3`,
      [syllabus_id, language_id, topic_name]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No data found' });
    return rows[0].levelNum;
  } catch (error) {
    console.error('Error retrieving levelNum:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getLevelProgress = async (req, res) => {
  const { student_id, syllabus_id, topic_id } = req.params;
  try {
    const { rows: studentRows } = await pool.query(
      `SELECT id FROM student WHERE user_id = $1`, [student_id]
    );
    const studentId = studentRows[0]?.id;

    const { rows } = await pool.query(
      `SELECT * FROM level_progress
       WHERE student_id = $1 AND syllabus_id = $2 AND topic_id = $3`,
      [studentId, syllabus_id, topic_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'No data found' });
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching level progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};