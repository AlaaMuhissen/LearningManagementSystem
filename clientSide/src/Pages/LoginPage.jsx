import React from 'react'

import LoginWithEmail from '../Components/Login/LoginWithEmail'
export default function LoginPage() {

  return (
  <>
    <div
    className='w-ful bg-cover bg-center h-screen flex justify-center items-center' 
    >
    <div  className='h-screen flex justify-center align-middle
    items-center'>

    <LoginWithEmail />
   
    </div>
    </div>
    </>
  )
}
