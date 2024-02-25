import { Router } from "express";
import { getTopicsBasedOnLanguage ,getLevelAndQuestionNumForTopic,getTopicsBasedOnSyllabusId} from '../../controller/Student/topics.js'
const router = Router();


router.get("/getTopicsAndLevelsBasedOnLanguage/:syllabusId/:languageName" , getTopicsBasedOnLanguage);
router.get("/getLevelAndQuestionNumForTopic/:syllabusId/:languageName/:topic_name" , getLevelAndQuestionNumForTopic);
router.get("/getTopicsBasedOnSyllabusId/:syllabusId" , getTopicsBasedOnSyllabusId);
// router.get("/getStudent/:email",getStudentByEmail);
// router.post("/addNewStudent", createNewStudent);
// router.put("/updateStudentDetails/:user_id", updateStudent)
// router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
