import { Router } from "express";
import { getAllQuestionAndAnswer } from "../../controller/Student/questionAndAnswer.js";

const router = Router();


router.get("/getAllQuestionAndAnswer/:syllabusId/:languageName" , getAllQuestionAndAnswer);
// router.get("/getLevelAndQuestionNumForTopic/:syllabusId/:languageName" , getLevelAndQuestionNumForTopic);
// router.get("/getStudent/:email",getStudentByEmail);
// router.post("/addNewStudent", createNewStudent);
// router.put("/updateStudentDetails/:user_id", updateStudent)
// router.delete("/deleteStudent/:email" , deleteStudent);

export default router;
