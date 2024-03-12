import { Router } from "express";
import { fetchUserProfile } from "../controller/user.js";
// import { getAllLessons,getLessonById,createNewLesson, updateLessonDetails,deleteLesson } from "../controller/lesson.js";
const router = Router();


router.get("/fetchUserProfile/:userId" , fetchUserProfile);
// router.get("/getLesson/:id", getLessonById );
// router.post("/addNewLesson", createNewLesson);
// router.put("/updateLessonDetails/:id",updateLessonDetails)
// router.delete("/deleteLesson/:id" , deleteLesson);

export default router;