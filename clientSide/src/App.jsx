import { useState ,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import FetchStudentTable from './Components/CreateTable/FetchStudentTable'
import AddNewStudentForm from './Components/AddForm/AddNewStudentForm'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* <Route path='/' element={<LoginPage />} />
          <Route path='/signUp' element={<RegistrationPage />} /> */}
      
            <Route path='/dashboard' element={<FetchStudentTable />} />
            <Route path='/addStudent' element={<AddNewStudentForm />} />
            {/* <Route path='/dashboard/:language_Topics/:topic/levels' element={<LevelsPage />} />
            <Route path='/dashboard/:language_Topics/:topic/levels/:levelNum/challenges' element={<ChallengePage />} />
            <Route path='/dashboard/:language_Topics/:topic/levels/:levelNum/challenges/:challengeNum' element={<HTMLPage />} /> */}
         
        </Routes>
    </BrowserRouter>
 

      
    </>
  )
}

export default App
