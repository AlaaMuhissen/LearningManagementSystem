import { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { FaPencilRuler } from 'react-icons/fa';
import MuiDrawer from '@mui/material/Drawer';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import BarChartIcon from '@mui/icons-material/BarChart';
import { CircularProgress } from '@mui/material';
import { ShowProgress } from '../../Pages/Game/ShowProgress';
import AppBarMU from './AppBar';
import Header from './DrawerHeader';
import Sidebar from './Sidebar';
import DrawerContent from './DrawerContent';
import AIRobotButton from '../Airobotbutton';
import { ActiveExerciseProvider } from '../ActiveExerciseContext';
import { useAuth } from '../Login/AuthContext';
import TitlePage from '../../Pages/Game/TitlePage';
import UserProfile from '../../Pages/User/UserProfile';
import TeacherDashboard from '../../Pages/Teacher/TeacherDashboard';
import StudentExams from '../../Pages/Student/StudentExams';
import JoinTeacher from '../../Pages/Student/JoinTeacher';
import StudentPractice from '../../Pages/Student/StudentPractice';
import TeacherStats from '../../Pages/Teacher/Teacherstats';

const drawerWidth = 260;
 
const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  background: 'rgba(10, 14, 35, 0.97)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(100, 255, 218, 0.08)',
  boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
});
 
const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  background: 'rgba(10, 14, 35, 0.97)',
  borderRight: '1px solid rgba(100, 255, 218, 0.08)',
  boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
});
 
const DrawerHeaderSpacer = styled('div')(({ theme }) => ({
  ...theme.mixins.toolbar,
  minHeight: '60px !important',
}));
 
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
);
 
const TeacherContentOptions = [
  { icon: <PeopleAltIcon sx={{ fontSize: 22, color: '#4fc3f7' }} />,     text: 'Students',    tab: 0 },
  { icon: <FitnessCenterIcon sx={{ fontSize: 22, color: '#a78bfa' }} />, text: 'Exercises',   tab: 1 },
  { icon: <QuizIcon sx={{ fontSize: 22, color: '#ffd700' }} />,          text: 'Exams',       tab: 2 },
  { icon: <AssessmentIcon sx={{ fontSize: 22, color: '#f97316' }} />,    text: 'Submissions', tab: 3 },
  { icon: <InsightsIcon sx={{ fontSize: 22, color: '#ec4899' }} />,      text: 'Analytics',   tab: 4 },
  { icon: <BarChartIcon sx={{ fontSize: 22, color: '#64ffda' }} />,      text: 'Stats',       tab: null, component: <TeacherStats /> },
];
 
const StudentContentOptions = [
  { icon: <FaPencilRuler fontSize="20px" />, text: 'My Exercises', component: <TitlePage /> },
  { icon: <FitnessCenterIcon sx={{ fontSize: 22 }} />, text: 'Practice', component: <StudentPractice /> },
  { icon: <QuizIcon sx={{ fontSize: 22 }} />, text: 'My Exams', component: <StudentExams /> },
  { icon: <GroupAddIcon sx={{ fontSize: 22 }} />, text: 'Join Teacher', component: <JoinTeacher /> },
  { icon: <DonutLargeIcon sx={{ fontSize: 22 }} />, text: 'My Progress', component: <ShowProgress /> },
  { icon: <PersonOutlineIcon sx={{ fontSize: 22 }} />, text: 'Profile', component: <UserProfile /> },
];
 

export default function Layout({ currentComponent }) {
  const { userData, logout } = useAuth();
  const [open, setOpen] = useState(window.innerWidth > 900);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCom, setCurrentCom] = useState(null);
  const [teacherTab, setTeacherTab] = useState(0);
 
  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);
 
  const handleContentChange = (index) => {
    setCurrentCom(null);
    setCurrentIndex(index);
    // For teacher — set the active tab based on sidebar selection
    if (userData?.role !== 'student') {
      const opt = TeacherContentOptions[index];
      if (opt?.tab !== undefined) setTeacherTab(opt.tab);
    }
  };
 
  useEffect(() => { setCurrentCom(currentComponent); }, [currentComponent]);
 
  useEffect(() => {
    if (!userData) return;
    setCurrentContent(userData.role === 'student' ? StudentContentOptions : TeacherContentOptions);
    // Reset to first item when role is loaded
    setCurrentIndex(0);
  }, [userData]);
 
  if (!userData) {
    return (
      <Box sx={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0b0920 0%, #0d1b2e 50%, #0a1628 100%)'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{
            width: 60, height: 60, borderRadius: '16px', mx: 'auto', mb: 2,
            background: 'linear-gradient(135deg, rgba(100,255,218,0.2), rgba(79,195,247,0.2))',
            border: '1px solid rgba(100,255,218,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, animation: 'pulse 2s infinite',
          }}>💻</Box>
          <CircularProgress size={24} sx={{ color: '#64ffda' }} />
        </Box>
      </Box>
    );
  }
 
  return (
    <ActiveExerciseProvider>
      <Box sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #0b0f24 0%, #080d1e 100%)',
        color: '#fff',
        width: '100%',
        overflowX: 'hidden',
      }}>
        <CssBaseline />
        <AppBarMU open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
        <Drawer variant="permanent" open={open}>
          <Header open={open} handleDrawerOpen={handleDrawerOpen} handleDrawerClose={handleDrawerClose} />
          {currentContent && (
            <Sidebar
              open={open}
              contentOptions={currentContent}
              handleContentChange={handleContentChange}
              logout={logout}
              handleDrawerOpen={handleDrawerOpen}
              handleDrawerClose={handleDrawerClose}
            />
          )}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 1.5, sm: 2, md: 3 },
            minWidth: 0,
            maxWidth: '100%',
            overflow: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <DrawerHeaderSpacer />
          {currentContent && (
            <DrawerContent currentComponent={
              currentCom
                ? currentCom
                : userData?.role !== 'student'
                  ? (currentContent[currentIndex]?.component
                      ? currentContent[currentIndex]
                      : { component: <TeacherDashboard activeTab={teacherTab} /> })
                  : currentContent[currentIndex]
            } />
          )}
        </Box>
        <AIRobotButton />
      </Box>
    </ActiveExerciseProvider>
  );
}