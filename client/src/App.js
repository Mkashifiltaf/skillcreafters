import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import AIRoadmap from './pages/AIRoadmap';
import CodeEditor from './pages/CodeEditor';
import Practice from './pages/Practice';
import Community from './pages/Community';
import GroupStudy from './pages/GroupStudy';
import Profile from './pages/Profile';
import Interview from './pages/Interview';
import Leaderboard from './pages/Leaderboard';
import SignIn from './pages/Auth/SignIn';
import SignUp from './pages/Auth/SignUp';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/roadmap" element={<AIRoadmap />} />
            <Route path="/editor" element={<CodeEditor />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/community" element={<Community />} />
            <Route path="/group-study" element={<GroupStudy />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
