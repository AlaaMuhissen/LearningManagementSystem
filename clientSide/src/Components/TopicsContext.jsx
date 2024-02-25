import React, { createContext, useContext, useState, useEffect } from 'react';

const TopicsContext = createContext();

export const TopicsProvider = ({ children }) => {
  const [topics, setTopics] = useState([]);
  const [syllabusId, setSyllabusId] = useState(null);
  const [language, setLanguage] = useState(null);
 

  useEffect(() => {
    if (syllabusId && language) {
      fetch(`http://localhost:3001/api/topics/getTopicsAndLevelsBasedOnLanguage/${syllabusId}/${language}`)
        .then(res => res.json())
        .then(data => {
          setTopics(data);
        })
        .catch(error => {
          console.error('Error during fetching topics:', error);
        });
    }
  }, [syllabusId, language ]);

  return (
    <TopicsContext.Provider value={{ topics, setSyllabusId, setLanguage  }}>
      {children}
    </TopicsContext.Provider>
  );
};

export const useTopics = (syllabusId, language) => {
  const { topics, setSyllabusId, setLanguage ,setTopicName } = useContext(TopicsContext);

  useEffect(() => {
    setSyllabusId(syllabusId);
    setLanguage(language);

  }, [setSyllabusId, setLanguage, syllabusId, language ,setTopicName ]);

  return topics;
};
