// import { prisma } from '../config/db.js';

// /** Retrieves all Lessons from the database */
// export const getAllLessons = async (req, res ) => {
//   try {
//     const lessons = await prisma.lesson.findMany({});
//     res.send(lessons);
//   } catch (error) {
//     console.error('Error executing query:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// /** Retrieves a specific lesson by ID */
// export const getLessonById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const lesson = await prisma.lesson.findUnique({
//       where: {
//         id: id,
//       },
//     });

//     if (!lesson) {
//       return res.status(404).json({ error: 'Lesson not found' });
//     }

//     res.send(lesson);
//   } catch (error) {
//     console.error(`Error fetching lesson with ID ${id}:`, error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// /**Creates a new lesson */
// export const createNewLesson = async (req, res) => {
//     const lessonData = req.body;
//     console.log(lessonData)
//     try {
//       const newLesson = await prisma.lesson.create({
//         data: {
//           subject: lessonData.subject,
//           description: lessonData.description,
//           code: lessonData.code,    
//         },
//       });
  
//       console.log(newLesson);
//       res.status(201).json(newLesson);
//     } catch (error) {
//       console.error('Error creating new lesson:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };
// /**Updates details of a specific lesson by ID */  
//   export const updateLessonDetails = async(req, res) =>{
//     const { id } = req.params;
//     const updatedField = req.body;
//     console.log(id);
//     console.log(updatedField)
//     try{     
//         const updatedLesson = await prisma.lesson.update({
//             where: {
//               id: id,
//             },
//             data: updatedField,
//           });
//           console.log('Lesson updated:', updatedLesson);
//           res.status(200).json(updatedLesson);
//     }catch(error){
//         console.error('Error creating new lesson:', error);
//         res.status(500).json({ error: 'Internal Server Error' }); 
//     }
//   }
// /**Deletes a specific lesson by ID */
//   export const deleteLesson = async(req, res) =>{
//     const {id} = req.params;
//     try{
//         const deleteLesson = await prisma.lesson.delete({
//             where: {
//               id: id,
//             },
//           });
//           res.status(200).json({ message: 'The lesson deleted successfully' });  
//     }catch(error){
//         console.error('Error creating new student:', error);
//         res.status(500).json({ error: 'Internal Server Error' }); 
//     }
//   }

