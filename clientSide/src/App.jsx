import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './Pages/User/LoginPage'
import SignUpPage from './Pages/User/SignupPage'
import { AuthProvider } from './Components/Login/AuthContext'
import { SyllabusProvider } from './Components/SyllabusContext'
import { TopicsProvider } from './Components/TopicsContext'
import { PointsProvider } from './Components/PointsContext'
import { LanguageStatusProvider } from './Components/LanguageStatusContext'
import Layout from './Components/Layout/Layout'

// Game pages
import TitlePage from './Pages/Game/TitlePage'
import LanguageTopicsPage from './Pages/Game/LanguageTopicsPage'
import LevelsPage from './Pages/Game/LevelsPage'
import ChallengePage from './Pages/Game/ChallengePage'
import HTMLPage from './Pages/Game/HTMLPage'

// Teacher pages
import TeacherDashboard from './Pages/Teacher/TeacherDashboard'
import ExamPage from './Pages/Teacher/Exampage'
import ExamResult from './Pages/Teacher/Examresult'

function App() {
  return (
    <BrowserRouter>
      <SyllabusProvider>
        <AuthProvider>
          <TopicsProvider>
            <PointsProvider>
              <LanguageStatusProvider>
                <Routes>
                  {/* Auth */}
                  <Route path='/' element={<LoginPage />} />
                  <Route path='/signup' element={<SignUpPage />} />

                  {/* Student — inside Layout */}
                  <Route path='/dashboard' element={<Layout currentComponent={{ component: <TitlePage /> }} />} />
                  <Route path='/dashboard/:syllabusId/:language' element={<Layout currentComponent={{ component: <LanguageTopicsPage /> }} />} />
                  <Route path='/dashboard/:syllabusId/:language/:topic/levels' element={<Layout currentComponent={{ component: <LevelsPage /> }} />} />
                  <Route path='/dashboard/:syllabusId/:language/:topic/levels/:levelNum/challenges' element={<Layout currentComponent={{ component: <ChallengePage /> }} />} />
                  <Route path='/dashboard/:syllabusId/:language/:topic/levels/:levelNum/challenges/:challengeNum' element={<Layout currentComponent={{ component: <HTMLPage /> }} />} />

                  {/* Exam — inside Layout (student takes exam) */}
                  <Route path='/exam/:exam_id' element={<Layout currentComponent={{ component: <ExamPage /> }} />} />
                  <Route path='/examResult/:exam_id/:score/:total' element={<Layout currentComponent={{ component: <ExamResult /> }} />} />

                  {/* Teacher — inside Layout (uses teacher sidebar) */}
                  <Route path='/teacher-dashboard' element={<Layout currentComponent={{ component: <TeacherDashboard /> }} />} />
                </Routes>
              </LanguageStatusProvider>
            </PointsProvider>
          </TopicsProvider>
        </AuthProvider>
      </SyllabusProvider>
    </BrowserRouter>
  );
}

export default App;