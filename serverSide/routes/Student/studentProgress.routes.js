import { Router } from "express";

import { insertStudentProgress  ,checkAndUpdateProgress, updateLevelProgress, updateLanguageStartStatus, updateLanguageFinishStatus} from "../../controller/Student/studentProgress.js";
const router = Router();


router.post("/createStudentProgress/:studentId/:syllabus_id" , insertStudentProgress);
// router.get("/getStudentProgress/:student_id" , getFormattedProgressData);
router.put("/updateLanguageStartStatus/:student_id" , updateLanguageStartStatus);
router.put("/updateLanguageFinishStatus/:student_id" , updateLanguageFinishStatus);

router.put("/updateProgress" , checkAndUpdateProgress);
router.put("/updateLevel" , updateLevelProgress);
// router.get("/getLevelNum" , getLevelNum);
// router.get("/getLevelAndQuestionNumForTopic/:syllabusId/:languageName" , getLevelAndQuestionNumForTopic);
// router.get("/getStudent/:email",getStudentByEmail);
// router.post("/addNewStudent", createNewStudent);
// router.put("/updateStudentDetails/:user_id", updateStudent)
// router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
