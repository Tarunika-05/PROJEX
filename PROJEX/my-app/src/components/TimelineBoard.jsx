import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  X,
  Calendar as CalendarIcon,
  Edit2,
  Trash2,
} from "lucide-react";
import { db } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
  onSnapshot,
} from "firebase/firestore";

const Timeline = ({ userId, projectId, isDarkMode = false }) => {
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    category: "meeting",
    description: "",
  });

  const [timelineEvents, setTimelineEvents] = useState([]);

  // Fetch timeline events and setup real-time listener
  useEffect(() => {
    if (!userId || !projectId) return;

    const timelineRef = doc(
      db,
      `users/${userId}/projects/${projectId}/timeline/config`
    );

    // Set up real-time listener for timeline events
    const unsubscribe = onSnapshot(timelineRef, (docSnap) => {
      if (docSnap.exists()) {
        const events = docSnap.data().events || [];
        setTimelineEvents(events.sort((a, b) => a.timestamp - b.timestamp)); // Sort by timestamp
      } else {
        console.log("No timeline events found in Firestore.");
        // Initialize empty timeline if none exists
        setDoc(timelineRef, { events: [] }, { merge: true })
          .then(() => console.log("Timeline initialized successfully"))
          .catch((error) =>
            console.error("Error initializing timeline:", error)
          );
      }
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, [userId, projectId]); // Rerun when userId or projectId changes

  // The handleAddEvent function
  const handleAddEvent = async (e) => {
    e.preventDefault();

    if (!userId || !projectId) {
      console.error("User ID or Project ID missing");
      return;
    }

    if (newEvent.title) {
      // Use current date if date is missing
      const eventDate = newEvent.date || new Date().toISOString().split("T")[0];

      let timestamp;
      try {
        const timeString = newEvent.time || "00:00";
        const dateTimeString = `${eventDate} ${timeString}`;
        timestamp = new Date(dateTimeString).getTime();
      } catch (error) {
        console.error("Date parsing error:", error);
        timestamp = Date.now();
      }

      const newEventWithTimestamp = {
        id: Date.now(),
        ...newEvent,
        date: eventDate, // Ensure the date field is set
        timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      };

      try {
        const timelineRef = doc(
          db,
          `users/${userId}/projects/${projectId}/timeline/config`
        );

        // Get the existing document to preserve old events
        const timelineSnap = await getDoc(timelineRef);
        let existingEvents = [];

        if (timelineSnap.exists()) {
          existingEvents = timelineSnap.data().events || [];
        }

        // Append new event while keeping existing ones
        const updatedEvents = [...existingEvents, newEventWithTimestamp].sort(
          (a, b) => a.timestamp - b.timestamp
        );

        // Update Firestore with the new array (keeps all events)
        await setDoc(timelineRef, { events: updatedEvents }, { merge: true });

        console.log("Event added to Firestore successfully");

        // Reset form
        setNewEvent({
          title: "",
          date: "",
          time: "",
          category: "meeting",
          description: "",
        });

        setIsAddingEvent(false);
      } catch (error) {
        console.error("Error adding event to Firestore:", error);
      }
    } else {
      console.error("Error: Event title is required");
      // Optionally set an error state to display in the UI
    }
  };

  // Handle update event function
  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    if (!userId || !projectId || !editingEventId) {
      console.error("User ID, Project ID, or Event ID missing");
      return;
    }

    if (newEvent.title) {
      // Use current date if date is missing
      const eventDate = newEvent.date || new Date().toISOString().split("T")[0];

      let timestamp;
      try {
        const timeString = newEvent.time || "00:00";
        const dateTimeString = `${eventDate} ${timeString}`;
        timestamp = new Date(dateTimeString).getTime();
      } catch (error) {
        console.error("Date parsing error:", error);
        timestamp = Date.now();
      }

      const updatedEvent = {
        id: editingEventId,
        ...newEvent,
        date: eventDate,
        timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      };

      try {
        const timelineRef = doc(
          db,
          `users/${userId}/projects/${projectId}/timeline/config`
        );

        // Get the existing document
        const timelineSnap = await getDoc(timelineRef);

        if (timelineSnap.exists()) {
          const existingEvents = timelineSnap.data().events || [];

          // Replace the event being edited
          const updatedEvents = existingEvents
            .map((event) =>
              event.id === editingEventId ? updatedEvent : event
            )
            .sort((a, b) => a.timestamp - b.timestamp);

          // Update Firestore with the modified array
          await setDoc(timelineRef, { events: updatedEvents }, { merge: true });
          console.log("Event updated in Firestore successfully");
        }

        // Reset form and editing state
        setNewEvent({
          title: "",
          date: "",
          time: "",
          category: "meeting",
          description: "",
        });
        setIsEditingEvent(false);
        setEditingEventId(null);
      } catch (error) {
        console.error("Error updating event in Firestore:", error);
      }
    } else {
      console.error("Error: Event title is required");
    }
  };

  // Handle delete event function
  const handleDeleteEvent = async (eventId) => {
    if (!userId || !projectId || !eventId) {
      console.error("User ID, Project ID, or Event ID missing");
      return;
    }

    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const timelineRef = doc(
          db,
          `users/${userId}/projects/${projectId}/timeline/config`
        );

        // Get the existing document
        const timelineSnap = await getDoc(timelineRef);

        if (timelineSnap.exists()) {
          const existingEvents = timelineSnap.data().events || [];

          // Filter out the event to be deleted
          const updatedEvents = existingEvents.filter(
            (event) => event.id !== eventId
          );

          // Update Firestore with the filtered array
          await setDoc(timelineRef, { events: updatedEvents }, { merge: true });
          console.log("Event deleted from Firestore successfully");
        }
      } catch (error) {
        console.error("Error deleting event from Firestore:", error);
      }
    }
  };

  // Function to start editing an event
  const startEditEvent = (event) => {
    setNewEvent({
      title: event.title,
      date: event.date,
      time: event.time || "",
      category: event.category,
      description: event.description || "",
    });
    setEditingEventId(event.id);
    setIsEditingEvent(true);
  };

  const formatDateString = (dateStr) => {
    // For formatting date from picker to display format
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return as-is if invalid

      const options = { month: "short", day: "numeric", year: "numeric" };
      return date.toLocaleDateString("en-US", options);
    } catch (e) {
      return dateStr; // Return original string if formatting fails
    }
  };

  const handleDateSelect = (dateStr) => {
    const formattedDate = formatDateString(dateStr);
    setNewEvent({ ...newEvent, date: formattedDate });
    setShowCalendar(false);
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
      case "milestone":
        return {
          bg: isDarkMode
            ? "bg-gradient-to-br from-yellow-900/30 to-amber-700/40 backdrop-blur-md"
            : "bg-gradient-to-br from-yellow-400/30 to-amber-600/40 backdrop-blur-md",
          border: isDarkMode
            ? "border border-yellow-700/30"
            : "border border-yellow-300/30",
          text: isDarkMode ? "text-yellow-200" : "text-yellow-800",
          dot: "bg-gradient-to-r from-yellow-400 to-amber-600",
          badge: isDarkMode
            ? "bg-gradient-to-r from-yellow-800/60 to-amber-700/60 backdrop-blur-md text-yellow-200"
            : "bg-gradient-to-r from-yellow-300/60 to-amber-400/60 backdrop-blur-md text-yellow-900",
        };
      case "deadline":
        return {
          bg: isDarkMode
            ? "bg-gradient-to-br from-red-900/30 to-red-700/40 backdrop-blur-md"
            : "bg-gradient-to-br from-red-400/30 to-red-600/40 backdrop-blur-md",
          border: isDarkMode
            ? "border border-red-700/30"
            : "border border-red-300/30",
          text: isDarkMode ? "text-red-200" : "text-red-800",
          dot: "bg-gradient-to-r from-red-400 to-red-600",
          badge: isDarkMode
            ? "bg-gradient-to-r from-red-800/60 to-red-700/60 backdrop-blur-md text-red-200"
            : "bg-gradient-to-r from-red-300/60 to-red-400/60 backdrop-blur-md text-red-900",
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

  // Simple Calendar component
  const Calendar = ({ onSelectDate, onClose }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
      return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
      );
    };

    const handleNextMonth = () => {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
      );
    };

    const handleDateClick = (day) => {
      const selected = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      setSelectedDate(selected);
      onSelectDate(selected.toISOString().split("T")[0]);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const monthName = currentDate.toLocaleString("default", { month: "long" });
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    return (
      <div
        className={`p-4 rounded-lg shadow-lg ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } border`}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500"
          >
            &lt;
          </button>
          <div className="font-semibold">{`${monthName} ${year}`}</div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-opacity-10 hover:bg-gray-500"
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <div key={day} className="text-center text-sm font-medium p-1">
              {day}
            </div>
          ))}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`text-center p-1 cursor-pointer rounded ${
                day
                  ? isDarkMode
                    ? "hover:bg-gray-700"
                    : "hover:bg-gray-100"
                  : ""
              }`}
              onClick={() => day && handleDateClick(day)}
            >
              {day || ""}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-3 py-1 rounded ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-gray-800/60" : "bg-white/60"
      } backdrop-blur-lg rounded-2xl p-8 shadow-lg ${
        isDarkMode ? "border-gray-700/50" : "border-white/50"
      } border min-h-[550px]`}
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
          type="button"
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

                {/* Date field with calendar icon */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Date (e.g., Jan 15, 2025)"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <CalendarIcon size={16} />
                  </button>

                  {/* Calendar popup */}
                  {showCalendar && (
                    <div className="absolute mt-2 right-0 z-10">
                      <Calendar
                        onSelectDate={handleDateSelect}
                        onClose={() => setShowCalendar(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Time field */}
                <input
                  type="time"
                  placeholder="Time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
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
                  <option value="milestone">Milestone</option>
                  <option value="deadline">Deadline</option>
                  <option value="other">Other</option>
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

      {/* Edit Event Modal */}
      {isEditingEvent && (
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
              Edit Event
            </h3>
            <form onSubmit={handleUpdateEvent}>
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

                {/* Date field with calendar icon */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Date (e.g., Jan 15, 2025)"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <CalendarIcon size={16} />
                  </button>

                  {/* Calendar popup */}
                  {showCalendar && (
                    <div className="absolute mt-2 right-0 z-10">
                      <Calendar
                        onSelectDate={handleDateSelect}
                        onClose={() => setShowCalendar(false)}
                      />
                    </div>
                  )}
                </div>

                {/* Time field */}
                <input
                  type="time"
                  placeholder="Time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
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
                  <option value="milestone">Milestone</option>
                  <option value="deadline">Deadline</option>
                  <option value="other">Other</option>
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
                    onClick={() => {
                      setIsEditingEvent(false);
                      setEditingEventId(null);
                      setNewEvent({
                        title: "",
                        date: "",
                        time: "",
                        category: "meeting",
                        description: "",
                      });
                    }}
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
                    Update Event
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Centered Timeline */}
      <div className="relative min-h-[400px]">
        {/* Center Line - Only visible when there are events */}
        {timelineEvents.length > 0 && (
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-300 to-purple-400" />
        )}

        {/* Timeline Events */}
        <div className="space-y-12">
          {timelineEvents.length > 0 ? (
            timelineEvents.map((event, index) => {
              const styles = getCategoryStyle(event.category);
              return (
                <div
                  key={event.id}
                  className={`flex ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  } justify-center items-center`}
                >
                  {/* Event Content */}
                  <div
                    className={`w-5/12 ${
                      index % 2 === 0 ? "pr-8 text-right" : "pl-8"
                    }`}
                  >
                    <div
                      className={`p-4 rounded-lg shadow-lg ${styles.bg} ${styles.border}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-bold text-lg ${styles.text}`}>
                            {event.title}
                          </h3>
                          <div className="flex items-center mt-2 space-x-2">
                            {event.date && (
                              <span
                                className={`text-sm flex items-center ${
                                  isDarkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                <CalendarIcon size={14} className="mr-1" />
                                {formatDateString(event.date)}
                              </span>
                            )}
                            {event.time && (
                              <span
                                className={`text-sm flex items-center ${
                                  isDarkMode ? "text-gray-300" : "text-gray-600"
                                }`}
                              >
                                <Clock size={14} className="mr-1" />
                                {event.time}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Event actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => startEditEvent(event)}
                            className={`p-1.5 rounded-full ${
                              isDarkMode
                                ? "hover:bg-gray-700/50"
                                : "hover:bg-gray-100/50"
                            }`}
                          >
                            <Edit2 size={16} className={styles.text} />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className={`p-1.5 rounded-full ${
                              isDarkMode
                                ? "hover:bg-gray-700/50"
                                : "hover:bg-gray-100/50"
                            }`}
                          >
                            <Trash2 size={16} className={styles.text} />
                          </button>
                        </div>
                      </div>

                      <span
                        className={`inline-block px-2 py-0.5 text-xs rounded-full mt-2 ${styles.badge}`}
                      >
                        {event.category.charAt(0).toUpperCase() +
                          event.category.slice(1)}
                      </span>

                      {event.description && (
                        <p
                          className={`mt-2 text-sm ${
                            isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Center Dot */}
                  <div className="relative">
                    <div
                      className={`w-4 h-4 rounded-full ${styles.dot} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-md`}
                    />
                  </div>

                  {/* Empty space for the opposite side */}
                  <div className="w-5/12" />
                </div>
              );
            })
          ) : (
            <div
              className={`flex flex-col items-center justify-center text-center py-16 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <CalendarIcon
                size={48}
                className={`mb-4 ${
                  isDarkMode ? "text-gray-600" : "text-gray-400"
                }`}
              />
              <h3 className="text-lg font-medium mb-2">No events yet</h3>
              <p className="max-w-sm">
                Add important events, milestones, and deadlines to create your
                project timeline.
              </p>
              <button
                onClick={() => setIsAddingEvent(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-800 flex items-center"
              >
                <Plus size={16} className="mr-2" />
                Add First Event
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
