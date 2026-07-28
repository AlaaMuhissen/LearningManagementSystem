process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import StudentsRoutes from './routes/Student/students.routes.js';
import TopicsRoutes from './routes/Student/topics.routes.js';
import SyllabusRoutes from './routes/syllabus.routes.js';
import QuestionAndAnswerRoutes from './routes/Student/questionAndAnswer.routes.js';
import ProgressRoutes from './routes/Student/studentProgress.routes.js';
import UserRoutes from './routes/user.routes.js';
import LessonsRoutes from './routes/lessons.routes.js';
import ExercisesRoutes from './routes/exercises.routes.js';
import ExamsRoutes from './routes/exams.routes.js';
import TeacherRoutes from './routes/teacher.routes.js';
import 
AiExerciseRoutes from './routes/aiExercise.routes.js';
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/students', StudentsRoutes);
app.use('/api/topics', TopicsRoutes);
app.use('/api/syllabus', SyllabusRoutes);
app.use('/api/QA', QuestionAndAnswerRoutes);
app.use('/api/progress', ProgressRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/lessons', LessonsRoutes);
app.use('/api/exercises', ExercisesRoutes);
app.use('/api/exams', ExamsRoutes);
app.use('/api/teacher', TeacherRoutes);
app.use('/api/ai', AiExerciseRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server online at port ${PORT}`);
});