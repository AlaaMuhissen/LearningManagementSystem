import pool from '../../config/db.js';

export const getAllQuestionAndAnswer = async (req, res) => {
  const { syllabusId, languageName, topic_name } = req.params;


  try {
    // Debug: check what topics exist
    const { rows: allTopics } = await pool.query(
      `SELECT id, topic_name, "lanName", language_id FROM topics WHERE syllabus_id = $1`,
      [syllabusId]
    );

    // Find topic — try exact match first, then case-insensitive
    const { rows: topicRows } = await pool.query(
      `SELECT id FROM topics 
       WHERE syllabus_id = $1 
       AND (topic_name = $2 OR LOWER(topic_name) = LOWER($2))
       LIMIT 1`,
      [syllabusId, topic_name]
    );


    if (topicRows.length === 0) {
      return res.status(404).json({ error: `Topic not found: ${topic_name}` });
    }

    const { rows: results } = await pool.query(`
      SELECT q.id AS question_id, q.question_text, q.reward, q.level, q.hint,
             a.id AS answer_id, a.value AS answer_value
      FROM question q
      LEFT JOIN answer a ON q.id = a.question_id
      WHERE q.syllabus_id = $1
        AND q."lanName" = $2
        AND q.topic_id = $3
      ORDER BY q.level, q.id, a.id
    `, [syllabusId, languageName, topicRows[0].id]);
 

    // If still empty — try without lanName filter (to debug)
    if (results.length === 0) {
      const { rows: debugRows } = await pool.query(
        `SELECT q.id, q."lanName", q.level, q.question_text FROM question q WHERE q.topic_id = $1`,
        [topicRows[0].id]
      );
    
    }

    const questionsByLevel = {};
    results.forEach((row) => {
      const { question_id, question_text, reward, level, hint, answer_id, answer_value } = row;
      if (!questionsByLevel[level]) questionsByLevel[level] = [];
      const existing = questionsByLevel[level].find(q => q.question_id === question_id);
      if (existing) {
        if (answer_id) existing.answer_values.push({ id: answer_id, value: answer_value });
      } else {
        questionsByLevel[level].push({
          question_id,
          question_text,
          reward,
          hint,
          answer_values: answer_id ? [{ id: answer_id, value: answer_value }] : []
        });
      }
    });

    res.json(questionsByLevel);
  } catch (error) {
    console.error('Error fetching questions and answers:', error);
    res.status(500).json({ error: 'Error fetching questions and answers from the database' });
  }
};