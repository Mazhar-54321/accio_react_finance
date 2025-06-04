import React, { useEffect } from 'react'
import Header from './Header'
import useAuth from '../hooks/useAuth'
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import AuthForm from './AuthForm';
import Dashboard from './Dashboard';

const FinanceManagement = () => {
  const {loading,user} = useAuth();  
  useEffect(()=>{
   console.log(user,"userrrrr")
  },[user])
  return (
    <div>
        <Header user={user} />
        {loading ? 
        <Box sx={{ display: 'flex',position:'absolute',top:'50%',left:'50%' }}>
            <CircularProgress />
        </Box>: user ? <Dashboard /> : <AuthForm />
          }
        
        
    </div>
  )
}

export default FinanceManagement