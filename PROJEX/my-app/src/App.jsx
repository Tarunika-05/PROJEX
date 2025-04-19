import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import KanbanBoard from "./components/KanbanPreview";
import TimelineBoard from "./components/TimelineBoard";
import CalendarComponent from "./components/CalendarComponent";
import TeamBoard from "./components/TeamBoard";
import Dashboard from "./components/Dashboard";
import Signup from "./components/Signup";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/Signup" element={<Signup />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/kanban/:projectId" element={<KanbanBoard />} />
        <Route path="/TimelineBoard" element={<TimelineBoard />} />
        <Route path="/CalendarComponent" element={<CalendarComponent />} />
        <Route path="/TeamBoard" element={<TeamBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
