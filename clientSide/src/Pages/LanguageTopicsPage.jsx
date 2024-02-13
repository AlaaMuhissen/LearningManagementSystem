import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import HtmlTitle from '../Components/HtmlTitle';
import TopicCard from '../Components/Cards/TopicCard';
import { useTopics } from '../Components/TopicsContext';

function LanguageTopicsPage() {
    const { syllabusId, language } = useParams();
    const topics = useTopics(syllabusId , language);

    //keep track of unique topic names
    const uniqueTopics = Array.from(new Set(topics.map(topic => topic.topic_name)));

    return (
        <>
            <div className='p-4 md:p-8 lg:p-12 xl:p-16'>
                <HtmlTitle title={"Pick a Tale, Sparkle and Sail "}/>
                <div className='flex flex-wrap gap-4 sm:flex-col md:flex-row lg:flex-row xl:flex-row max-w-screen-lg'>
                    {uniqueTopics.map((topicName, i) => {
                        // Find the first occurrence of the topic with the current topic name
                        const topic = topics.find(topic => topic.topic_name === topicName);
                        return (
                            <TopicCard
                                title={topic.topic_name}
                                language={topic.lanName}
                                syllabusId={syllabusId}
                                key={i}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default LanguageTopicsPage;
