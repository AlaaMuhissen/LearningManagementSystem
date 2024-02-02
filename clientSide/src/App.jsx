import { useState ,useEffect } from 'react'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AddNewStudentForm from './Components/AddForm/AddNewStudentForm'
import LoginPage from './Pages/LoginPage'
import { AuthProvider } from './Components/Login/AuthContext'
import AddNewLessonForm from './Components/AddForm/AddNesLesson'
import AddNewExamForm from './Components/AddForm/AddNewExam'
import AddNewExerciseForm from './Components/AddForm/AddNewExercise'
import DashboardPage from './Pages/DashboardPage'

function App() {
  

  return (
    <>
      <BrowserRouter>
      <AuthProvider>
        <Routes>
        <Route path='/' element={<LoginPage/>} />
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/addStudent' element={<AddNewStudentForm />} />
            <Route path='/addLesson' element={<AddNewLessonForm />} />
            <Route path='/addExam' element={<AddNewExamForm />} />
            <Route path='/addExercise' element={<AddNewExerciseForm />} />   
        </Routes>
        </AuthProvider>
    </BrowserRouter>
 

      
    </>
  )
}

export default App
