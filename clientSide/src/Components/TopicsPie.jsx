import API_URL from '../config/api.js';
import { useState, useEffect } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { useAuth } from '../Components/Login/AuthContext';
import TopicProgress from './TopicProgress';

const TopicsPie = ({ syllabus_id, language_id, languageName }) => {
  const [TopicData, setTopicData] = useState([]);
  const [TopicProgressData, setTopicProgressData] = useState([]);
  const { userData } = useAuth();
  const studentId = userData?.id;

  const fetchTopicProgressData = async () => {
    try {
      if (studentId) {
        const response = await fetch(`${API_URL}/api/progress/getTopicProgress/${studentId}/${syllabus_id}/${language_id}`);
        const data = await response.json();
        setTopicProgressData(data);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    }
  };

  const fetchTopicsData = async () => {
    try {
      if (studentId) {
        const response = await fetch(`${API_URL}/api/topics/getTopicsBasedOnSyllabusId/${syllabus_id}`);
        const data = await response.json();
        // Only show topics for this language
        setTopicData(data.filter(t => t.language_id === language_id));
      }
    } catch (error) {
      console.error('Error fetching topics data:', error);
    }
  };

  useEffect(() => {
    fetchTopicsData();
    fetchTopicProgressData();
  }, [syllabus_id, language_id]);

  const calculateTopicProgress = (topic_name) => {
    const topicInProgress = TopicProgressData?.find(item => item.topicName === topic_name);
    if (!topicInProgress) return 0;
    return topicInProgress.completed === true ? 100 : 50;
  };

  return (
    <div className="w-full">
      {languageName && (
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">
          {languageName}
        </h3>
      )}
      {!TopicProgressData || TopicProgressData.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl p-4 bg-white/[0.02] border border-white/[0.05]">
          <h4 className="text-sm text-white/40 text-center">No topics started yet</h4>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {TopicData?.map((topic) => (
            <TopicProgress
              key={topic.id}
              syllabus_id={syllabus_id}
              studentId={studentId}
              topic={topic}
              topicProgress={TopicProgressData}
              calculateTopicProgress={calculateTopicProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicsPie;