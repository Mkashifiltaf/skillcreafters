import React, { useState } from 'react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock user data - replace with API call
  const user = {
    name: 'Alex Chen',
    avatar: '/avatars/alex.jpg',
    title: 'Full Stack Developer',
    bio: 'Passionate about learning and building amazing web applications',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    skills: ['React', 'Node.js', 'Python', 'MongoDB', 'AWS'],
    stats: {
      coursesCompleted: 15,
      certificatesEarned: 8,
      hoursLearned: 120,
      streak: 45,
    },
    achievements: [
      {
        icon: '🏆',
        title: '30 Day Streak',
        description: 'Learned for 30 consecutive days',
        date: '2024-01-15',
      },
      {
        icon: '⭐',
        title: 'Course Master',
        description: 'Completed 10 courses',
        date: '2024-01-10',
      },
      // Add more achievements
    ],
    currentCourses: [
      {
        id: 1,
        title: 'Modern React with NextJS',
        progress: 75,
        lastAccessed: '2024-02-01',
        thumbnail: '/course-thumbnails/react.jpg',
      },
      // Add more courses
    ],
    certificates: [
      {
        id: 1,
        title: 'Advanced JavaScript',
        issueDate: '2024-01-20',
        thumbnail: '/certificates/js.jpg',
      },
      // Add more certificates
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Profile Header */}
      <div className="bg-matrix relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-blue-500"
            />
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
              <p className="text-xl text-blue-400 mb-2">{user.title}</p>
              <p className="text-gray-300 mb-4">{user.bio}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  {user.location}
                </div>
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-calendar-alt mr-2"></i>
                  Joined {user.joinDate}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {user.stats.coursesCompleted}
            </div>
            <div className="text-gray-400">Courses Completed</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {user.stats.certificatesEarned}
            </div>
            <div className="text-gray-400">Certificates Earned</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {user.stats.hoursLearned}h
            </div>
            <div className="text-gray-400">Hours Learned</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="text-3xl font-bold gradient-text mb-2">
              {user.stats.streak}
            </div>
            <div className="text-gray-400">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          {['overview', 'courses', 'certificates', 'achievements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Skills */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-900/50 text-blue-300 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Current Courses */}
            <div className="glass-card rounded-xl p-6 lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4">Current Courses</h2>
              <div className="space-y-4">
                {user.currentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center space-x-4 bg-white/5 rounded-lg p-4"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{course.title}</h3>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        Last accessed: {course.lastAccessed}
                      </p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {user.achievements.map((achievement, index) => (
              <div key={index} className="glass-card rounded-xl p-6">
                <div className="text-4xl mb-4">{achievement.icon}</div>
                <h3 className="text-xl font-bold mb-2">{achievement.title}</h3>
                <p className="text-gray-400 mb-4">{achievement.description}</p>
                <p className="text-sm text-gray-500">Earned on {achievement.date}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {user.certificates.map((certificate) => (
              <div key={certificate.id} className="glass-card rounded-xl overflow-hidden">
                <img
                  src={certificate.thumbnail}
                  alt={certificate.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{certificate.title}</h3>
                  <p className="text-gray-400">Issued on {certificate.issueDate}</p>
                  <button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
                    View Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
