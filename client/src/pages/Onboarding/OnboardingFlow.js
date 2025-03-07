import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    learningGoal: '',
    experience: '',
    timeCommitment: '',
    preferredTime: '',
    learningStyle: '',
    interests: [],
    currentSkills: [],
    targetRole: '',
    timeline: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleSubmit = async () => {
    try {
      await updateUserProfile({
        ...formData,
        onboardingCompleted: true
      });
      
      // Generate AI roadmap based on user preferences
      const roadmap = await generateAIRoadmap(formData);
      
      navigate('/dashboard', { state: { roadmap } });
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          What's your main goal in learning programming?
        </label>
        <select
          name="learningGoal"
          value={formData.learningGoal}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select your goal</option>
          <option value="career">Start a career in tech</option>
          <option value="switch">Switch careers to tech</option>
          <option value="upskill">Upskill in current role</option>
          <option value="hobby">Learn as a hobby</option>
          <option value="startup">Build a startup</option>
        </select>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          What's your target role?
        </label>
        <select
          name="targetRole"
          value={formData.targetRole}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select your target role</option>
          <option value="frontend">Frontend Developer</option>
          <option value="backend">Backend Developer</option>
          <option value="fullstack">Full Stack Developer</option>
          <option value="mobile">Mobile Developer</option>
          <option value="ai">AI/ML Engineer</option>
          <option value="devops">DevOps Engineer</option>
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          How much programming experience do you have?
        </label>
        <select
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select your experience level</option>
          <option value="none">No experience</option>
          <option value="beginner">Beginner (&#60; 1 year)</option>
          <option value="intermediate">Intermediate (1-3 years)</option>
          <option value="advanced">Advanced (3+ years)</option>
        </select>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Select your current skills
        </label>
        <div className="grid grid-cols-3 gap-4">
          {['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'Git'].map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => handleMultiSelect('currentSkills', skill)}
              className={`p-2 rounded-md ${
                formData.currentSkills.includes(skill)
                  ? 'bg-blue-100 text-blue-800 border-blue-500'
                  : 'bg-gray-100 text-gray-800 border-gray-300'
              } border`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          How much time can you commit to learning each week?
        </label>
        <select
          name="timeCommitment"
          value={formData.timeCommitment}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select time commitment</option>
          <option value="5">Less than 5 hours</option>
          <option value="10">5-10 hours</option>
          <option value="20">10-20 hours</option>
          <option value="30">20-30 hours</option>
          <option value="40">More than 30 hours</option>
        </select>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          When do you prefer to learn?
        </label>
        <select
          name="preferredTime"
          value={formData.preferredTime}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select preferred time</option>
          <option value="morning">Early morning</option>
          <option value="day">During the day</option>
          <option value="evening">Evening</option>
          <option value="night">Late night</option>
          <option value="weekend">Weekends only</option>
        </select>
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          What's your target timeline for achieving your goal?
        </label>
        <select
          name="timeline"
          value={formData.timeline}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select timeline</option>
          <option value="3">3 months</option>
          <option value="6">6 months</option>
          <option value="12">1 year</option>
          <option value="24">2 years</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow px-8 py-6">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Let's personalize your learning journey
            </h2>
            <p className="text-gray-600">
              Step {step} of 3: {
                step === 1 ? 'Your Goals' :
                step === 2 ? 'Your Experience' :
                'Your Schedule'
              }
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
            )}
            <div className="ml-auto">
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Complete & Generate Roadmap
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;
