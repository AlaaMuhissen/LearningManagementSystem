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
import { SyllabusProvider } from './Components/SyllabusContext'
import LanguageTopicsPage from './Pages/LanguageTopicsPage'
import { TopicsProvider } from './Components/TopicsContext'
import LevelsPage from './Pages/LevelsPage'
import ChallengePage from './Pages/ChallengePage'
import HTMLPage from './Pages/HTMLPage'


function App() {
  

  return (
    <>
    <BrowserRouter>
     <SyllabusProvider>
      <AuthProvider>
   
                <TopicsProvider>
          <Routes>
            <Route path='/' element={<LoginPage/>} />
                <Route path='/dashboard' element={<DashboardPage />} />                
  
                  <Route path='/dashboard/:syllabusId/:language' element={<LanguageTopicsPage />} />
                  <Route path='/dashboard/:syllabusId/:language/:topic/levels' element={<LevelsPage />} />
                  <Route path='/dashboard/:syllabusId/:language/:topic/levels/:levelNum/challenges' element={<ChallengePage />} />
                  <Route path='/dashboard/:syllabusId/:language/:topic/levels/:levelNum/challenges/:challengeNum' element={<HTMLPage/>} />
                <Route path='/addStudent' element={<AddNewStudentForm />} />
                <Route path='/addLesson' element={<AddNewLessonForm />} />
                <Route path='/addExam' element={<AddNewExamForm />} />
                <Route path='/addExercise' element={<AddNewExerciseForm />} />   
            </Routes>
                </TopicsProvider>
         </AuthProvider>
      </SyllabusProvider>
    </BrowserRouter>
 

      
    </>
  )
}

export default App
