import pool from "../../config/db.js";

export const getAllQuestionAndAnswer = async (req, res) => {
    const { syllabusId, languageName } = req.params;
    try {
      const [results] = await pool.execute(`
        SELECT q.id AS question_id,
               q.topic_id,
               q.lanName,
               q.question_text,
               q.reward,
               q.level,
               q.syllabus_id,
               a.id AS answer_id,
               a.value AS answer_value
        FROM question q
        JOIN answer a ON q.topic_id = a.topic_id
                     AND q.lanName = a.lanName
                     AND q.syllabus_id = a.syllabus_id
        WHERE q.syllabus_id = ? AND q.lanName = ?
      `, [syllabusId, languageName]);
       // Grouping the results by question_id
    const groupedResults = results.reduce((acc, { question_id, ...rest }) => {
        acc[question_id] = acc[question_id] || [];
        acc[question_id].push(rest);
        return acc;
      }, {});
      console.log(groupedResults);
  
    //   // Transforming answer_value into an array for each question
    //   const transformedResults = Object.keys(groupedResults).map(question_id => {
    //     return {
    //       question_id,
    //       answers: groupedResults[question_id].map(({ answer_id, answer_value }) => ({ answer_id, answer_value }))
    //     };
    //   });
  
      res.json();
     
    } catch (error) {
      console.error('Error fetching questions and answers:', error);
      res.status(500).json({ error: 'Error fetching questions and answers from the database' });
    }
  };