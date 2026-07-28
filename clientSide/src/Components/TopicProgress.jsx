import API_URL from '../config/api.js';
import { useEffect, useState } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import LevelProgress from './LevelProgress';

const TopicProgress = ({ syllabus_id, studentId, topic, topicProgress, calculateTopicProgress }) => {
  const [LevelProgressData, setLevelProgressData] = useState([]);
  const [LevelData, setLevelData] = useState([]);
  const titleWithoutDash = topic.topic_name.split("_").join(" ");
  const GetTopicProgressId = topicProgress?.find((item) => item.topicName === topic.topic_name);
  const topic_id_in_progress = GetTopicProgressId?.id;

  const fetchLevelsProgressData = async (topic_id) => {
    try {
      if (studentId) {
        const response = await fetch(`${API_URL}/api/progress/getLevelProgress/${studentId}/${syllabus_id}/${topic_id}`);
        const data = await response.json();
        setLevelProgressData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching level progress:', error);
    }
  };

  const fetchLevelData = async (language_name, topic_name) => {
    try {
      if (studentId) {
        const response = await fetch(`${API_URL}/api/topics/getLevelAndQuestionNumForTopic/${syllabus_id}/${language_name}/${topic_name}`);
        const data = await response.json();
        setLevelData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching level data:', error);
    }
  };

  useEffect(() => {
    if (topic_id_in_progress) {
      fetchLevelsProgressData(topic_id_in_progress);
      fetchLevelData(topic.lanName, topic.topic_name);
    }
  }, [topic_id_in_progress]);

  const calculateLevelProgress = (topic_id_in_progress, id, levelNum) => {
    const levelProgress = LevelProgressData.find(
      (item) => item.topic_id === topic_id_in_progress && item.level_id === levelNum
    );
    const level = LevelData.find(
      (item) => item.topic_id === id && item.current_level === levelNum
    );

    if (!levelProgress || !level) return 0;
    const questionsNum = level.questionsNum ?? level.questionsnum ?? 1;
    return Math.round((levelProgress.currQuestion / questionsNum) * 100);
  };

  const topicPercent = parseFloat(calculateTopicProgress(topic.topic_name));

  return (
    <>
      {topicProgress.find((topicPro) => topicPro.topicName === topic.topic_name) &&
        <div className="flex flex-col items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex-shrink-0 w-[180px]">
          <p className="text-sm font-semibold text-white/80 text-center leading-tight">
            {titleWithoutDash}
          </p>

          {/* Single overall topic ring — clear at a glance */}
          <div className="w-20 h-20">
            <CircularProgressbar
              value={topicPercent}
              text={`${topicPercent}%`}
              strokeWidth={9}
              styles={buildStyles({
                pathColor: '#a78bfa',
                trailColor: 'rgba(255,255,255,0.07)',
                textColor: '#e6f1ff',
                strokeLinecap: 'round',
                textSize: '24px',
              })}
            />
          </div>

          {/* Per-level breakdown — bars, colored to match the page legend */}
          <div className="flex flex-col gap-2 w-full">
            {[...Array(topic.levelNum ?? topic.levelnum ?? 3).keys()].map((level, i) => (
              <LevelProgress
                key={i}
                topicIdInProgress={topic_id_in_progress}
                level={level}
                topic={topic}
                calculateLevelProgress={calculateLevelProgress}
              />
            ))}
          </div>
        </div>
      }
    </>
  );
};

export default TopicProgress;