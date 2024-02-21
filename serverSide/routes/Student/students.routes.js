import { Router } from "express";
import { queryStudentTable , getStudentByEmail ,createNewStudent ,deleteStudent ,updateStudent, getPointsForStudent, updatePointsFoStudent} from '../../controller/Student/student.js'
import { verifyToken } from "../../middleware/isAuth.js";
const router = Router();
//getStudentById, createNewStudent, updateStudentDetails, deleteStudent

router.get("/getAllStudents" , queryStudentTable);
router.get("/getStudentPoints/:user_id" , getPointsForStudent);
router.get("/getStudent/:email",getStudentByEmail);
router.post("/addNewStudent", createNewStudent);
router.put("/updateStudentDetails/:user_id", updateStudent)
router.put("/updateStudentPoints/:user_id", updatePointsFoStudent)
router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
