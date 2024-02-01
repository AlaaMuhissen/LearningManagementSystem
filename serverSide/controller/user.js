import { prisma } from '../Prisma/db.js';

/** Retrieves all students from the database */
export const queryStudentTable = async (req, res ) => {
  try {
    const students = await prisma.student.findMany({});
    res.send(students);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/** Retrieves a specific student by ID */
export const getStudentById = async (req, res) => {
  const { id } = req.params;
  try {
    const student = await prisma.student.findUnique({
      where: {
        id: id,
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.send(student);
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**Creates a new student */
export const createNewStudent = async (req, res) => {
    const studentData = req.body;
    // console.log(studentData)
    try {
      const newStudent = await prisma.student.create({
        data: {
          name: studentData.name,
          phone: studentData.phone,
          email: studentData.email,
          progress: studentData.progress,
          // status: studentData.status || 'ACTIVE',
        },
      });
  
      console.log(newStudent);
      res.status(201).json(newStudent);
    } catch (error) {
      console.error('Error creating new student:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
/**Updates details of a specific student by ID */  
  export const updateStudentDetails = async(req, res) =>{
    const { id } = req.params;
    const updatedField = req.body;
    try{     
        const updatedStudent = await prisma.student.update({
            where: {
              id: id,
            },
            data: updatedField,
          });
          console.log('Student updated:', updatedStudent);
          res.status(200).json(updatedStudent);
    }catch(error){
        console.error('Error creating new student:', error);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
  }
/**Deletes a specific student by ID */
  export const deleteStudent = async(req, res) =>{
    const {id} = req.params;
    try{
        const deleteUser = await prisma.student.delete({
            where: {
              id: id,
            },
          });
          res.status(200).json({ message: 'The student deleted successfully' });  
    }catch(error){
        console.error('Error creating new student:', error);
        res.status(500).json({ error: 'Internal Server Error' }); 
    }
  }

