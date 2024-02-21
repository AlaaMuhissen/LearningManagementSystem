import { Router } from "express";

import { insertStudentProgress  ,checkAndUpdateProgress, updateLevelProgress ,getTopicStatus, updateLanguageStatus, getLanguageStatus} from "../../controller/Student/studentProgress.js";
const router = Router();


router.post("/createStudentProgress/:studentId/:syllabus_id" , insertStudentProgress);
router.get("/getTopicStatus/:syllabus_id/:language_id/:topicName/:student_id" , getTopicStatus);
router.get("/getLanguageStatus/:student_id/syllabus/:syllabus_id/language/:language_id" , getLanguageStatus);

router.put("/updateProgress" , checkAndUpdateProgress);
router.put("/updateLevel" , updateLevelProgress);
router.put("/updateLanguageStatus/:student_id" , updateLanguageStatus );
// router.get("/getLevelNum" , getLevelNum);
// router.get("/getLevelAndQuestionNumForTopic/:syllabusId/:languageName" , getLevelAndQuestionNumForTopic);
// router.get("/getStudent/:email",getStudentByEmail);
// router.post("/addNewStudent", createNewStudent);
// router.put("/updateStudentDetails/:user_id", updateStudent)
// router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
