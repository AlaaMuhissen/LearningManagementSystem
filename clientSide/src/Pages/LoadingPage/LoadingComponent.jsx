import React from 'react';
import './LoadingComponent.css'
import { GiLargeDress } from "react-icons/gi";
const LoadingComponent = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="spinner">
        <GiLargeDress  size={"200px"} color='#704F38' />
      </div>
    </div>
  );
};

export default LoadingComponent;
