import React, { useEffect, useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { PiExamFill, PiStudentFill } from 'react-icons/pi';
import { FaBookOpen, FaPencilRuler } from 'react-icons/fa';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FetchStudentTable from '../CreateTable/FetchStudentTable';
import FetchLessonTable from '../CreateTable/FetchLessonTable';
import FetchExerciseTable from '../CreateTable/FetchExerciseTable';
import FetchExamTable from '../CreateTable/FetchExamTable';
import { Divider } from '@mui/material';

import { ShowProgress } from '../../Pages/ShowProgress';
import AppBarMU from './AppBar';
import Header from './DrawerHeader';
import Sidebar from './Sidebar';
import DrawerContent from './DrawerContent';
import { useAuth } from '../Login/AuthContext';
import { usePoints } from '../PointsContext';
import TitlePage from '../../Pages/TitlePage';



const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor: '#193255',
  color: theme.palette.primary.contrastText,
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
  backgroundColor: '#193255',
  color: theme.palette.primary.contrastText,
});

const Drawer = styled('div', { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  bgcolor: '#193255',
  ...(open && {
    ...openedMixin(theme),
    bgcolor: '#193255',
  }),
  ...(!open && {
    ...closedMixin(theme),
    bgcolor: '#193255',
  }),
}));

const TeacherContentOptions = [
  { icon: <PiStudentFill fontSize={'24px'} />, text: 'Student Data', component: <FetchStudentTable /> },
  { icon: <FaBookOpen fontSize={'24px'} />, text: 'Lessons Data', component: <FetchLessonTable /> },
  { icon: <FaPencilRuler fontSize={'24px'} />, text: 'Exercises Data', component: <FetchExerciseTable /> },
  { icon: <PiExamFill fontSize={'24px'} />, text: 'Exams Data', component: <FetchExamTable /> },
];

const StudentContentOptions = [
  { icon: <FaPencilRuler sx={{ fontSize: 40 }}/>, text: 'My Exercises', component: <TitlePage/> },
  { icon: <DonutLargeIcon sx={{ fontSize: 24 }} />, text: 'My progress', component: <ShowProgress/> }, 
  { icon: <PersonOutlineIcon sx={{ fontSize: 24 }} />, text: 'Profile', component: <FetchLessonTable /> },
];

export default function Layout({ currentComponent }) {
  const theme = useTheme();
  const { userData, logout } = useAuth();
  const [open, setOpen] = useState(window.innerWidth > 600);
  const [currentContent, setCurrentContent] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const userRole = userData ? userData.role : '';
  const { points } = usePoints();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleContentChange = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    setCurrentContent(userRole === 'student' ? StudentContentOptions : TeacherContentOptions);
  }, [userRole]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0d1d32', color: '#ffffff' }}>
      <CssBaseline />
      <AppBarMU open={open} handleDrawerOpen={handleDrawerOpen} />
      <Drawer variant="permanent" open={open}>
        <Header handleDrawerClose={handleDrawerClose} />
        <Divider />
        {currentContent && (
          <Sidebar
            open={open}
            contentOptions={currentContent}
            handleContentChange={handleContentChange}
            logout={logout}
          />
        )}
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 3 } }}>
        <Header />
        <DrawerContent currentComponent={currentComponent || currentContent[currentIndex]} />
      </Box>
    </Box>
  );
}