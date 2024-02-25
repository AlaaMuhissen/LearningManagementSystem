import { Router } from "express";
import {getLanguageIdByLanguageName, getSyllabus ,getLanguagesNameFromSyllabus} from '../controller/syllabus.js'
const router = Router();


router.get("/getSyllabus/:syllabus_creator" , getSyllabus);
router.get("/getLanguageId/:syllabus_id/:lanName",getLanguageIdByLanguageName);
router.get("/getLanguagesNameFromSyllabus/:syllabus_id",getLanguagesNameFromSyllabus);
// router.post("/addNewStudent", createNewStudent);
// router.put("/updateStudentDetails/:user_id", updateStudent)
// router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
