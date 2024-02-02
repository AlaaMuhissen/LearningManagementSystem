import { Router } from "express";
import {getStudentById, queryStudentTable , createNewStudent, updateStudentDetails, deleteStudent} from '../controller/user.js'
import { verifyToken } from "../middleware/isAuth.js";
const router = Router();


router.get("/getAllStudents" ,verifyToken, queryStudentTable);
router.get("/getStudent/:id",getStudentById );
router.post("/addNewStudent", createNewStudent);
router.put("/updateStudentDetails/:id", updateStudentDetails)
router.delete("/deleteStudent/:id" , deleteStudent);

export default router;
