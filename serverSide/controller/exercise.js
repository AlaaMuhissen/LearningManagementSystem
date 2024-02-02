import { prisma } from '../Prisma/db.js';

/** Retrieves all Lessons from the database */
export const getAllExercises = async (req, res ) => {
  try {
    const AllExercises = await prisma.exercises.findMany({})
    res.send(AllExercises);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/** Retrieves a specific exercise by ID */
export const getExerciseById = async (req, res) => {
  const { id } = req.params;
  try {
    const exercise = await prisma.exercises.findUnique({
      where: {
        id: id,
      },
    });

    if (!exercise) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.send(exercise);
  } catch (error) {
    console.error(`Error fetching exercise with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**Creates a new exercise */
export const createNewExercise = async (req, res) => {
    const exerciseData = req.body;
    console.log(exerciseData)
    try {
      const newExercise = await prisma.exercises.create({
        data: {
          description: exerciseData.description,
          code: exerciseData.code,    
          grade: exerciseData.grade,
          lessonid:exerciseData.lessonid
        },
      });
  
      console.log(newExercise);
      res.status(201).json(newExercise);
    } catch (error) {
      console.error('Error creating new exercise:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
/**Updates details of a specific exercise by ID */  
  export const updateExerciseDetails = async(req, res) =>{
    const { id } = req.params;
    const updatedField = req.body;
 
    try{     
        const updatedExercise = await prisma.exercises.update({
            where: {
              id: id,
            },
            data: updatedField,
          });
          console.log('Exercise updated:', updatedExercise);
          res.status(200).json(updatedExercise);
    }catch(error){
        console.error('Error updating an exercise:', error);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
  }
/**Deletes a specific exercise by ID */
  export const deleteExercise = async(req, res) =>{
    const {id} = req.params;
    try{
        const deleteExercise = await prisma.exercises.delete({
            where: {
              id: id,
            },
          });
          res.status(200).json({ message: 'The exercise deleted successfully' });  
    }catch(error){
        console.error('Error deleting an exercise:', error);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
  }

