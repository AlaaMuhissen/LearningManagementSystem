import pool from "../../config/db.js";

export const getAllQuestionAndAnswer = async (req, res) => {
  const { syllabusId, languageName } = req.params;
  try {
      // Fetch questions and answers from the database
      const [results] = await pool.execute(`
          SELECT q.id AS question_id, q.question_text, q.reward, q.level, a.id AS answer_id, a.value AS answer_value
          FROM question q
          JOIN answer a ON q.id = a.question_id
          WHERE q.syllabus_id = ? AND q.lanName = ?
          ORDER BY q.level, q.id, a.id
      `, [syllabusId, languageName]);

      // Organize the data into an object by level
      const questionsByLevel = {};
      results.forEach((row) => {
          const { question_id, question_text, reward, level, answer_id, answer_value } = row;
          if (!questionsByLevel[level]) {
              questionsByLevel[level] = [];
          }
          const existingQuestion = questionsByLevel[level].find((q) => q.question_id === question_id);
          if (existingQuestion) {
              existingQuestion.answer_values.push({ id: answer_id, value: answer_value });
          } else {
              questionsByLevel[level].push({
                  question_id,
                  question_text,
                  reward,
                  answer_values: [{ id: answer_id, value: answer_value }]
              });
          }
      });

      res.json(questionsByLevel);

  } catch (error) {
      console.error('Error fetching questions and answers:', error);
      res.status(500).json({ error: 'Error fetching questions and answers from the database' });
  }
};
