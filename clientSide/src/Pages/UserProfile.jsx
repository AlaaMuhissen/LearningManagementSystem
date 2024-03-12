import React, { useState, useEffect } from 'react';
import { Typography, Paper, Grid, Avatar, Divider ,CircularProgress} from '@mui/material';
import { useAuth } from '../Components/Login/AuthContext';
import { Email, Phone, LocationOn, Person, School, Work, Star } from '@mui/icons-material';
import AvatarImg from '/boy.png';

function UserProfile() {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userData } = useAuth();
  const userId = userData?.id;

  useEffect(() => {
    fetch(`http://localhost:3001/api/user/fetchUserProfile/${userId}`)
      .then(response => response.json())
      .then(data => {
        setUserProfile(data);
        console.log(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} />
      </div>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, margin: 'auto', backgroundColor: '#f5f5f5' }}>
      <Grid container spacing={3} alignItems="center" justifyContent="center">
        <Grid item xs={12} textAlign="center">
          <Avatar sx={{ width: 120, height: 120, backgroundColor: '#1976d2' }}>
            <img src={AvatarImg} alt="profile" style={{width:'70%',height:'70%'}}/>
          </Avatar>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            {userData.username}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Email sx={{ mr: 1 }} /> {userData.email}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Phone sx={{ mr: 1 }} /> {userData.phone}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1 }} /> {userData.address}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Work sx={{ mr: 1 }} /> Role: {userData.role}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1 }} /> Syllabus Number: {userProfile.syllbusNum}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1 }} /> Primary Syllabus ID: {userProfile.pimarySyllbus_id}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <School sx={{ mr: 1 }} /> Res Teacher Number: {userProfile.resTeacherNum}
          </Typography>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
            <Star sx={{ mr: 1 }} /> Points: {userProfile.Points}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default UserProfile;
