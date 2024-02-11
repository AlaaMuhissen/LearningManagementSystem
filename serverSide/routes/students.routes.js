import { Router } from "express";
import { queryStudentTable , getStudentByEmail ,createNewStudent ,deleteStudent ,updateStudent} from '../controller/student.js'
import { verifyToken } from "../middleware/isAuth.js";
const router = Router();
//getStudentById, createNewStudent, updateStudentDetails, deleteStudent

router.get("/getAllStudents" , queryStudentTable);
router.get("/getStudent/:email",getStudentByEmail);
router.post("/addNewStudent", createNewStudent);
router.put("/updateStudentDetails/:user_id", updateStudent)
router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
