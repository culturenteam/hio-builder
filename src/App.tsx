import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sign-in" element={<div>Sign in — coming Phase 1</div>} />
        <Route path="/:slug" element={<div>Public page — coming Phase 5</div>} />
        <Route path="/" element={<div>Builder — coming Phase 2</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
