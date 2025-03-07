import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import VideoPlayer from '../components/video/VideoPlayer';

const CourseDetail = () => {
  const { id } = useParams();
  const [selectedSection, setSelectedSection] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(0);

  // Mock course data - replace with API call
  const course = {
    id,
    title: 'Modern React with NextJS',
    description: 'Master React and NextJS by building real-world applications. Learn hooks, server-side rendering, API routes, and more.',
    instructor: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      bio: 'Senior Frontend Developer with 10+ years of experience',
      students: 45000,
      courses: 12,
    },
    sections: [
      {
        title: 'Getting Started',
        lessons: [
          {
            title: 'Course Introduction',
            duration: '5:30',
            videoUrl: '/videos/intro.mp4',
            isComplete: true,
          },
          {
            title: 'Setting Up Your Environment',
            duration: '12:45',
            videoUrl: '/videos/setup.mp4',
            isComplete: false,
          },
        ],
      },
      // Add more sections
    ],
    features: [
      'Lifetime access',
      'Project files included',
      'Certificate of completion',
      'Premium support',
    ],
    requirements: [
      'Basic JavaScript knowledge',
      'Understanding of HTML & CSS',
      'Node.js installed on your computer',
    ],
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Course Header */}
      <div className="bg-matrix relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">{course.title}</span>
          </h1>
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={course.instructor.avatar}
              alt={course.instructor.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <p className="text-lg font-medium">{course.instructor.name}</p>
              <p className="text-gray-400">
                {course.instructor.students.toLocaleString()} students
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-8">
              <VideoPlayer
                videoUrl={course.sections[selectedSection].lessons[selectedLesson].videoUrl}
                title={course.sections[selectedSection].lessons[selectedLesson].title}
                instructor={course.instructor}
              />
            </div>

            {/* Course Description */}
            <div className="glass-card rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Course</h2>
              <p className="text-gray-300 mb-6">{course.description}</p>

              <h3 className="text-xl font-semibold mb-3">What you'll learn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {course.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <i className="fas fa-check-circle text-green-500 mr-2"></i>
                    <span className="text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold mb-3">Requirements</h3>
              <ul className="list-disc list-inside text-gray-300">
                {course.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Instructor Bio */}
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Your Instructor</h2>
              <div className="flex items-start space-x-4">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-24 h-24 rounded-full"
                />
                <div>
                  <h3 className="text-xl font-semibold mb-2">{course.instructor.name}</h3>
                  <p className="text-gray-300 mb-4">{course.instructor.bio}</p>
                  <div className="flex space-x-6">
                    <div>
                      <p className="text-2xl font-bold gradient-text">
                        {course.instructor.students.toLocaleString()}
                      </p>
                      <p className="text-gray-400">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold gradient-text">
                        {course.instructor.courses}
                      </p>
                      <p className="text-gray-400">Courses</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-semibold mb-4">Course Content</h3>
              <div className="space-y-4">
                {course.sections.map((section, sIndex) => (
                  <div key={sIndex}>
                    <button
                      className="w-full text-left p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      onClick={() => setSelectedSection(sIndex)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{section.title}</span>
                        <i className={`fas fa-chevron-${selectedSection === sIndex ? 'up' : 'down'}`}></i>
                      </div>
                    </button>
                    {selectedSection === sIndex && (
                      <div className="mt-2 space-y-2">
                        {section.lessons.map((lesson, lIndex) => (
                          <button
                            key={lIndex}
                            onClick={() => setSelectedLesson(lIndex)}
                            className={`w-full text-left p-3 rounded-lg transition-colors ${
                              selectedLesson === lIndex
                                ? 'bg-blue-600'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <i className={`fas fa-${lesson.isComplete ? 'check-circle text-green-500' : 'play-circle'} mr-2`}></i>
                                <span>{lesson.title}</span>
                              </div>
                              <span className="text-sm text-gray-400">{lesson.duration}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
