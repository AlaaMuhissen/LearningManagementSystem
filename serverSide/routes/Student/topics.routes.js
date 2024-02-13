import { Router } from "express";
import { getTopicsBasedOnLanguage ,getLevelAndQuestionNumForTopic} from '../../controller/Student/topics.js'
const router = Router();


router.get("/getTopicsAndLevelsBasedOnLanguage/:syllabusId/:languageName" , getTopicsBasedOnLanguage);
router.get("/getLevelAndQuestionNumForTopic/:syllabusId/:languageName" , getLevelAndQuestionNumForTopic);
// router.get("/getLevelAndQuestionNumForTopic/:syllabusId/:languageName" , getLevelAndQuestionNumForTopic);
// router.get("/getStudent/:email",getStudentByEmail);
// router.post("/addNewStudent", createNewStudent);
// router.put("/updateStudentDetails/:user_id", updateStudent)
// router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
