import React , {useEffect , useState} from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { PiExamFill , PiStudentFill} from "react-icons/pi";
import { FaBookOpen ,FaPencilRuler } from "react-icons/fa";
import FetchStudentTable from '../Components/CreateTable/FetchStudentTable';
import FetchLessonTable from '../Components/CreateTable/FetchLessonTable';
import FetchExerciseTable from '../Components/CreateTable/FetchExerciseTable';
import FetchExamTable from '../Components/CreateTable/FetchExamTable';
import { useAuth } from '../Components/Login/AuthContext';
import TitlePage from './TitlePAge';
import LogoutIcon from '@mui/icons-material/Logout';
import { Button } from '@mui/material';
import { usePoints } from '../Components/PointsContext';
import { ShowProgress } from './ShowProgress';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
  backgroundColor:  "#193255",
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
  backgroundColor: "#193255",
  color: theme.palette.primary.contrastText,
});

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  bgcolor :"#193255"
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    bgcolor :"#193255",
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
      bgcolor :"#193255"
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
      bgcolor :"#193255"
    }),
  }),
);

const TeacherContentOptions = [
  { icon: <PiStudentFill fontSize={'24px'}/>, text: 'Student Data', component: <FetchStudentTable /> },
  { icon: <FaBookOpen fontSize={'24px'}/>, text: 'Lessons Data', component: <FetchLessonTable /> },
  { icon: <FaPencilRuler fontSize={'24px'}/>, text: 'Exercises Data', component: <FetchExerciseTable /> },
  { icon: <PiExamFill fontSize={'24px'} />, text: 'Exams Data', component: <FetchExamTable /> },

];

const StudentContentOptions = [
  { icon: <FaPencilRuler fontSize={'24px'}/>, text: 'My Exercises', component: <TitlePage /> },
  { icon: <DonutLargeIcon fontSize={'24px'}/>, text: 'My progress', component: <ShowProgress /> },
  { icon: <PersonOutlineIcon fontSize={'24px'}/>, text: 'Profile', component: <FetchLessonTable /> },
 
];

export default function DashboardPage() {
  const theme = useTheme();
  const { userData ,logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [currentContent, setCurrentContent] = useState(null);
  let userPoints = 0;
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
    if (userRole === 'student') {
      setCurrentContent(StudentContentOptions); 
    
      console.log(points);
      // userPoints = points;
    } else {
      setCurrentContent(TeacherContentOptions); 
    }
  }, [userRole]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0d1d32', color: '#ffffff' }}>
       <AppBar position="fixed" open={open}>
        <Toolbar sx= {{ bgcolor :"#193255"}}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{
              marginRight: 5,
              ...(open && { display: 'none' }),
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            {userData?.username}
          </Typography>
          {userData?.role === "student" && <Typography variant="h6" noWrap component="div">
             ,Points: {userPoints}
          </Typography>}
        </Toolbar>
      </AppBar>
      <Drawer variant="permanent" open={open}>
      <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'rtl' ? (
              <ChevronRightIcon sx={{ color: '#ffffff'}} />
            ) : (
              <ChevronLeftIcon sx={{ color: '#ffffff' }} />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {currentContent && currentContent.map((option, index) => (
            <ListItem key={option.text} disablePadding sx={{ display: 'block' }}>
              <ListItemButton
                onClick={() => handleContentChange(index)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  color: '#ffffff',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : 'auto',
                    justifyContent: 'center',
                    color: '#ffffff',
                  }}
                >
                  {option.icon}
                </ListItemIcon>
                <ListItemText primary={option.text} sx={{ opacity: open ? 1 : 0 }} />
              </ListItemButton>
            </ListItem>
          ))
          }
            <button onClick={()=> {logout()}}><LogoutIcon/>LogOut</button> 
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <DrawerHeader />
        <Box sx={{ margin: '20px' }}>
          <Typography variant="h4" gutterBottom>
            {currentContent?.[currentIndex]?.text}
          </Typography>
          {currentContent?.[currentIndex]?.component}
        </Box>
      </Box>
    </Box>
  );
}

