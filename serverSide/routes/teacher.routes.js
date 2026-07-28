import { Router } from 'express';
import { verifyToken } from '../middleware/isAuth.js';
import {
  generateJoinCode, joinTeacher, getTeacherStudents,
  getTeacherExercises, createTeacherExercise, updateTeacherExercise,
  deleteTeacherExercise, checkExerciseAnswer,
  getTeacherExams, createTeacherExam, updateTeacherExam, publishExamToStudents, deleteTeacherExam,
  getStudentExams, getExamExercises, submitExamAnswer, completeExam, getAssignment,
  publishExerciseToStudents, getStudentPracticeExercises, completePracticeExercise,
  getExerciseSubmissions, getExamSubmissions,
  trackHintUsage, getHintUsageForTeacher, incrementRetryCount, getRetryStats
} from '../controller/teacher.js';

const router = Router();

// Join codes
router.get('/joinCode/:teacher_id', verifyToken, generateJoinCode);
router.post('/join', joinTeacher);

// Teacher's students
router.get('/students/:teacher_id', verifyToken, getTeacherStudents);

// Exercises
router.get('/exercises/:teacher_id', verifyToken, getTeacherExercises);
router.post('/exercises', verifyToken, createTeacherExercise);
router.put('/exercises/:exercise_id', verifyToken, updateTeacherExercise);
router.delete('/exercises/:exercise_id', verifyToken, deleteTeacherExercise);
router.post('/exercises/check', checkExerciseAnswer);
router.put('/exercises/:exercise_id/publish', verifyToken, publishExerciseToStudents);

// Exams
router.get('/exams/:teacher_id', verifyToken, getTeacherExams);
router.post('/exams', verifyToken, createTeacherExam);
router.put('/exams/:exam_id', verifyToken, updateTeacherExam);
router.put('/exams/:exam_id/publish', verifyToken, publishExamToStudents);
router.delete('/exams/:exam_id', verifyToken, deleteTeacherExam);

// Student — exams
router.get('/studentExams/:student_id', getStudentExams);
router.get('/examExercises/:exam_id', getExamExercises);
router.get('/getAssignment/:exam_id/:student_id', getAssignment);
router.post('/submitAnswer', submitExamAnswer);
router.put('/completeExam/:assignment_id', completeExam);

// Student — practice exercises
router.get('/studentExercises/:student_id', getStudentPracticeExercises);
router.put('/completeExercise/:assignment_id', completePracticeExercise);

// Submissions
router.get('/exerciseSubmissions/:teacher_id', verifyToken, getExerciseSubmissions);
router.get('/examSubmissions/:teacher_id', verifyToken, getExamSubmissions);

// Hint & retry tracking
router.post('/trackHint', trackHintUsage);
router.get('/hintUsage/:teacher_id', verifyToken, getHintUsageForTeacher);
router.post('/incrementRetry', incrementRetryCount);
router.get('/retryStats/:teacher_id', verifyToken, getRetryStats);

export default router;