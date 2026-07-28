import API_URL from '../../config/api.js';
import { useEffect, useState } from 'react';
import 'chart.js/auto';
import { useAuth } from '../../Components/Login/AuthContext';
import TopicsPie from '../../Components/TopicsPie';
import TopicProgressPie from '../../Components/TopicProgressPie';
import LanguagePie from '../../Components/LanguagePie';
import { useSyllabus } from '../../Components/SyllabusContext';

export const ShowProgress = () => {
  const syllabus = useSyllabus();
  const [isThereProgress, setIsThereProgress] = useState(false);
  const { userData } = useAuth();
  const studentId = userData?.id;

  useEffect(() => {
    if (studentId) {
      fetch(`${API_URL}/api/progress/ifThereIsStatus/${studentId}/${1}`)
        .then(res => res.json())
        .then(data => {
          setIsThereProgress(data);
        });
    }
  }, []);

  if (!isThereProgress) {
    return (
      <div className="flex flex-col justify-center items-center w-full h-full min-h-[50vh] gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-[#64ffda]/10 border border-[#64ffda]/25">
          📈
        </div>
        <h4 className="text-lg font-bold text-white">Start learning to see your progress!</h4>
        <p className="text-sm text-white/40 max-w-sm">
          Complete a few exercises and your language, topic, and level breakdowns will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-2 md:p-4">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1 h-7 rounded bg-gradient-to-b from-[#64ffda] to-[#4fc3f7]" />
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white">Your Learning Journey</h1>
          <p className="text-sm text-white/40">A breakdown of how far you have come, by language, topic, and level</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Language progress */}
        <section className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🌐</span>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-[#64ffda]">
              Language Progress
            </h2>
          </div>
          <p className="text-xs text-white/30 mb-4 ml-7">How far you have gotten in each language overall</p>
          <div className="flex flex-wrap w-full justify-center items-start gap-4">
            <LanguagePie syllabus_id={1} />
          </div>
        </section>

        {/* Topics progress */}
        <section className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">📊</span>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-[#4fc3f7]">
              Topics Progress
            </h2>
          </div>
          <p className="text-xs text-white/30 mb-4 ml-7">Topics completed within each language</p>
          <div className="flex flex-wrap w-full justify-center items-start gap-4">
            {syllabus?.map((lan, index) => (
              <TopicProgressPie
                syllabus_id={1}
                language_id={lan.language_id}
                languageName={lan.lanName}
                key={index}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Levels breakdown */}
      <section className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.07] backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-[#a78bfa]">
              Levels Breakdown
            </h2>
          </div>
          <div className="flex items-center gap-4 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.07] w-fit">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-500" />
              <span className="text-white/60 text-xs">Level 1</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-yellow-300" />
              <span className="text-white/60 text-xs">Level 2</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-gray-500" />
              <span className="text-white/60 text-xs">Level 3</span>
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          {syllabus?.map((lan, index) => (
            <TopicsPie
              syllabus_id={1}
              language_id={lan.language_id}
              languageName={lan.lanName}
              key={index}
            />
          ))}
        </div>
      </section>
    </div>
  );
};