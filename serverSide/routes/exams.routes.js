import { Router } from 'express';
import { getAllExams, getExamById, createNewExam, updateExamDetails, deleteExam } from '../controller/exam.js';
import { verifyToken } from '../middleware/isAuth.js';

const router = Router();

router.get('/getAllExams', getAllExams);
router.get('/getExam/:id', getExamById);
router.post('/addNewExam', verifyToken, createNewExam);
router.put('/updateExamDetails/:id', verifyToken, updateExamDetails);
router.delete('/deleteExam/:id', verifyToken, deleteExam);

export default router;