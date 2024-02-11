// import { prisma } from '../Prisma/db.js';

// /** Retrieves all exams from the database */
// export const getAllExams = async (req, res ) => {
//   try {
//     const AllExams = await prisma.exam.findMany({})
//     res.send(AllExams);
//   } catch (error) {
//     console.error('Error executing query:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// /** Retrieves a specific exam by ID */
// export const getExamById = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const exam = await prisma.exam.findUnique({
//       where: {
//         id: id,
//       },
//     });

//     if (!exam) {
//       return res.status(404).json({ error: 'exam not found' });
//     }

//     res.send(exam);
//   } catch (error) {
//     console.error(`Error fetching exam with ID ${id}:`, error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// /**Creates a new exam */
// export const createNewExam = async (req, res) => {
//     const examData = req.body;
//     console.log(examData)
//     try {
//       const newExam = await prisma.exam.create({
//         data: {
//           description: examData.description,
//           grade: examData.grade,
//           exerciseids: examData.exerciseids,    
//         },
//       });
  
//       console.log(newExam);
//       res.status(201).json(newExam);
//     } catch (error) {
//       console.error('Error creating new exam:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };
// /**Updates details of a specific exam by ID */  
//   export const updateExamDetails = async(req, res) =>{
//     const { id } = req.params;
//     const updatedField = req.body;
 
//     try{     
//         const updatedExam = await prisma.exam.update({
//             where: {
//               id: id,
//             },
//             data: updatedField,
//           });
//           console.log('Exercise updated:', updatedExam);
//           res.status(200).json(updatedExam);
//     }catch(error){
//         console.error('Error updating an exam:', error);
//         res.status(500).json({ error: 'Internal Server Error' }); 
//     }
//   }
// /**Deletes a specific exam by ID */
//   export const deleteExam = async(req, res) =>{
//     const {id} = req.params;
//     try{
//         const deleteExam = await prisma.exam.delete({
//             where: {
//               id: id,
//             },
//           });
//           res.status(200).json({ message: 'The exam deleted successfully' });  
//     }catch(error){
//         console.error('Error deleting an exam:', error);
//         res.status(500).json({ error: 'Internal Server Error' }); 
//     }
//   }

