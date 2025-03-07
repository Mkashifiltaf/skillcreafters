import React, { useState } from 'react';
import MockInterview from '../components/interview/MockInterview';
import ProblemBank from '../components/interview/ProblemBank';
import CompanyPrep from '../components/interview/CompanyPrep';

const Interview = () => {
  const [activeTab, setActiveTab] = useState('mock');

  const tabs = [
    { id: 'mock', name: 'Mock Interviews' },
    { id: 'problems', name: 'Problem Bank' },
    { id: 'company', name: 'Company Prep' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900">Interview Preparation</h1>
        <p className="mt-4 text-xl text-gray-600">
          Practice with AI-powered mock interviews and targeted problem solving
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              `}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'mock' && (
          <MockInterview />
        )}
        {activeTab === 'problems' && (
          <ProblemBank />
        )}
        {activeTab === 'company' && (
          <CompanyPrep />
        )}
      </div>
    </div>
  );
};

export default Interview;
