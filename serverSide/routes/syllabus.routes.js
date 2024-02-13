import { Router } from "express";
import {getSyllabus} from '../controller/syllabus.js'
const router = Router();


router.get("/getSyllabus/:syllabus_creator" , getSyllabus);

// router.get("/getStudent/:email",getStudentByEmail);
// router.post("/addNewStudent", createNewStudent);
// router.put("/updateStudentDetails/:user_id", updateStudent)
// router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
