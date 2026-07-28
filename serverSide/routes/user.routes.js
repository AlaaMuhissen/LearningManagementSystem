import { Router } from 'express';
import {
  queryStudentTable,
  getStudentByEmail,
  createNewStudent,
  deleteStudent,
  updateStudent,
  getPointsForStudent,
  updatePointsFoStudent
} from '../controller/Student/student.js';
import { verifyToken } from '../middleware/isAuth.js';
import { fetchUserProfile } from '../controller/user.js';

const router = Router();

// Protected routes — require a valid Firebase token
router.get('/getAllStudents', verifyToken, queryStudentTable);
router.get('/getStudent/:email', verifyToken, getStudentByEmail);
router.get('/fetchUserProfile/:userId', fetchUserProfile);
router.put('/updateStudentDetails/:user_id', verifyToken, updateStudent);
router.delete('/deleteStudent/:email', verifyToken, deleteStudent);

// Points — read is open (used during gameplay), write is protected
router.get('/getStudentPoints/:user_id', getPointsForStudent);
router.put('/updateStudentPoints/:user_id', verifyToken, updatePointsFoStudent);

// Registration is open (student signing up)
router.post('/addNewStudent', createNewStudent);

export default router;