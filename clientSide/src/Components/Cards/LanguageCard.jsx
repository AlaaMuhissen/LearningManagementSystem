import React from 'react';
import { getIconComponent } from '../Logics/createIconComponent';
import { useNavigate } from 'react-router-dom';
import './Card.css'

export default function LanguageCard({ icon, title , syllabusId}) {

  const IconComponent = getIconComponent(icon, '3rem', '#100F15'); 

  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/dashboard/${syllabusId}/${title}`);
  };

  return (
<>
    <div className="jigsaw1" onClick={handleClick}>
	  <span className="t"></span>
	  <span className="r"></span>
	  <span className="b"></span>
	  <span className="l"></span>
  <span className="text">{IconComponent}</span>
	</div>
  </>
  );
}
