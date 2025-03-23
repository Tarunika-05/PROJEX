import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import KanbanBoard from "./components/KanbanPreview";
import TimelineBoard from "./components/TimelineBoard";
import CalendarComponent from "./components/CalendarComponent";
import TeamBoard from "./components/TeamBoard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<KanbanBoard />} />
        <Route path="/TimelineBoard" element={<TimelineBoard />} />
        <Route path="/CalendarComponent" element={<CalendarComponent />} />
        <Route path="/TeamBoard" element={<TeamBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
