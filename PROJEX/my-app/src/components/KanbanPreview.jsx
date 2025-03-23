import React, { useState, useRef, useEffect } from "react";
import TimelineBoard from "./TimelineBoard";
import CalendarComponent from "./CalendarComponent";
import TeamBoard from "./TeamBoard";

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
  const [boardTitle, setBoardTitle] = useState("My Project Board");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(boardTitle);
  const [activeTab, setActiveTab] = useState("tasks");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [currentColumn, setCurrentColumn] = useState(null);
  const [originalColumn, setOriginalColumn] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);
  const taskNameInputRef = useRef(null);
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);

  const generateId = () => Math.floor(Math.random() * 10000);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const [columns, setColumns] = useState([
    {
      id: "todo",
      title: "To Do",
      color: "bg-gradient-to-br from-pink-500 to-purple-600",
      tasks: [
        {
          id: 1,
          name: "Design System",
          description: "Create design system for the entire application",
          priority: "high",
          assignee: "JS",
        },
        {
          id: 2,
          name: "User Research",
          description: "Conduct user interviews and create personas",
          priority: "medium",
          assignee: "AK",
        },
      ],
    },
    {
      id: "progress",
      title: "In Progress",
      color: "bg-gradient-to-br from-blue-500 to-cyan-600",
      tasks: [
        {
          id: 3,
          name: "Dashboard UI",
          description: "Implement the dashboard UI components",
          priority: "high",
          assignee: "JS",
        },
        {
          id: 4,
          name: "API Integration",
          description: "Integrate the frontend with backend APIs",
          priority: "medium",
          assignee: "TL",
        },
      ],
    },
    {
      id: "done",
      title: "Done",
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      tasks: [
        {
          id: 5,
          name: "Project Setup",
          description: "Initialize the project repository and structure",
          priority: "low",
          assignee: "JS",
        },
      ],
    },
  ]);

  useEffect(() => {
    if (showTaskModal && taskNameInputRef.current) {
      setTimeout(() => {
        taskNameInputRef.current.focus();
      }, 0);
    }
  }, [showTaskModal]);

  const handleDragStart = (task, columnId) => {
    setDraggedTask({ task, sourceColumnId: columnId });
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    if (!draggedTask) return;

    const { task, sourceColumnId } = draggedTask;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setColumns((prevColumns) => {
      const updatedColumns = prevColumns.map((column) => {
        if (column.id === sourceColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== task.id),
          };
        }
        return column;
      });

      return updatedColumns.map((column) => {
        if (column.id === targetColumnId) {
          return {
            ...column,
            tasks: [...column.tasks, task],
          };
        }
        return column;
      });
    });

    setDraggedTask(null);
  };

  const editTask = (task, columnId) => {
    setCurrentTask({ ...task });
    setCurrentColumn(columnId);
    setOriginalColumn(columnId);
    setShowTaskModal(true);
    setTaskMenuOpen(null);
  };

  const deleteTask = (taskId, columnId) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => {
        if (column.id === columnId) {
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          };
        }
        return column;
      })
    );
    setTaskMenuOpen(null);
  };

  const saveTask = () => {
    if (!currentTask.name.trim()) {
      return;
    }

    setColumns((prevColumns) => {
      let updatedColumns = [...prevColumns];

      if (originalColumn) {
        updatedColumns = updatedColumns.map((column) => {
          if (column.id === originalColumn) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== currentTask.id),
            };
          }
          return column;
        });
      }

      return updatedColumns.map((column) => {
        if (column.id === currentColumn) {
          return {
            ...column,
            tasks: [...column.tasks, currentTask],
          };
        }
        return column;
      });
    });

    setShowTaskModal(false);
    setCurrentTask(null);
    setCurrentColumn(null);
    setOriginalColumn(null);
  };

  const toggleTaskMenu = (taskId) => {
    setTaskMenuOpen(taskMenuOpen === taskId ? null : taskId);
  };

  const handleTaskInputChange = (field, value) => {
    setCurrentTask((prevTask) => ({
      ...prevTask,
      [field]: value,
    }));
  };

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      setBoardTitle(editedTitle);
    }
    setIsEditingTitle(false);
  };

  const NavItem = ({ icon: Icon, label, id }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center border-0 ${
        isSidebarOpen ? "px-4" : "px-2 justify-center"
      } py-3 rounded-lg transition-all duration-300 ${
        activeTab === id
          ? "text-white backdrop-blur-lg bg-white/20 shadow-lg" // Enhanced glass effect for active items
          : "text-white text-opacity-70 bg-transparent hover:text-white hover:backdrop-blur-md hover:bg-white/10" // No effect in default state, only on hover
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
          Add Task
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

                {/* Only show the Add Task button when the tasks tab is active */}
                {activeTab === "tasks" && (
                  <button
                    onClick={() => {
                      setCurrentTask({
                        id: generateId(),
                        name: "",
                        description: "",
                        priority: "medium",
                        assignee: "",
                      });
                      setCurrentColumn("todo");
                      setShowTaskModal(true);
                      setIsAddingNewTask(true);
                    }}
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
