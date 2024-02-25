import React, { useEffect, useState } from 'react';
import {useParams } from 'react-router-dom';
import HtmlTitle from '../Components/HtmlTitle';
import TopicCard from '../Components/Cards/TopicCard';
import { useTopics } from '../Components/TopicsContext';
import Layout from '../Components/Layout/Layout';

function LanguageTopicsPage() {
 
    const { syllabusId, language } = useParams();
    const topics = useTopics(syllabusId , language);

    return (
        <>
          <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
             <HtmlTitle title={"Pick a Tale, Sparkle and Sail "}/>
                <div className='flex flex-wrap gap-4 sm:flex-col md:flex-row lg:flex-row xl:flex-row max-w-screen-lg mx-auto'>
                    { topics?.map((topic, i) => (
                    <TopicCard
                        title={topic?.topic_name}
                        language={language}
                        syllabusId={syllabusId}
                        key={i}
                    />
                    ))}
                </div>
          </div>

        </>
    );
}

export default LanguageTopicsPage;
