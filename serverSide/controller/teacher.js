import pool from '../config/db.js';
import crypto from 'crypto';

// =============================================
// JOIN CODES
// =============================================

export const generateJoinCode = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    // Check if teacher already has a code
    const { rows: existing } = await pool.query(
      `SELECT code FROM join_codes WHERE teacher_id = $1`, [teacher_id]
    );
    if (existing.length > 0) {
      return res.status(200).json({ code: existing[0].code });
    }
    // Generate unique 6-char code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const { rows } = await pool.query(
      `INSERT INTO join_codes (teacher_id, code) VALUES ($1, $2) RETURNING code`,
      [teacher_id, code]
    );
    res.status(201).json({ code: rows[0].code });
  } catch (error) {
    console.error('Error generating join code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const joinTeacher = async (req, res) => {
  const { student_id, code } = req.body;
  try {
    // Find teacher by code
    const { rows: codeRows } = await pool.query(
      `SELECT teacher_id FROM join_codes WHERE code = $1`, [code]
    );
    if (codeRows.length === 0) {
      return res.status(404).json({ error: 'Invalid join code' });
    }
    const teacher_id = codeRows[0].teacher_id;

    // Link student to teacher
    await pool.query(
      `INSERT INTO teacher_student (teacher_id, student_id)
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [teacher_id, student_id]
    );
    res.status(200).json({ message: 'Joined teacher successfully', teacher_id });
  } catch (error) {
    console.error('Error joining teacher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTeacherStudents = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.email, u.phone, ts.joined_at
       FROM teacher_student ts
       JOIN users u ON ts.student_id = u.id
       WHERE ts.teacher_id = $1
       ORDER BY ts.joined_at DESC`,
      [teacher_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching teacher students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================
// TEACHER EXERCISES
// =============================================

export const getTeacherExercises = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT te.*, 
              json_agg(json_build_object('id', teb.id, 'value', teb.value) ORDER BY teb.id) 
                FILTER (WHERE teb.id IS NOT NULL) AS blocks
       FROM teacher_exercise te
       LEFT JOIN teacher_exercise_block teb ON te.id = teb.exercise_id
       WHERE te.teacher_id = $1
       GROUP BY te.id
       ORDER BY te.created_at DESC`,
      [teacher_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTeacherExercise = async (req, res) => {
  const { teacher_id, question_text, level, language, reward, blocks, hint, deadline, allow_retry } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO teacher_exercise (teacher_id, question_text, level, language, reward, hint, deadline, allow_retry)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [teacher_id, question_text, level, language, reward || 5, hint || null, deadline || null, allow_retry ?? true]
    );
    const exercise_id = rows[0].id;

    // Insert blocks for level 1 & 2
    if (blocks && blocks.length > 0) {
      for (const block of blocks) {
        await pool.query(
          `INSERT INTO teacher_exercise_block (exercise_id, value) VALUES ($1, $2)`,
          [exercise_id, block]
        );
      }
    }
    res.status(201).json({ message: 'Exercise created', exercise_id });
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeacherExercise = async (req, res) => {
  const { exercise_id } = req.params;
  const { question_text, level, language, reward, blocks, expected_output, test_cases, hint, deadline, allow_retry } = req.body;
  try {
    await pool.query(
      `UPDATE teacher_exercise 
       SET question_text=$1, level=$2, language=$3, reward=$4, expected_output=$5, test_cases=$6, hint=$7, deadline=$8, allow_retry=$9
       WHERE id=$10`,
      [question_text, level, language, reward, expected_output, 
       test_cases ? JSON.stringify(test_cases) : null, hint || null, deadline || null, allow_retry ?? true, exercise_id]
    );
    await pool.query(`DELETE FROM teacher_exercise_block WHERE exercise_id=$1`, [exercise_id]);
    if (blocks && blocks.length > 0) {
      for (const block of blocks) {
        await pool.query(
          `INSERT INTO teacher_exercise_block (exercise_id, value) VALUES ($1, $2)`,
          [exercise_id, block]
        );
      }
    }
    res.status(200).json({ message: 'Exercise updated' });
  } catch (error) {
    console.error('Error updating exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const checkExerciseAnswer = async (req, res) => {
  const { exercise_id, student_answer } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT te.level, te.language, te.expected_output, te.test_cases,
              json_agg(json_build_object('id', teb.id, 'value', teb.value) ORDER BY teb.id) 
                FILTER (WHERE teb.id IS NOT NULL) AS blocks
       FROM teacher_exercise te
       LEFT JOIN teacher_exercise_block teb ON te.id = teb.exercise_id
       WHERE te.id = $1 GROUP BY te.id`,
      [exercise_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Exercise not found' });
    const ex = rows[0];

    let is_correct = false;

    if (ex.level <= 2) {
      // Check block order matches
      const correctOrder = ex.blocks?.map(b => b.value) || [];
      const studentOrder = JSON.parse(student_answer || '[]');
      is_correct = JSON.stringify(correctOrder) === JSON.stringify(studentOrder.map(b => b.value));
    } else if (ex.level === 3) {
      const htmlCss = ['html', 'css'].includes(ex.language);
      if (htmlCss && ex.expected_output) {
        // Normalize both outputs for comparison (strip whitespace)
        const normalize = s => s.replace(/\s+/g, '').toLowerCase();
        is_correct = normalize(student_answer) === normalize(ex.expected_output);
      } else if (ex.test_cases) {
        // Check all test cases appear in student output
        const cases = Array.isArray(ex.test_cases) ? ex.test_cases : JSON.parse(ex.test_cases);
        is_correct = cases.every(tc => student_answer.includes(tc));
      } else {
        // No answer key — pass if code is substantial
        is_correct = student_answer.trim().length > 30;
      }
    }

    res.status(200).json({ is_correct });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeacherExercise = async (req, res) => {
  const { exercise_id } = req.params;
  try {
    await pool.query(`DELETE FROM teacher_exercise WHERE id=$1`, [exercise_id]);
    res.status(200).json({ message: 'Exercise deleted' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================
// TEACHER EXAMS
// =============================================

export const getTeacherExams = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT te.*,
              json_agg(json_build_object('id', tee.exercise_id, 'order', tee.order_num) ORDER BY tee.order_num)
                FILTER (WHERE tee.id IS NOT NULL) AS exercises
       FROM teacher_exam te
       LEFT JOIN teacher_exam_exercise tee ON te.id = tee.exam_id
       WHERE te.teacher_id = $1
       GROUP BY te.id
       ORDER BY te.created_at DESC`,
      [teacher_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTeacherExam = async (req, res) => {
  const { teacher_id, title, description, time_limit, exercise_ids, deadline, allow_retry } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO teacher_exam (teacher_id, title, description, time_limit, deadline, allow_retry)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [teacher_id, title, description, time_limit, deadline || null, allow_retry ?? false]
    );
    const exam_id = rows[0].id;

    if (exercise_ids && exercise_ids.length > 0) {
      for (let i = 0; i < exercise_ids.length; i++) {
        await pool.query(
          `INSERT INTO teacher_exam_exercise (exam_id, exercise_id, order_num) VALUES ($1, $2, $3)`,
          [exam_id, exercise_ids[i], i + 1]
        );
      }
    }
    res.status(201).json({ message: 'Exam created', exam_id });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const publishExamToStudents = async (req, res) => {
  const { exam_id } = req.params;
  const { student_ids } = req.body;
  try {
    for (const student_id of student_ids) {
      await pool.query(
        `INSERT INTO exam_assignment (exam_id, student_id, published)
         VALUES ($1, $2, true)
         ON CONFLICT (exam_id, student_id) DO UPDATE SET published = true`,
        [exam_id, student_id]
      );
    }
    await pool.query(
      `UPDATE teacher_exam SET published = true WHERE id = $1`, [exam_id]
    );
    res.status(200).json({ message: 'Exam published to students' });
  } catch (error) {
    console.error('Error publishing exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTeacherExam = async (req, res) => {
  const { exam_id } = req.params;
  const { title, description, time_limit, deadline, allow_retry, exercise_ids } = req.body;
  try {
    await pool.query(
      `UPDATE teacher_exam SET title=$1, description=$2, time_limit=$3, deadline=$4, allow_retry=$5 WHERE id=$6`,
      [title, description, time_limit, deadline || null, allow_retry, exam_id]
    );
    // Replace exercises
    await pool.query(`DELETE FROM teacher_exam_exercise WHERE exam_id=$1`, [exam_id]);
    if (exercise_ids && exercise_ids.length > 0) {
      for (let i = 0; i < exercise_ids.length; i++) {
        await pool.query(
          `INSERT INTO teacher_exam_exercise (exam_id, exercise_id, order_num) VALUES ($1, $2, $3)`,
          [exam_id, exercise_ids[i], i + 1]
        );
      }
    }
    res.status(200).json({ message: 'Exam updated' });
  } catch (error) {
    console.error('Error updating exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTeacherExam = async (req, res) => {
  const { exam_id } = req.params;
  try {
    await pool.query(`DELETE FROM teacher_exam WHERE id=$1`, [exam_id]);
    res.status(200).json({ message: 'Exam deleted' });
  } catch (error) {
    console.error('Error deleting exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================
// STUDENT - get assigned exams
// =============================================

export const getStudentExams = async (req, res) => {
  const { student_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT te.id, te.title, te.description, te.time_limit,
              ea.published, ea.score, ea.started_at, ea.completed_at,
              ea.id AS assignment_id,
              u.username AS teacher_name
       FROM exam_assignment ea
       JOIN teacher_exam te ON ea.exam_id = te.id
       JOIN users u ON te.teacher_id = u.id
       WHERE ea.student_id = $1 AND ea.published = true
       ORDER BY ea.id DESC`,
      [student_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching student exams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExamExercises = async (req, res) => {
  const { exam_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT te.*, 
              json_agg(json_build_object('id', teb.id, 'value', teb.value) ORDER BY teb.id)
                FILTER (WHERE teb.id IS NOT NULL) AS blocks,
              tee.order_num
       FROM teacher_exam_exercise tee
       JOIN teacher_exercise te ON tee.exercise_id = te.id
       LEFT JOIN teacher_exercise_block teb ON te.id = teb.exercise_id
       WHERE tee.exam_id = $1
       GROUP BY te.id, tee.order_num
       ORDER BY tee.order_num`,
      [exam_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching exam exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitExamAnswer = async (req, res) => {
  const { assignment_id, exercise_id, answer, is_correct } = req.body;
  try {
    await pool.query(
      `INSERT INTO exam_student_answer (assignment_id, exercise_id, answer, is_correct)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT DO NOTHING`,
      [assignment_id, exercise_id, answer, is_correct]
    );
    res.status(200).json({ message: 'Answer submitted' });
  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completeExam = async (req, res) => {
  const { assignment_id } = req.params;
  const { score } = req.body;
  try {
    await pool.query(
      `UPDATE exam_assignment SET score=$1, completed_at=NOW() WHERE id=$2`,
      [score, assignment_id]
    );
    res.status(200).json({ message: 'Exam completed' });
  } catch (error) {
    console.error('Error completing exam:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignment = async (req, res) => {
  const { exam_id, student_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT id FROM exam_assignment WHERE exam_id = $1 AND student_id = $2`,
      [exam_id, student_id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Assignment not found' });
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================
// PRACTICE EXERCISE ASSIGNMENTS
// =============================================

export const publishExerciseToStudents = async (req, res) => {
  const { exercise_id } = req.params;
  const { student_ids } = req.body;
  try {
    for (const student_id of student_ids) {
      await pool.query(
        `INSERT INTO exercise_assignment (exercise_id, student_id)
         VALUES ($1, $2)
         ON CONFLICT (exercise_id, student_id) DO NOTHING`,
        [exercise_id, student_id]
      );
    }
    res.status(200).json({ message: 'Exercise published to students' });
  } catch (error) {
    console.error('Error publishing exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentPracticeExercises = async (req, res) => {
  const { student_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT te.*, ea.completed, ea.id AS assignment_id,
              u.username AS teacher_name,
              te.deadline, te.allow_retry,
       json_agg(json_build_object('id', teb.id, 'value', teb.value) ORDER BY teb.id)
                FILTER (WHERE teb.id IS NOT NULL) AS blocks
       FROM exercise_assignment ea
       JOIN teacher_exercise te ON ea.exercise_id = te.id
       JOIN users u ON te.teacher_id = u.id
       LEFT JOIN teacher_exercise_block teb ON te.id = teb.exercise_id
       WHERE ea.student_id = $1
       GROUP BY te.id, ea.completed, ea.id, u.username
       ORDER BY ea.assigned_at DESC`,
      [student_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching practice exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const completePracticeExercise = async (req, res) => {
  const { assignment_id } = req.params;
  try {
    await pool.query(
      `UPDATE exercise_assignment SET completed = true WHERE id = $1`,
      [assignment_id]
    );
    res.status(200).json({ message: 'Exercise marked as completed' });
  } catch (error) {
    console.error('Error completing exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================
// TEACHER SUBMISSIONS VIEW
// =============================================

export const getExerciseSubmissions = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
         ea.id AS assignment_id,
         te.question_text, te.language, te.level, te.reward,
         u.username AS student_name, u.email AS student_email,
         ea.completed, ea.assigned_at
       FROM exercise_assignment ea
       JOIN teacher_exercise te ON ea.exercise_id = te.id
       JOIN users u ON ea.student_id = u.id
       WHERE te.teacher_id = $1
       ORDER BY ea.assigned_at DESC`,
      [teacher_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching exercise submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExamSubmissions = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
         ea.id AS assignment_id,
         te.title AS exam_title, te.id AS exam_id,
         (SELECT COUNT(*) FROM teacher_exam_exercise WHERE exam_id = te.id) AS total_exercises,
         u.username AS student_name, u.email AS student_email,
         ea.published, ea.score, ea.completed_at, ea.assigned_at
       FROM exam_assignment ea
       JOIN teacher_exam te ON ea.exam_id = te.id
       JOIN users u ON ea.student_id = u.id
       WHERE te.teacher_id = $1
       ORDER BY ea.assigned_at DESC`,
      [teacher_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching exam submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// =============================================
// HINT & RETRY TRACKING
// =============================================

export const trackHintUsage = async (req, res) => {
  const { student_id, question_id, exercise_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO hint_usage (student_id, question_id, exercise_id)
       VALUES ($1, $2, $3)`,
      [student_id, question_id || null, exercise_id || null]
    );
    res.status(200).json({ message: 'Hint usage tracked' });
  } catch (error) {
    console.error('Error tracking hint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHintUsageForTeacher = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { rows } = await pool.query(
      `SELECT 
         te.id AS exercise_id,
         te.question_text,
         te.language,
         te.level,
         COUNT(hu.id) AS total_hint_uses,
         json_agg(json_build_object(
           'student_name', u.username,
           'student_email', u.email,
           'used_at', hu.used_at
         ) ORDER BY hu.used_at DESC) AS students_who_used_hint
       FROM teacher_exercise te
       LEFT JOIN hint_usage hu ON te.id = hu.exercise_id
       LEFT JOIN users u ON hu.student_id = u.id
       WHERE te.teacher_id = $1
       GROUP BY te.id
       HAVING COUNT(hu.id) > 0
       ORDER BY total_hint_uses DESC`,
      [teacher_id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching hint usage:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const incrementRetryCount = async (req, res) => {
  const { assignment_id, type } = req.body; // type: 'exercise' or 'exam'
  try {
    const table = type === 'exam' ? 'exam_assignment' : 'exercise_assignment';
    await pool.query(
      `UPDATE ${table} SET attempt_count = attempt_count + 1 WHERE id = $1`,
      [assignment_id]
    );
    res.status(200).json({ message: 'Retry count updated' });
  } catch (error) {
    console.error('Error incrementing retry:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getRetryStats = async (req, res) => {
  const { teacher_id } = req.params;
  try {
    const { rows: exerciseRetries } = await pool.query(
      `SELECT 
         te.question_text, te.language, te.level,
         u.username AS student_name, u.email AS student_email,
         ea.attempt_count, ea.completed
       FROM exercise_assignment ea
       JOIN teacher_exercise te ON ea.exercise_id = te.id
       JOIN users u ON ea.student_id = u.id
       WHERE te.teacher_id = $1 AND ea.attempt_count > 1
       ORDER BY ea.attempt_count DESC`,
      [teacher_id]
    );

    const { rows: examRetries } = await pool.query(
      `SELECT 
         te.title AS exam_title,
         u.username AS student_name, u.email AS student_email,
         ea.attempt_count, ea.score, ea.completed_at
       FROM exam_assignment ea
       JOIN teacher_exam te ON ea.exam_id = te.id
       JOIN users u ON ea.student_id = u.id
       WHERE te.teacher_id = $1 AND ea.attempt_count > 1
       ORDER BY ea.attempt_count DESC`,
      [teacher_id]
    );

    res.status(200).json({ exerciseRetries, examRetries });
  } catch (error) {
    console.error('Error fetching retry stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};