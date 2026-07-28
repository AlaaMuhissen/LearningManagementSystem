import { Router } from 'express';
import { getAllExercises, getExerciseById, createNewExercise, updateExerciseDetails, deleteExercise } from '../controller/exercise.js';
import { verifyToken } from '../middleware/isAuth.js';

const router = Router();

router.get('/getAllExercises', getAllExercises);
router.get('/getExercise/:id', getExerciseById);
router.post('/addNewExercise', verifyToken, createNewExercise);
router.put('/updateExercise/:id', verifyToken, updateExerciseDetails);
router.delete('/deleteExercise/:id', verifyToken, deleteExercise);

export default router;