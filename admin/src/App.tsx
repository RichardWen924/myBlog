import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import { topicRegistry } from './registry/topics';

export default function App() {
  return (
    <div className="flex min-h-screen bg-paper text-ink">
      <Nav />
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route path="/" element={<Navigate to={topicRegistry[0].path} replace />} />
          {topicRegistry.map(({ path, editor: Editor }) => (
            <Route key={path} path={path} element={<Editor />} />
          ))}
        </Routes>
      </main>
    </div>
  );
}
