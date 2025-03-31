import React, { useState, useRef, useEffect } from "react";
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig"; // Adjust the import path as needed
import TimelineBoard from "./TimelineBoard";
import CalendarComponent from "./CalendarComponent";
import TeamBoard from "./TeamBoard";

const projectId = "project1";

import {
  MoreHorizontal,
  Users,
  Edit2,
  Check,
  Layout,
  Calendar,
  Clock,
  Menu,
  X,
  Trash2,
  Plus,
  Sun,
  Moon,
} from "lucide-react";

const KanbanBoard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [boardTitle, setBoardTitle] = useState("Loading...");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(boardTitle);
  const [activeTab, setActiveTab] = useState("tasks");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [originalColumn, setOriginalColumn] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);
  const [lastEditedField, setLastEditedField] = useState(null);

  const [isAddingNewTask, setIsAddingNewTask] = useState(false);
  const taskNameInputRef = useRef(null);
  const descriptionInputRef = useRef(null);
  const generateId = () => Math.floor(Math.random() * 10000);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [columns, setColumns] = useState([]);

  const handleDragStart = (task, columnId) => {
    setDraggedTask({ task, sourceColumnId: columnId });
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
  };

  // When saving columns
  const saveColumnsToFirestore = async (columns) => {
    try {
      const projectRef = doc(db, "projects", projectId, "Tasks", "Tasks");
      await setDoc(projectRef, { columns }, { merge: true });
      console.log("Columns successfully updated in Firestore!");
    } catch (error) {
      console.error("Error updating columns in Firestore:", error);
    }
  };

  // When loading columns
  const loadColumnsFromFirestore = async () => {
    try {
      const projectRef = doc(db, "projects", projectId, "Tasks", "Tasks");
      const projectSnap = await getDoc(projectRef);

      if (projectSnap.exists()) {
        const data = projectSnap.data();
        if (data.columns) {
          setColumns(data.columns);
        }
      }
    } catch (error) {
      console.error("Error loading columns from Firestore:", error);
    }
  };

  // Add this useEffect to load columns on component mount
  useEffect(() => {
    loadColumnsFromFirestore();
  }, []);

  useEffect(() => {
    loadColumnsFromFirestore();
  }, []);

  const updateColumns = (newColumns) => {
    setColumns(newColumns);
    saveColumnsToFirestore(newColumns);
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { task, sourceColumnId } = draggedTask;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    const updatedColumns = columns.map((column) => {
      if (column.id === sourceColumnId) {
        return {
          ...column,
          tasks: column.tasks.filter((t) => t.id !== task.id),
        };
      }
      if (column.id === targetColumnId) {
        return {
          ...column,
          tasks: [...column.tasks, { ...task, columnId: targetColumnId }],
        };
      }
      return column;
    });

    updateColumns(updatedColumns);
    setDraggedTask(null);
  };

  const editTask = (task, columnId) => {
    setCurrentTask(task);
    setCurrentColumn(columnId);
    setShowTaskModal(true);
    setIsAddingNewTask(false);
    setTaskMenuOpen(null);
  };

  const saveTask = () => {
    // Validate task name
    if (!currentTask.name.trim()) {
      alert("Task name cannot be empty");
      return;
    }

    const updatedColumns = columns.map((column) => {
      if (column.id === currentColumn) {
        // If the task already exists, replace it
        const existingTaskIndex = column.tasks.findIndex(
          (t) => t.id === currentTask.id
        );

        if (existingTaskIndex !== -1) {
          const updatedTasks = [...column.tasks];
          updatedTasks[existingTaskIndex] = currentTask;
          return {
            ...column,
            tasks: updatedTasks,
          };
        }

        // If it's a new task, add it to the tasks array
        return {
          ...column,
          tasks: [...column.tasks, currentTask],
        };
      }
      return column;
    });

    updateColumns(updatedColumns);
    setShowTaskModal(false);
    setCurrentTask(null);
    setCurrentColumn(null);
  };

  const deleteTask = (taskId, columnId) => {
    const updatedColumns = columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        };
      }
      return column;
    });

    updateColumns(updatedColumns);
    setTaskMenuOpen(null);
  };

  const toggleTaskMenu = (taskId) => {
    setTaskMenuOpen(taskMenuOpen === taskId ? null : taskId);
  };

  useEffect(() => {
    if (lastEditedField === "name" && taskNameInputRef.current) {
      taskNameInputRef.current.focus();
    } else if (
      lastEditedField === "description" &&
      descriptionInputRef.current
    ) {
      descriptionInputRef.current.focus();
    }
  }, [currentTask, lastEditedField]);

  const handleTaskInputChange = (field, value) => {
    setLastEditedField(field); // Track the last field edited

    // Get the input reference dynamically
    const inputRef =
      field === "name" ? taskNameInputRef.current : descriptionInputRef.current;

    if (inputRef) {
      const cursorPosition = inputRef.selectionStart; // Save cursor position

      setCurrentTask((prevTask) => {
        if (prevTask?.[field] === value) return prevTask;
        return { ...prevTask, [field]: value };
      });

      setTimeout(() => {
        if (inputRef) {
          inputRef.selectionStart = cursorPosition; // Restore cursor position
          inputRef.selectionEnd = cursorPosition;
        }
      }, 0); // Timeout ensures it runs **after** re-render
    }
  };

  const startAddingNewTask = () => {
    const newTask = {
      id: generateId(),
      name: "",
      description: "",
      priority: "medium",
      assignee: "",
    };

    setCurrentTask(newTask);
    setCurrentColumn("todo");
    setShowTaskModal(true);
    setIsAddingNewTask(true);
  };

  useEffect(() => {
    const fetchBoardTitle = async () => {
      try {
        const titleRef = doc(db, "projects", projectId, "TITLE", "title");
        const titleSnap = await getDoc(titleRef);

        if (titleSnap.exists()) {
          const data = titleSnap.data();
          if (data.title) {
            setBoardTitle(data.title);
          }
        } else {
          // If no title exists, set a default title and save it to Firestore
          const defaultTitle = "My Project";
          await setDoc(titleRef, { title: defaultTitle });
          setBoardTitle(defaultTitle);
        }
      } catch (error) {
        console.error("Error loading board title:", error);
      }
    };

    fetchBoardTitle();
  }, [projectId]);

  const handleTitleSave = async () => {
    if (editedTitle.trim() && projectId) {
      try {
        // Update local state
        setBoardTitle(editedTitle);

        // Update Firebase
        const titleRef = doc(db, "projects", projectId, "TITLE", "title");
        await updateDoc(titleRef, {
          title: editedTitle,
        });

        console.log(`Title updated successfully for ${projectId}`);
      } catch (error) {
        console.error("Error updating project title: ", error);
      }
    }
    setIsEditingTitle(false);
  };

  useEffect(() => {
    if (!projectId) return;

    const projectRef = doc(db, "projects", projectId, "Tasks", "Tasks");

    // Listen for real-time updates to the columns
    const unsubscribe = onSnapshot(projectRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.columns) {
          setColumns(data.columns);
        }
      }
    });

    return () => unsubscribe(); // Cleanup listener when component unmounts
  }, [projectId]);

  useEffect(() => {
    setEditedTitle(boardTitle);
  }, [boardTitle]);

  const NavItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center border-0 ${
        isSidebarOpen ? "px-4" : "px-2 justify-center"
      } py-3 rounded-lg transition-all duration-300 ${
        activeTab === id
          ? "text-white backdrop-blur-lg bg-white/20 shadow-lg"
          : "text-white text-opacity-70 bg-transparent hover:text-white hover:backdrop-blur-md hover:bg-white/10"
      }`}
      style={{
        outline: "none",
        border: "none",
      }}
    >
      <Icon size={20} />
      {isSidebarOpen && <span className="ml-2 font-medium">{label}</span>}
    </button>
  );

  const TaskModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div
        className={`${
          isDarkMode ? "bg-gray-800" : "bg-white"
        } rounded-lg shadow-xl w-full max-w-md p-6 m-4`}
      >
        <h2
          className={`text-xl font-bold mb-4 ${
            isDarkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {isAddingNewTask ? "Add Task" : "Edit Task"}
        </h2>

        <div className="mb-4">
          <label
            className={`block text-sm font-medium mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Task Name
          </label>
          <input
            ref={taskNameInputRef}
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            value={currentTask?.name || ""}
            onChange={(e) => handleTaskInputChange("name", e.target.value)}
            placeholder="Enter task name..."
          />
        </div>

        <div className="mb-4">
          <label
            className={`block text-sm font-medium mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Description
          </label>
          <textarea
            ref={descriptionInputRef}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            rows="3"
            value={currentTask?.description || ""}
            onChange={(e) =>
              handleTaskInputChange("description", e.target.value)
            }
            placeholder="Describe the task..."
          />
        </div>

        <div className="mb-4">
          <label
            className={`block text-sm font-medium mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Priority
          </label>
          <select
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            value={currentTask?.priority || "medium"}
            onChange={(e) => handleTaskInputChange("priority", e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="mb-6">
          <label
            className={`block text-sm font-medium mb-1 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Assignee Initials
          </label>
          <input
            type="text"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 text-white"
                : "bg-white border-gray-300 text-gray-900"
            }`}
            value={currentTask?.assignee || ""}
            onChange={(e) =>
              handleTaskInputChange(
                "assignee",
                e.target.value.slice(0, 2).toUpperCase()
              )
            }
            placeholder="e.g. JS"
            maxLength="2"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className={`px-4 py-2 border rounded-md ${
              isDarkMode
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setShowTaskModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            onClick={saveTask}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden ${
        isDarkMode
          ? "bg-gradient-to-br from-neutral-950 via-indigo-950 to-neutral-950"
          : "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100"
      }`}
    >
      <div
        className={`
        h-screen flex-shrink-0 transition-all duration-300
        ${isSidebarOpen ? "w-64" : "w-16"}
      `}
      >
        <div className="h-full bg-gradient-to-b from-indigo-600 to-purple-700 fixed">
          <div
            className={`h-full transition-all duration-300 ${
              isSidebarOpen ? "w-64" : "w-16"
            }`}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                {isSidebarOpen && (
                  <h2 className="text-white text-xl font-bold">PROJEX</h2>
                )}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-white p-1 hover:bg-white hover:bg-opacity-10 rounded-lg bg-transparent"
                  style={{ border: "none", outline: "none" }}
                >
                  {isSidebarOpen ? <X size={25} /> : <Menu size={25} />}
                </button>
              </div>
              <nav className="space-y-2">
                <NavItem icon={Layout} label="Tasks" id="tasks" />
                <NavItem icon={Clock} label="Timeline" id="timeline" />
                <NavItem icon={Calendar} label="Calendar" id="calendar" />
                <NavItem icon={Users} label="Teams" id="teams" />
              </nav>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg"
      >
        <Menu size={24} />
      </button>

      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        <div className="p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className={`text-4xl font-bold bg-transparent border-b-2 border-indigo-500 focus:outline-none px-2 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                      autoFocus
                    />
                    <button
                      onClick={handleTitleSave}
                      className="ml-2 text-indigo-600 hover:text-indigo-800 bg-transparent p-0"
                      style={{ border: "none", outline: "none" }}
                    >
                      <Check size={24} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h1
                      className={`text-4xl font-bold ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {boardTitle}
                    </h1>
                    <button
                      onClick={() => setIsEditingTitle(true)}
                      className={`ml-3 ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      style={{
                        border: "none",
                        backgroundColor: "transparent",
                        outline: "none",
                      }}
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-700 text-yellow-400"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {activeTab === "tasks" && (
                  <button
                    onClick={startAddingNewTask}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center space-x-2 shadow-md"
                  >
                    <Plus size={20} />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            </div>

            {activeTab === "tasks" && (
              <div className="grid grid-cols-3 gap-6">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="w-full"
                    onDragOver={(e) => handleDragOver(e, column.id)}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <div
                      className={`${column.color} rounded-2xl p-0.5 shadow-lg h-full`}
                    >
                      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl h-full">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">
                              {column.title}
                            </h2>
                            <span className="bg-white bg-opacity-30 text-white px-3 py-1 rounded-full text-sm">
                              {column.tasks.length}
                            </span>
                          </div>

                          <div className="min-h-[500px]">
                            {column.tasks.map((task) => (
                              <div
                                key={task.id}
                                className={`mb-3 p-4 ${
                                  isDarkMode
                                    ? "bg-gray-800/40 backdrop-blur-md"
                                    : "bg-white/40 backdrop-blur-md"
                                } rounded-xl shadow-md hover:shadow-lg transition-all cursor-move relative
                                  ${
                                    draggedTask &&
                                    draggedTask.task.id === task.id
                                      ? "opacity-50"
                                      : "opacity-100"
                                  }`}
                                draggable
                                onDragStart={() =>
                                  handleDragStart(task, column.id)
                                }
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h3
                                      className={`font-medium text-base ${
                                        isDarkMode
                                          ? "text-gray-200"
                                          : "text-gray-800"
                                      }`}
                                    >
                                      {task.name}
                                    </h3>
                                    {task.description && (
                                      <p
                                        className={`text-sm mt-1 line-clamp-2 ${
                                          isDarkMode
                                            ? "text-gray-400"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <button
                                      onClick={() => toggleTaskMenu(task.id)}
                                      className={`bg-transparent border-0 ${
                                        isDarkMode
                                          ? "text-gray-400 hover:text-gray-200"
                                          : "text-gray-400 hover:text-gray-600"
                                      }`}
                                      style={{
                                        border: "none",
                                        outline: "none",
                                      }}
                                    >
                                      <MoreHorizontal size={16} />
                                    </button>{" "}
                                    {taskMenuOpen === task.id && (
                                      <div
                                        className={`absolute right-0 mt-1 w-36 rounded-md shadow-lg z-10 py-1 ${
                                          isDarkMode
                                            ? "bg-gray-800"
                                            : "bg-white"
                                        }`}
                                      >
                                        <button
                                          onClick={() =>
                                            editTask(task, column.id)
                                          }
                                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                                            isDarkMode
                                              ? "text-gray-300 hover:bg-gray-700"
                                              : "text-gray-700 hover:bg-gray-100"
                                          }`}
                                        >
                                          <Edit2 size={14} className="mr-2" />
                                          Edit
                                        </button>
                                        <button
                                          onClick={() =>
                                            deleteTask(task.id, column.id)
                                          }
                                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                                        >
                                          <Trash2 size={14} className="mr-2" />
                                          Delete
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      task.priority === "high"
                                        ? "bg-red-100 text-red-700"
                                        : task.priority === "medium"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-green-100 text-green-700"
                                    }`}
                                  >
                                    {task.priority.charAt(0).toUpperCase() +
                                      task.priority.slice(1)}
                                  </span>
                                  {task.assignee && (
                                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                                      <span className="text-xs text-white font-medium">
                                        {task.assignee}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "timeline" && <TimelineBoard columns={columns} />}

            {activeTab === "calendar" && (
              <CalendarComponent columns={columns} />
            )}
            {activeTab === "teams" && <TeamBoard columns={columns} />}
          </div>
        </div>
      </main>

      {showTaskModal && <TaskModal />}
    </div>
  );
};

export default KanbanBoard;
