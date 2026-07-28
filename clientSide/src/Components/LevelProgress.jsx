// Colors match the Level 1 / 2 / 3 legend shown in ShowProgress.jsx exactly
// (green-500 / yellow-300 / gray-500) so the legend actually means something.
const LEVEL_COLORS = ['#22c55e', '#fde047', '#6b7280'];

const LevelProgress = ({ topicIdInProgress, level, topic, calculateLevelProgress }) => {
  const value = calculateLevelProgress(topicIdInProgress, topic.id, level + 1);
  const color = LEVEL_COLORS[level] ?? LEVEL_COLORS[LEVEL_COLORS.length - 1];

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="text-[10px] font-bold w-6 text-white/40 flex-shrink-0">
        L{level + 1}
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] text-white/40 w-8 text-right flex-shrink-0">
        {value}%
      </span>
    </div>
  );
};

export default LevelProgress;