import { Router } from 'express';
import { getAllLessons, getLessonById, createNewLesson, updateLessonDetails, deleteLesson } from '../controller/lesson.js';
import { verifyToken } from '../middleware/isAuth.js';

const router = Router();

router.get('/getAllLessons', getAllLessons);
router.get('/getLesson/:id', getLessonById);
router.post('/addNewLesson', verifyToken, createNewLesson);
router.put('/updateLessonDetails/:id', verifyToken, updateLessonDetails);
router.delete('/deleteLesson/:id', verifyToken, deleteLesson);

export default router;