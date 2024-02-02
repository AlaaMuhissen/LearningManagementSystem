import express from "express";
import dotenv from "dotenv";
import cors from 'cors'
import { errorHandler } from "./middleware/errorHandler.js";
import StudentsRoutes from './routes/students.routes.js'
import ExamsRoutes from './routes/exams.routes.js';
import ExercisesRoutes from './routes/exercises.routes.js';
import LessonsRoutes from './routes/lessons.routes.js';


const app = express();

app.use(cors());
dotenv.config();
app.use(express.json());

app.use("/api/students" ,StudentsRoutes);
app.use("/api/lessons" ,LessonsRoutes);
app.use("/api/exams" ,ExamsRoutes);
app.use("/api/exercises" ,ExercisesRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>
console.log(`Server online at port ${PORT}`)
)