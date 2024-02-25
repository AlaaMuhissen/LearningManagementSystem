import React from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';



const LevelProgress = ({ topicIdInProgress, level, topic, calculateLevelProgress }) => {
    const colors = ["green", "yellow", "blue"];
    const widthPercentage = `${90 - (level * 20)}%`;
  
    return (
      <div
        key={level}
        style={{
          position: "absolute",
          width: widthPercentage
        }}
      >
        <CircularProgressbar
          value={calculateLevelProgress(topicIdInProgress, topic.id, level + 1)}
        //   text={`${level + 1}`}
          strokeWidth={8}
          styles={buildStyles({
            pathColor: colors[level],
            trailColor: "transparent"
          })}
        />
      </div>
    );
  };
  

export default LevelProgress