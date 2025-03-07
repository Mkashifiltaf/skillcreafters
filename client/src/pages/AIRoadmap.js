import React, { useState, useEffect } from 'react';
import RoadmapGraph from '../components/roadmap/RoadmapGraph';
import SkillAssessment from '../components/roadmap/SkillAssessment';
import LearningPath from '../components/roadmap/LearningPath';

const AIRoadmap = () => {
  const [currentSkills, setCurrentSkills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [roadmap, setRoadmap] = useState(null);

  const handleSkillAssessment = (skills) => {
    setCurrentSkills(skills);
    // TODO: Make API call to generate personalized roadmap
  };

  const handleGoalSetting = (newGoals) => {
    setGoals(newGoals);
    // TODO: Update roadmap based on new goals
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Your AI Learning Roadmap</h1>
        <p className="mt-4 text-xl text-gray-600">
          Get a personalized learning path based on your skills and goals
        </p>
      </div>

      {!roadmap ? (
        <div className="grid gap-8 md:grid-cols-2">
          <SkillAssessment onComplete={handleSkillAssessment} />
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Set Your Goals</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  What do you want to achieve?
                </label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Mobile Developer</option>
                  <option>Data Scientist</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time commitment per week
                </label>
                <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>5-10 hours</option>
                  <option>10-20 hours</option>
                  <option>20-30 hours</option>
                  <option>30+ hours</option>
                </select>
              </div>
              <button
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={() => handleGoalSetting(goals)}
              >
                Generate Roadmap
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <RoadmapGraph roadmap={roadmap} />
          <LearningPath roadmap={roadmap} />
        </div>
      )}
    </div>
  );
};

export default AIRoadmap;
