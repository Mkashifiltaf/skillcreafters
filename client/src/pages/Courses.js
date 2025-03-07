import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Courses' },
    { id: 'frontend', name: 'Frontend Development' },
    { id: 'backend', name: 'Backend Development' },
    { id: 'mobile', name: 'Mobile Development' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'devops', name: 'DevOps & Cloud' },
  ];

  const courses = [
    {
      id: 1,
      title: 'Modern React with NextJS',
      category: 'frontend',
      instructor: 'Sarah Johnson',
      level: 'Intermediate',
      duration: '12 hours',
      rating: 4.8,
      students: 12500,
      thumbnail: '/course-thumbnails/react.jpg',
      tags: ['React', 'NextJS', 'Frontend'],
      isFree: true,
    },
    // Add more courses here
  ];

  const filteredCourses = courses.filter(course => 
    (selectedCategory === 'all' || course.category === selectedCategory) &&
    (course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="bg-matrix relative overflow-hidden py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Explore Courses</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Learn from industry experts and master the skills you need
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-3 rounded-full bg-white/10 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <i className="fas fa-search text-gray-400"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-2 rounded-full transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="glass-card rounded-xl overflow-hidden transform hover:scale-105 transition-all"
            >
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                {course.isFree && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                    Free
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-400">{course.category}</span>
                  <span className="flex items-center text-yellow-400">
                    <i className="fas fa-star mr-1"></i>
                    {course.rating}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <div className="flex items-center text-gray-400 text-sm mb-4">
                  <span className="mr-4">
                    <i className="fas fa-user-tie mr-1"></i>
                    {course.instructor}
                  </span>
                  <span className="mr-4">
                    <i className="fas fa-clock mr-1"></i>
                    {course.duration}
                  </span>
                  <span>
                    <i className="fas fa-signal mr-1"></i>
                    {course.level}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-md text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">
                    <i className="fas fa-users mr-1"></i>
                    {course.students.toLocaleString()} students
                  </span>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors">
                    Start Learning
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;
