import React, { useState } from "react";
import { Clock, Plus, X } from "lucide-react";

const Timeline = ({ isDarkMode = false }) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    category: "meeting",
    description: "",
  });

  const [timelineEvents, setTimelineEvents] = useState([
    {
      id: 1,
      title: "Project Kickoff",
      date: "Jan 15, 2025",
      category: "meeting",
      description: "Initial team meeting and project planning",
    },
    {
      id: 2,
      title: "Research Phase",
      date: "Jan 20, 2025",
      category: "research",
      description: "Market analysis and competitor research",
    },
    {
      id: 3,
      title: "Design Sprint",
      date: "Feb 15, 2025",
      category: "design",
      description: "UI/UX design workshop",
    },
    {
      id: 4,
      title: "Development Start",
      date: "Mar 1, 2025",
      category: "development",
      description: "Begin frontend development",
    },
  ]);

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date && newEvent.description) {
      setTimelineEvents([
        ...timelineEvents,
        {
          id: timelineEvents.length + 1,
          ...newEvent,
        },
      ]);
      setNewEvent({
        title: "",
        date: "",
        category: "meeting",
        description: "",
      });
      setIsAddingEvent(false);
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "meeting":
        return {
          bg: isDarkMode
            ? "bg-gradient-to-br from-purple-900/30 to-purple-700/40 backdrop-blur-md"
            : "bg-gradient-to-br from-purple-400/30 to-purple-600/40 backdrop-blur-md",
          border: isDarkMode
            ? "border border-purple-700/30"
            : "border border-purple-300/30",
          text: isDarkMode ? "text-purple-200" : "text-purple-800",
          dot: "bg-gradient-to-r from-purple-400 to-purple-600",
          badge: isDarkMode
            ? "bg-gradient-to-r from-purple-800/60 to-purple-700/60 backdrop-blur-md text-purple-200"
            : "bg-gradient-to-r from-purple-300/60 to-purple-400/60 backdrop-blur-md text-purple-900",
        };
      case "research":
        return {
          bg: isDarkMode
            ? "bg-gradient-to-br from-blue-900/30 to-blue-700/40 backdrop-blur-md"
            : "bg-gradient-to-br from-blue-400/30 to-blue-600/40 backdrop-blur-md",
          border: isDarkMode
            ? "border border-blue-700/30"
            : "border border-blue-300/30",
          text: isDarkMode ? "text-blue-200" : "text-blue-800",
          dot: "bg-gradient-to-r from-blue-400 to-blue-600",
          badge: isDarkMode
            ? "bg-gradient-to-r from-blue-800/60 to-blue-700/60 backdrop-blur-md text-blue-200"
            : "bg-gradient-to-r from-blue-300/60 to-blue-400/60 backdrop-blur-md text-blue-900",
        };
      case "design":
        return {
          bg: isDarkMode
            ? "bg-gradient-to-br from-pink-900/30 to-pink-700/40 backdrop-blur-md"
            : "bg-gradient-to-br from-pink-400/30 to-pink-600/40 backdrop-blur-md",
          border: isDarkMode
            ? "border border-pink-700/30"
            : "border border-pink-300/30",
          text: isDarkMode ? "text-pink-200" : "text-pink-800",
          dot: "bg-gradient-to-r from-pink-400 to-pink-600",
          badge: isDarkMode
            ? "bg-gradient-to-r from-pink-800/60 to-pink-700/60 backdrop-blur-md text-pink-200"
            : "bg-gradient-to-r from-pink-300/60 to-pink-400/60 backdrop-blur-md text-pink-900",
        };
      case "development":
        return {
          bg: isDarkMode
            ? "bg-gradient-to-br from-green-900/30 to-green-700/40 backdrop-blur-md"
            : "bg-gradient-to-br from-green-400/30 to-green-600/40 backdrop-blur-md",
          border: isDarkMode
            ? "border border-green-700/30"
            : "border border-green-300/30",
          text: isDarkMode ? "text-green-200" : "text-green-800",
          dot: "bg-gradient-to-r from-green-400 to-green-600",
          badge: isDarkMode
            ? "bg-gradient-to-r from-green-800/60 to-green-700/60 backdrop-blur-md text-green-200"
            : "bg-gradient-to-r from-green-300/60 to-green-400/60 backdrop-blur-md text-green-900",
        };
      default:
        return {
          bg: isDarkMode
            ? "bg-gradient-to-br from-gray-900/30 to-gray-700/40 backdrop-blur-md"
            : "bg-gradient-to-br from-gray-400/30 to-gray-600/40 backdrop-blur-md",
          border: isDarkMode
            ? "border border-gray-700/30"
            : "border border-gray-300/30",
          text: isDarkMode ? "text-gray-200" : "text-gray-800",
          dot: "bg-gradient-to-r from-gray-400 to-gray-600",
          badge: isDarkMode
            ? "bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-md text-gray-200"
            : "bg-gradient-to-r from-gray-300/60 to-gray-400/60 backdrop-blur-md text-gray-900",
        };
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800/60" : "bg-white/60"
      } backdrop-blur-lg rounded-2xl p-8 shadow-lg ${
        isDarkMode ? "border-gray-700/50" : "border-white/50"
      } border`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2
          className={`text-2xl font-bold ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Timeline
        </h2>
        <button
          onClick={() => setIsAddingEvent(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-800 transition-colors shadow-md"
        >
          <Plus size={16} className="mr-2" />
          Add Event
        </button>
      </div>

      {/* Add Event Modal */}
      {isAddingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`${
              isDarkMode ? "bg-gray-800" : "bg-white"
            } rounded-lg p-6 w-full max-w-md mx-4`}
          >
            <h3
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Add New Event
            </h3>
            <form onSubmit={handleAddEvent}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Date (e.g., Jan 15, 2025)"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <select
                  value={newEvent.category}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="meeting">Meeting</option>
                  <option value="research">Research</option>
                  <option value="design">Design</option>
                  <option value="development">Development</option>
                </select>
                <textarea
                  placeholder="Description"
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingEvent(false)}
                    className={`px-4 py-2 rounded-lg border hover:bg-opacity-10 ${
                      isDarkMode
                        ? "text-gray-300 hover:bg-gray-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-800"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Centered Timeline */}
      <div className="relative">
        {/* Center Line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-300 to-purple-400" />

        {/* Timeline Events */}
        <div className="space-y-12">
          {timelineEvents.map((event, index) => {
            const styles = getCategoryStyle(event.category);
            return (
              <div
                key={event.id}
                className={`flex ${
                  index % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`w-5/12 relative ${
                    index % 2 === 0 ? "pr-8" : "pl-8"
                  }`}
                >
                  <div
                    className={`${styles.bg} ${styles.border} p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="mb-2">
                      <h3
                        className={`text-lg font-semibold ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${styles.badge}`}
                        >
                          {event.category.charAt(0).toUpperCase() +
                            event.category.slice(1)}
                        </span>
                        <span
                          className={`text-sm ${
                            isDarkMode
                              ? "text-gray-300 bg-gray-800/40"
                              : "text-gray-600 bg-white/40"
                          } px-2 py-1 rounded-full backdrop-blur-sm`}
                        >
                          <Clock size={14} className="inline mr-1" />
                          {event.date}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`${
                        isDarkMode
                          ? "text-gray-300 bg-gray-800/30"
                          : "text-gray-700 bg-white/30"
                      } text-sm backdrop-blur-sm p-2 rounded-lg`}
                    >
                      {event.description}
                    </p>
                  </div>

                  {/* Connector Line */}
                  <div
                    className={`absolute top-1/2 ${
                      index % 2 === 0 ? "right-0" : "left-0"
                    } w-8 h-1 bg-gradient-to-r from-indigo-200 to-indigo-300`}
                  />

                  {/* Circle on Timeline */}
                  <div
                    className={`absolute top-1/2 transform -translate-y-1/2 ${
                      index % 2 === 0 ? "right-0" : "left-0"
                    } translate-x-1/2 w-4 h-4 rounded-full ${
                      styles.dot
                    } shadow-lg border-2 border-white`}
                  >
                    <div
                      className={`absolute inset-0 rounded-full ${
                        isDarkMode ? "bg-opacity-80" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
