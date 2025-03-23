import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Edit2, Plus, X, Trash } from "lucide-react";

const CalendarComponent = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Team Meeting",
      date: "2025-02-22",
      time: "10:00",
      description: "Weekly sprint planning",
      type: "meeting",
    },
    {
      id: 2,
      title: "Client Call",
      date: "2025-02-22",
      time: "14:00",
      description: "Project review",
      type: "call",
    },
  ]);
  const [currentEvent, setCurrentEvent] = useState(null);

  const eventTypes = [
    { value: "meeting", label: "Meeting", color: "bg-blue-100 text-blue-700" },
    { value: "call", label: "Call", color: "bg-green-100 text-green-700" },
    { value: "deadline", label: "Deadline", color: "bg-red-100 text-red-700" },
    { value: "task", label: "Task", color: "bg-yellow-100 text-yellow-700" },
  ];

  const getEventTypeColor = (type) => {
    const eventType = eventTypes.find((t) => t.value === type);
    return eventType ? eventType.color : "bg-gray-100 text-gray-700";
  };

  const getEventTypeLabel = (type) => {
    const eventType = eventTypes.find((t) => t.value === type);
    return eventType ? eventType.label : "Event";
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return {
      daysInMonth,
      firstDayOfMonth,
    };
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const generateCalendarDays = () => {
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const formatDate = (day) => {
    if (!day) return "";
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const dateStr = day.toString().padStart(2, "0");
    return `${year}-${month}-${dateStr}`;
  };

  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return `${
      months[date.getMonth()]
    } ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getEventsForDate = (day) => {
    const dateStr = formatDate(day);
    return events.filter((event) => event.date === dateStr);
  };

  const handleDateClick = (day) => {
    if (!day) return;
    setSelectedDate(formatDate(day));
    setCurrentEvent({
      title: "",
      date: formatDate(day),
      time: "12:00",
      description: "",
      type: "meeting",
    });
    setShowEventModal(true);
  };

  const handleEventSave = () => {
    if (!currentEvent.title.trim()) return;

    if (currentEvent.id) {
      setEvents(
        events.map((event) =>
          event.id === currentEvent.id ? currentEvent : event
        )
      );
    } else {
      setEvents([...events, { ...currentEvent, id: Date.now() }]);
    }
    setShowEventModal(false);
    setCurrentEvent(null);
  };

  const handleEventEdit = (event) => {
    setCurrentEvent(event);
    setShowEventModal(true);
    setShowEventDetailsModal(false);
  };

  const handleEventDelete = (eventId) => {
    setEvents(events.filter((event) => event.id !== eventId));
    setShowEventDetailsModal(false);
  };

  const handleViewEventDetails = (e, event) => {
    e.stopPropagation();
    setCurrentEvent(event);
    setShowEventDetailsModal(true);
  };

  const handleEventClick = (e, event) => {
    e.stopPropagation();
    handleViewEventDetails(e, event);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className={`flex-1 h-full w-full overflow-auto `}>
      {/* Main Content */}
      <main className="flex-1 h-full w-full">
        <div className="px-4 py-4 h-full">
          <div
            className={`h-full ${
              isDarkMode
                ? "bg-gray-800 bg-opacity-70"
                : "bg-white bg-opacity-50"
            } backdrop-blur-lg rounded-2xl p-4 shadow-lg`}
          >
            {/* Month Navigation with Add Event Button */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className={`p-2 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-full`}
              >
                <ChevronLeft
                  size={20}
                  className={isDarkMode ? "text-white" : ""}
                />
              </button>
              <div className="flex items-center space-x-4">
                <h2
                  className={`text-xl font-semibold ${
                    isDarkMode ? "text-white" : ""
                  }`}
                >
                  {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => handleDateClick(new Date().getDate())}
                  className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  <Plus size={16} />
                  <span className="ml-1">Add Event</span>
                </button>
              </div>
              <button
                onClick={() => navigateMonth(1)}
                className={`p-2 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-full`}
              >
                <ChevronRight
                  size={20}
                  className={isDarkMode ? "text-white" : ""}
                />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className={`p-2 text-center font-semibold ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {day}
                </div>
              ))}
              {generateCalendarDays().map((day, index) => (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={
                    "min-h-24 p-2 border " +
                    (isDarkMode ? "border-gray-700 " : "border-gray-200 ") +
                    (day
                      ? isDarkMode
                        ? "hover:bg-gray-700 hover:bg-opacity-50 cursor-pointer"
                        : "hover:bg-white hover:bg-opacity-50 cursor-pointer"
                      : "")
                  }
                >
                  {day && (
                    <>
                      <div
                        className={`font-medium ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {day}
                      </div>
                      <div className="mt-1 space-y-1">
                        {getEventsForDate(day).map((event) => (
                          <div
                            key={event.id}
                            className={`relative p-1 text-xs rounded ${getEventTypeColor(
                              event.type
                            )}`}
                            onClick={(e) => handleEventClick(e, event)}
                          >
                            <div className="flex items-center justify-between cursor-pointer hover:opacity-80">
                              <span className="truncate">
                                {event.time} - {event.title}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Event Creation/Edit Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            className={`${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white"
            } rounded-lg shadow-xl w-full max-w-md p-6 m-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              {currentEvent.id ? "Edit Event" : "New Event"}
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Event Title
                </label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  value={currentEvent.title}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, title: e.target.value })
                  }
                  placeholder="Enter event title..."
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Event Type
                </label>
                <select
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  value={currentEvent.type}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, type: e.target.value })
                  }
                >
                  {eventTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Time
                </label>
                <input
                  type="time"
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  value={currentEvent.time}
                  onChange={(e) =>
                    setCurrentEvent({ ...currentEvent, time: e.target.value })
                  }
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  } mb-1`}
                >
                  Description
                </label>
                <textarea
                  className={`w-full px-3 py-2 border ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 text-white"
                      : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  rows="3"
                  value={currentEvent.description}
                  onChange={(e) =>
                    setCurrentEvent({
                      ...currentEvent,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter event description..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setCurrentEvent(null);
                }}
                className={`px-4 py-2 ${
                  isDarkMode
                    ? "text-white bg-gray-700 hover:bg-gray-600"
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200"
                } rounded-md transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleEventSave}
                className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                {currentEvent.id ? "Update Event" : "Save Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetailsModal && currentEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            className={`${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white"
            } rounded-lg shadow-xl w-full max-w-md p-6 m-4`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded text-xs ${getEventTypeColor(
                    currentEvent.type
                  )}`}
                >
                  {getEventTypeLabel(currentEvent.type)}
                </span>
                <h2 className="text-xl font-bold">{currentEvent.title}</h2>
              </div>
              <button
                onClick={() => setShowEventDetailsModal(false)}
                className={`p-1 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                } rounded-full`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Date
                  </p>
                  <p className="font-medium">
                    {formatDateForDisplay(currentEvent.date)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Time
                  </p>
                  <p className="font-medium">{currentEvent.time}</p>
                </div>
              </div>

              <div>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  } mb-1`}
                >
                  Description
                </p>
                <div
                  className={`p-3 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-50"
                  } rounded-md min-h-16`}
                >
                  {currentEvent.description ? (
                    <p>{currentEvent.description}</p>
                  ) : (
                    <p
                      className={`${
                        isDarkMode ? "text-gray-500" : "text-gray-400"
                      } italic`}
                    >
                      No description provided
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div
              className={`flex justify-end gap-3 pt-4 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => handleEventDelete(currentEvent.id)}
                className={`flex items-center gap-1 px-4 py-2 text-red-600 ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-red-50"
                } rounded-md transition-colors`}
              >
                <Trash size={16} /> Delete
              </button>
              <button
                onClick={() => handleEventEdit(currentEvent)}
                className="flex items-center gap-1 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Edit2 size={16} /> Edit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent;
