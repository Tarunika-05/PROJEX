import React, { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Sun,
  Moon,
  LayoutDashboard,
  FolderOpen,
  Users,
  Settings,
  ChevronRight,
  MoreVertical,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  Users2,
  Target,
  Calendar,
  FileText,
  Bot,
  FolderPlus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Award,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [activeProjectMenu, setActiveProjectMenu] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectDescription, setProjectDescription] = useState("");
  const [projectDueDate, setProjectDueDate] = useState("");
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");

  const [stats, setStats] = useState([
    {
      icon: Target,
      label: "Total Projects",
      value: "0",

      color: "from-violet-500 to-indigo-600",
    },
    {
      icon: Users2,
      label: "Teams",
      value: "0",

      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: CheckCircle2,
      label: "Completed Tasks",
      value: "0",

      color: "from-green-400 to-emerald-500",
    },
    {
      icon: TrendingUp,
      label: "Completion Rate",
      value: "0%",

      color: "from-pink-400 to-rose-500",
      direction: "up",
    },
  ]);

  const navigate = useNavigate();

  // Project gradient colors
  const projectColors = [
    "from-blue-400 to-cyan-500",
    "from-pink-400 to-rose-500",
    "from-indigo-400 to-purple-500",
    "from-emerald-400 to-green-500",
    "from-amber-400 to-orange-500",
    "from-violet-400 to-indigo-500",
  ];

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  // Get current user data on component mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
        fetchUserProjects(user.uid);
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Handle clicks outside the dropdown menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeProjectMenu && !event.target.closest(".project-menu")) {
        setActiveProjectMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeProjectMenu]);

  // Function to fetch project title
  const fetchProjectTitle = async (userId, projectId) => {
    try {
      const titleDocRef = doc(
        db,
        `users/${userId}/projects/${projectId}/title/info`
      );
      const titleDocSnap = await getDoc(titleDocRef);

      if (titleDocSnap.exists()) {
        return titleDocSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching project title: ", error);
      return null;
    }
  };

  // Function to fetch task data from Firestore
  const fetchProjectTasks = async (userId, projectId) => {
    try {
      const tasksDocRef = doc(
        db,
        `users/${userId}/projects/${projectId}/tasks/config`
      );
      const tasksDocSnap = await getDoc(tasksDocRef);

      if (tasksDocSnap.exists()) {
        const tasksData = tasksDocSnap.data();
        if (tasksData.columns && Array.isArray(tasksData.columns)) {
          // Count total tasks across all columns
          let totalTasks = 0;
          tasksData.columns.forEach((column) => {
            if (column.tasks && Array.isArray(column.tasks)) {
              totalTasks += column.tasks.length;
            }
          });

          // Count completed tasks from "Done" column (assuming it's at index 2)
          let completedTasks = 0;
          if (
            tasksData.columns[2] &&
            tasksData.columns[2].tasks &&
            Array.isArray(tasksData.columns[2].tasks)
          ) {
            completedTasks = tasksData.columns[2].tasks.length;
          }

          return {
            total: totalTasks,
            completed: completedTasks,
          };
        }
      }

      return { total: 0, completed: 0 };
    } catch (error) {
      console.error("Error fetching project tasks: ", error);
      return { total: 0, completed: 0 };
    }
  };

  // Fetch user's projects from Firestore
  // Fetch user's projects from Firestore
  const fetchUserProjects = async (userId) => {
    try {
      setIsLoading(true);
      const projectsRef = collection(db, `users/${userId}/projects`);
      const q = query(projectsRef, orderBy("createdAt", "desc"), limit(6));

      const querySnapshot = await getDocs(q);

      const projectsList = [];
      let totalCompletedTasks = 0;
      let totalTasksCount = 0;
      let totalProjects = 0;
      let totalTeamMembers = 0;

      // Process all projects
      const projectPromises = querySnapshot.docs.map(
        async (docSnapshot, index) => {
          const projectData = { id: docSnapshot.id, ...docSnapshot.data() };
          totalProjects++;

          // Fetch team members from the team members collection if it exists
          try {
            const teamMembersRef = collection(
              db,
              `users/${userId}/projects/${docSnapshot.id}/team`
            );
            const teamMembersSnapshot = await getDocs(teamMembersRef);

            // Add count of documents in the team collection
            const teamMembersCount = teamMembersSnapshot.docs.length;
            if (teamMembersCount > 0) {
              totalTeamMembers += teamMembersCount;

              // Add this count to projectData as well for display
              projectData.teamMembersCount = teamMembersCount;
            }
          } catch (error) {
            console.log(
              `No team members collection for project ${docSnapshot.id}`
            );
          }

          // Assign alternating colors
          projectData.color = projectColors[index % projectColors.length];

          // Fetch the title from the specified path
          const titleData = await fetchProjectTitle(userId, docSnapshot.id);

          if (titleData) {
            projectData.customTitle =
              titleData.title || titleData.name || "Untitled Project";
          }

          // Fetch task data for this project
          const taskData = await fetchProjectTasks(userId, docSnapshot.id);

          // Update project with task data
          projectData.tasks = taskData;

          // Calculate progress percentage
          if (taskData.total > 0) {
            projectData.progress = Math.round(
              (taskData.completed / taskData.total) * 100
            );
          } else {
            projectData.progress = 0;
          }

          // Add to totals for stats
          totalCompletedTasks += taskData.completed;
          totalTasksCount += taskData.total;

          return projectData;
        }
      );

      // Wait for all promises to resolve
      const resolvedProjects = await Promise.all(projectPromises);
      setProjects(resolvedProjects);

      // Calculate completion rate and direction
      let completionRate = "0%";
      let completionDirection = "up";
      let completionTrend = "+0%";

      if (totalTasksCount > 0) {
        const rate = Math.round((totalCompletedTasks / totalTasksCount) * 100);
        completionRate = `${rate}%`;
        completionDirection = rate >= 50 ? "up" : "down";
        completionTrend = `+${rate}%`;
      }

      // Project growth trend
      const projectTrend =
        totalProjects > 0 ? `+${Math.round(totalProjects * 10)}%` : "+0%";

      // Team growth trend
      const teamTrend =
        totalTeamMembers > 0 ? `+${totalTeamMembers * 5}%` : "+0%";

      // Tasks growth trend
      const tasksTrend =
        totalCompletedTasks > 0
          ? `+${Math.round(totalCompletedTasks * 5)}%`
          : "+0%";

      // Update stats
      setStats([
        {
          icon: Target,
          label: "Total Projects",
          value: totalProjects.toString(),

          color: "from-violet-500 to-indigo-600",
        },
        {
          icon: Users2,
          label: "Teams",
          value: totalTeamMembers.toString(),

          color: "from-blue-400 to-cyan-500",
        },
        {
          icon: CheckCircle2,
          label: "Completed Tasks",
          value: totalCompletedTasks.toString(),

          color: "from-green-400 to-emerald-500",
        },
        {
          icon: TrendingUp,
          label: "Completion Rate",
          value: completionRate,

          color: "from-pink-400 to-rose-500",
          direction: completionDirection,
        },
      ]);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching projects: ", error);
      setIsLoading(false);
    }
  };

  // Generate user initials from name or email
  const getUserInitials = () => {
    if (!currentUser) return "U";

    if (currentUser.displayName) {
      const nameParts = currentUser.displayName.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return currentUser.displayName[0].toUpperCase();
    }

    return currentUser.email.substring(0, 2).toUpperCase();
  };

  // Get display name or email for UI
  const getUserDisplayName = () => {
    if (!currentUser) return "User";
    return currentUser.displayName || currentUser.email.split("@")[0];
  };

  // Function to create a new project
  const handleCreateProject = async () => {
    if (!currentUser) {
      console.error("No user is logged in");
      return;
    }

    try {
      setIsCreatingProject(true);

      // Create a new project with default values
      const newProject = {
        name: "New Project",
        description: "Add your project description here",
        progress: 0,
        dueDate: new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        tasks: { completed: 0, total: 0 },
        members: 1,
        priority: "Medium",
        color: projectColors[projects.length % projectColors.length],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: currentUser.uid,
      };

      // Reference to the user's projects subcollection
      const projectsRef = collection(db, `users/${currentUser.uid}/projects`);

      // Add the new project document
      const newProjectRef = await addDoc(projectsRef, newProject);

      console.log("Project created with ID: ", newProjectRef.id);

      // Create initial Kanban columns for the project
      const taskConfigRef = doc(
        db,
        `users/${currentUser.uid}/projects/${newProjectRef.id}/tasks/config`
      );
      await setDoc(taskConfigRef, {
        columns: [
          {
            id: "todo",
            title: "To Do",
            color: "bg-gradient-to-br from-pink-500 to-purple-600",
            tasks: [],
          },
          {
            id: "inProgress",
            title: "In Progress",
            color: "bg-gradient-to-br from-blue-500 to-cyan-600",
            tasks: [],
          },
          {
            id: "done",
            title: "Done",
            color: "bg-gradient-to-br from-green-500 to-emerald-600",
            tasks: [],
          },
        ],
      });

      // Create the title document
      const titleDocRef = doc(
        db,
        `users/${currentUser.uid}/projects/${newProjectRef.id}/title/info`
      );
      await setDoc(titleDocRef, {
        title: "New Project Title",
        createdAt: serverTimestamp(),
      });

      // Navigate to the KanbanBoard for this project
      navigate(`/kanban/${newProjectRef.id}`);
    } catch (error) {
      console.error("Error creating project: ", error);
      alert("Failed to create project: " + error.message);
    } finally {
      setIsCreatingProject(false);
    }
  };

  // Open project edit modal
  const openEditModal = (project) => {
    setEditingProject(project);
    setProjectDescription(project.description || "");

    // Format the date for the input if it exists
    if (project.dueDate) {
      let dueDateObj;
      try {
        // Parse date format like "Apr 30"
        const parts = project.dueDate.split(" ");
        const month = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        }[parts[0]];
        const day = parseInt(parts[1]);
        const year = new Date().getFullYear();
        dueDateObj = new Date(year, month, day);
      } catch (e) {
        dueDateObj = new Date();
      }

      // Format as YYYY-MM-DD for the date input
      const yyyy = dueDateObj.getFullYear();
      const mm = String(dueDateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dueDateObj.getDate()).padStart(2, "0");
      setProjectDueDate(`${yyyy}-${mm}-${dd}`);
    } else {
      // Default to today if no date
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      setProjectDueDate(`${yyyy}-${mm}-${dd}`);
    }

    setIsEditModalOpen(true);
    setActiveProjectMenu(null);
  };

  // Handle project update in Firestore
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!currentUser || !editingProject) return;

    setIsLoading(true);

    try {
      // Format date from input (YYYY-MM-DD) to display format (Apr 30)
      const dateObj = new Date(projectDueDate);
      const formattedDueDate = dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      // Update project in Firestore
      const projectRef = doc(
        db,
        `users/${currentUser.uid}/projects/${editingProject.id}`
      );
      await updateDoc(projectRef, {
        description: projectDescription,
        dueDate: formattedDueDate,
        updatedAt: serverTimestamp(),
      });

      // Update title document as well
      const titleDocRef = doc(
        db,
        `users/${currentUser.uid}/projects/${editingProject.id}/title/info`
      );

      const titleDocSnap = await getDoc(titleDocRef);

      if (titleDocSnap.exists()) {
        await updateDoc(titleDocRef, {
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(titleDocRef, {
          title: editingProject.customTitle || "New Project Title",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      // Update local state
      setProjects(
        projects.map((project) =>
          project.id === editingProject.id
            ? {
                ...project,
                description: projectDescription,
                dueDate: formattedDueDate,
              }
            : project
        )
      );

      // Close modal
      setIsEditModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project: ", error);
      alert("Failed to update project: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Open delete confirmation modal
  const openDeleteConfirmation = (project) => {
    setProjectToDelete(project);
    setIsConfirmDeleteOpen(true);
    setActiveProjectMenu(null);
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!currentUser || !projectToDelete) return;

    setIsLoading(true);

    try {
      // Delete task config document if it exists
      try {
        const taskConfigRef = doc(
          db,
          `users/${currentUser.uid}/projects/${projectToDelete.id}/tasks/config`
        );
        const taskConfigSnap = await getDoc(taskConfigRef);
        if (taskConfigSnap.exists()) {
          await deleteDoc(taskConfigRef);
        }
      } catch (taskError) {
        console.error("Error deleting task config: ", taskError);
      }

      // Delete title document if it exists
      try {
        const titleDocRef = doc(
          db,
          `users/${currentUser.uid}/projects/${projectToDelete.id}/title/info`
        );
        const titleDocSnap = await getDoc(titleDocRef);
        if (titleDocSnap.exists()) {
          await deleteDoc(titleDocRef);
        }
      } catch (titleError) {
        console.error("Error deleting title document: ", titleError);
      }

      // Delete the main project document
      const projectRef = doc(
        db,
        `users/${currentUser.uid}/projects/${projectToDelete.id}`
      );
      await deleteDoc(projectRef);

      // Update local state
      const updatedProjects = projects.filter(
        (project) => project.id !== projectToDelete.id
      );
      setProjects(updatedProjects);

      // Recalculate stats
      let totalCompleted = 0;
      let totalTasks = 0;
      let totalMembers = 0;

      updatedProjects.forEach((project) => {
        totalCompleted += project.tasks?.completed || 0;
        totalTasks += project.tasks?.total || 0;
        totalMembers += project.members || 0;
      });

      // Calculate completion rate
      let completionRate = "0%";
      let completionDirection = "up";
      let completionTrend = "+0%";

      if (totalTasks > 0) {
        const rate = Math.round((totalCompleted / totalTasks) * 100);
        completionRate = `${rate}%`;
        completionDirection = rate >= 50 ? "up" : "down";
        completionTrend = `+${rate}%`;
      }

      // Update stats
      setStats([
        {
          icon: Target,
          label: "Total Projects",
          value: updatedProjects.length.toString(),

          color: "from-violet-500 to-indigo-600",
        },
        {
          icon: Users2,
          label: "Teams",
          value: totalMembers.toString(),

          color: "from-blue-400 to-cyan-500",
        },
        {
          icon: CheckCircle2,
          label: "Completed Tasks",
          value: totalCompleted.toString(),

          color: "from-green-400 to-emerald-500",
        },
        {
          icon: TrendingUp,
          label: "Completion Rate",
          value: completionRate,

          color: "from-pink-400 to-rose-500",
          direction: completionDirection,
        },
      ]);

      // Close modal
      setIsConfirmDeleteOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error("Error deleting project: ", error);
      alert("Failed to delete project: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to project's kanban board
  const openProject = (projectId) => {
    navigate(`/kanban/${projectId}`);
  };

  // Toggle project options menu
  const toggleProjectMenu = (projectId, e) => {
    e.stopPropagation();
    setActiveProjectMenu(activeProjectMenu === projectId ? null : projectId);
  };

  return (
    <div
      className={`h-screen w-full overflow-hidden ${isDarkMode ? "dark" : ""}`}
    >
      <div className="flex h-full w-full bg-gradient-to-br from-pink-100 via-indigo-100 to-purple-100 dark:from-gray-900 dark:via-indigo-800 dark:to-purple-900 backdrop-blur-xl">
        {/* Main Content */}
        <div className="flex-1 h-screen overflow-hidden">
          {/* Header with glassmorphic effect */}
          <header className="h-18 bg-white/30 dark:bg-gray-800/30 backdrop-blur-2xl border-b border-white/10 dark:border-gray-700/10 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between px-8 py-4">
              <div className="flex px-10 items-center gap-4 min-w-0">
                <div className="bg-gradient-to-br  from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <h2 className="text-3xl  font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                  PROJEX
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 ">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium shadow-md ">
                    {getUserInitials()}
                  </div>
                  <div className="hidden md:block">
                    <p className="text-xl font-medium text-gray-900 dark:text-white truncate pr-px-10">
                      {getUserDisplayName()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content with Glassmorphic Cards */}
          <main className="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden pb-8">
            <div className="mx-auto p-8 w-full max-w-[80rem]">
              {/* Welcome Section with time-based greeting */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      {greeting}, {getUserDisplayName()}!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      className={`px-5 py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center shadow-lg hover:shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 ${
                        isCreatingProject ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      onClick={handleCreateProject}
                      disabled={isCreatingProject}
                    >
                      <FolderPlus size={30} className="mr-2" />
                      {isCreatingProject ? "Creating..." : "New Project"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid with Glassmorphic Effect */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-2xl p-4 shadow-lg border border-white/30 dark:border-gray-600/30 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white transition-all shadow-md group-hover:shadow-xl duration-300 transform group-hover:scale-110`}
                      >
                        {index === 3 ? (
                          stat.direction === "up" ? (
                            <ArrowUp className="h-6 w-6" />
                          ) : (
                            <ArrowDown className="h-6 w-6" />
                          )
                        ) : (
                          <stat.icon className="h-6 w-6" />
                        )}
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-indigo-100/50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 backdrop-blur-sm">
                        {stat.trend}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {stat.value}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects Section Title */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                  <FolderOpen className="mr-2 text-indigo-500" size={24} />
                  My Projects
                </h2>
              </div>

              {/* Projects Grid with Glassmorphic Effect */}
              <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6">
                {isLoading ? (
                  // Loading skeleton
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-xl shadow-sm h-64 border border-white/10 dark:border-gray-700/10 animate-pulse"
                      >
                        <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-t-xl animate-pulse"></div>
                        <div className="p-5 space-y-4">
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-2/3 animate-pulse"></div>
                          <div className="flex justify-between items-center mt-6">
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 animate-pulse"></div>
                            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))
                ) : projects.length === 0 ? (
                  // Empty state
                  <div className="col-span-1 lg:col-span-3 bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-xl shadow-sm p-5 border border-white/10 dark:border-gray-700/10 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 mb-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <Sparkles className="h-10 w-10 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                      No projects yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                      Get started by creating your first project.
                    </p>
                    <button
                      className="px-5 py-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl flex items-center shadow-lg hover:shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300"
                      onClick={handleCreateProject}
                    >
                      <FolderPlus size={20} className="mr-2" />
                      Create First Project
                    </button>
                  </div>
                ) : (
                  // Actual projects
                  projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => openProject(project.id)}
                      className="relative bg-white/20 dark:bg-gray-800/20 backdrop-blur-xl rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-white/10 dark:border-gray-700/10 overflow-hidden cursor-pointer group"
                    >
                      {/* Top gradient bar */}
                      <div
                        className={`h-20 bg-gradient-to-r ${project.color} relative flex items-center px-6`}
                      >
                        {/* Project name */}
                        <h2 className="text-xl font-semibold text-white drop-shadow-sm">
                          {project.customTitle ||
                            project.name ||
                            "Untitled Project"}
                        </h2>

                        {/* Project options dropdown */}
                        <div
                          className="absolute top-3 right-3 project-menu"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="p-1.5 bg-white/20 backdrop-blur-xl rounded-lg shadow-sm hover:bg-white/30 transition-all duration-300 border border-white/10"
                            onClick={(e) => toggleProjectMenu(project.id, e)}
                          >
                            <MoreVertical className="h-4 w-4 text-white" />
                          </button>

                          {/* Dropdown menu */}
                          {activeProjectMenu === project.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 backdrop-blur-xl shadow-lg rounded-lg py-1 z-50 border border-gray-200 dark:border-gray-700 project-menu">
                              <button
                                className="w-full flex items-center px-4 py-2 text-sm text-gray-800 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditModal(project);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2 text-indigo-500" />
                                Edit Project
                              </button>
                              <button
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteConfirmation(project);
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-5 relative">
                        {/* Title and details */}

                        <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-6 h-10">
                          {project.description || "No description available"}
                        </p>

                        {/* Project meta */}
                        <div className="mt-6">
                          {/* Main metrics in side-by-side layout */}
                          <div className="flex space-x-4">
                            {/* Due Date indicator */}
                            <div className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg border-l-4 border-indigo-500 shadow-sm">
                              <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-indigo-500 mr-2" />
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                  Due: {project.dueDate || "No date"}
                                </span>
                              </div>
                            </div>

                            {/* Tasks count indicator */}
                            <div className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 rounded-lg border-l-4 border-amber-500 shadow-sm">
                              <div className="flex items-center">
                                <FileText className="h-5 w-5 text-amber-500 mr-2" />
                                <span className="text-sm font-medium text-amber-600 dark:text-amber-300">
                                  {project.tasks?.completed || 0}/
                                  {project.tasks?.total || 0} tasks
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1.5">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progress
                              </span>
                              <span className="text-sm font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                                {project.progress || 0}% Complete
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full bg-gradient-to-r ${project.color} shadow-inner transition-all duration-500 ease-in-out`}
                                style={{ width: `${project.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-white/10 dark:border-gray-700/10">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Edit Project
            </h3>
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Project Title
                </label>
                <input
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                  value={
                    editingProject?.customTitle || editingProject?.name || ""
                  }
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  Title can be changed from the board view
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                  rows="3"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                ></textarea>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
                  value={projectDueDate}
                  onChange={(e) => setProjectDueDate(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 border border-white/10 dark:border-gray-700/10">
            <div className="mb-5 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white text-center">
              Delete Project
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Are you sure you want to delete "
              {projectToDelete?.customTitle || projectToDelete?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setIsConfirmDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={handleDeleteProject}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
