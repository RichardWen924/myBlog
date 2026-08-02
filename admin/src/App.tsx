import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import ProfileEditor from './components/ProfileEditor';
import ProjectEditor from './components/ProjectEditor';
import SkillsEditor from './components/SkillsEditor';
import ExperienceEditor from './components/ExperienceEditor';
import BlogEditor from './components/BlogEditor';

export default function App() {
  return (
    <div className="flex min-h-screen bg-[#FAF8F5] text-[#1A1A1A]">
      <Nav />
      <main className="flex-1 overflow-auto p-8">
        <Routes>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<ProfileEditor />} />
          <Route path="/projects" element={<ProjectEditor />} />
          <Route path="/skills" element={<SkillsEditor />} />
          <Route path="/experience" element={<ExperienceEditor />} />
          <Route path="/blog" element={<BlogEditor />} />
        </Routes>
      </main>
    </div>
  );
}
