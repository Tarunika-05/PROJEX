import React, { useState } from 'react';
import {
  Bell, Search, Sun, Moon, Menu, X, LayoutDashboard,
  FolderOpen, Users, Calendar, Settings, ChevronRight,
  MoreVertical, TrendingUp, Clock, CheckCircle2,
  ArrowUpRight, Users2, Target, Sparkles,FileText,Bot,FolderPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Navigation items
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true , to: "/KanbanBoard" },
    { icon: FolderOpen, label: "Projects", active: false, to: "/KanbanBoard" },
    { icon: FolderPlus, label: "Add Project", active: false , to: "/KanbanBoard"},
    //{ icon: FileText, label: "Reports", active: false , to: "/KanbanBoard"},
   // { icon: Bot, label: "Chatbot", active: false },
    
  ];
/*{ icon: Users, label: "Team", active: false },
    { icon: Calendar, label: "Calendar", active: false },
    { icon: Settings, label: "Settings", active: false },*/
  // Project data
  const projects = [
    {
      id: 1,
      name: "Mobile App Redesign",
      description: "Redesigning the mobile app UI/UX for better user engagement",
      progress: 75,
      dueDate: "Mar 15",
      tasks: { completed: 45, total: 60 },
      members: 5,
      priority: "High",
      color: "bg-violet-100 dark:bg-violet-900/30",
    },
    {
      id: 2,
      name: "Website Development",
      description: "Building a new company website with modern technologies",
      progress: 60,
      dueDate: "Mar 28",
      tasks: { completed: 30, total: 50 },
      members: 4,
      priority: "Medium",
      color: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      id: 3,
      name: "Marketing Campaign",
      description: "Q1 digital marketing campaign for product launch",
      progress: 85,
      dueDate: "Mar 20",
      tasks: { completed: 28, total: 32 },
      members: 6,
      priority: "High",
      color: "bg-pink-100 dark:bg-pink-900/30",
    }
  ];

  // Statistics data
  const stats = [
    {
      icon: Target,
      label: "Total Projects",
      value: "24",
      trend: "+12.5%",
      color: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
    },
    {
      icon: Users2,
      label: "Team Members",
      value: "32",
      trend: "+8.1%",
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
    },
    {
      icon: CheckCircle2,
      label: "Completed Tasks",
      value: "145",
      trend: "+16.2%",
      color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
    },
    {
      icon: Sparkles,
      label: "Active Sprints",
      value: "8",
      trend: "+4.6%",
      color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400"
    }
  ];

  return (
    <div className={`h-screen w-full overflow-hidden ${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-full w-full bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static lg:block h-full w-72 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl transform transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } shadow-lg z-50 border-r border-gray-200 dark:border-gray-700/50`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-900 via-indigo-700 to-blue-500 rounded-xl shadow-lg shadow-violet-500/20"></div>
                  <h1 className="ml-3 text-2xl font-bold bg-gradient-to-br from-blue-900 via-indigo-700 to-blue-500 bg-clip-text text-transparent">Projex</h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden hover:bg-gray-100 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.to} 
                    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 ${
                      item.active
                        ? 'bg-gradient-to-br  from-blue-900 via-indigo-700 to-blue-500 text-white shadow-lg shadow-violet-500/20 dark:shadow-violet-900/30'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${item.active ? 'animate-pulse' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                    {item.active && <ChevronRight className="h-4 w-4 ml-auto" />}
                  </Link>
                ))}
              </nav>
            </div>
            {/* Sidebar Footer */}
            <div className="mt-auto p-6 border-t border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center group cursor-pointer">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br  from-blue-900 via-indigo-700 to-blue-500 flex items-center justify-center text-white font-medium shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-shadow">
                  JM
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Jayaram</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Product Designer</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700/50 sticky top-0 z-40">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="relative group min-w-0 flex-1">
                  <Search className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 group-hover:text-violet-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="pl-10 pr-4 py-2.5 w-48 lg:w-64 xl:w-80 rounded-xl bg-gray-100 dark:bg-gray-700/50 border-0 focus:ring-2 focus:ring-violet-500 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="relative p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl group transition-colors">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-violet-500" />
                  <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-violet-500 rounded-full ring-2 ring-white dark:ring-gray-800 animate-pulse"></span>
                </button>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-xl group transition-colors"
                >
                  {isDarkMode ?
                    <Sun className="h-5 w-5 text-gray-400 group-hover:text-yellow-500" /> :
                    <Moon className="h-5 w-5 text-gray-600 group-hover:text-violet-500" />
                  }
                </button>
              </div>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="h-[calc(100vh-4rem)] overflow-y-auto overflow-x-hidden">
            <div className="mx-auto p-6 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome back, Jayaram 👋</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Here's what's happening with your projects today.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 min-w-0">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-200/50 dark:border-gray-700/50 group"
                  >
                    <div className="flex items-center justify-between mb-4 min-w-0">
                      <div className={`p-3 rounded-xl ${stat.color} transition-colors group-hover:scale-110 duration-300`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center text-green-500 dark:text-green-400 text-sm font-medium">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {stat.trend}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors">{stat.value}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-2 gap-6 min-w-0">
                {projects.map(project => (
                  <div
                    key={project.id}
                    className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group p-6 border border-gray-200/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-start justify-between mb-4 min-w-0">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors truncate">
                          {project.name}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 truncate">
                          {project.description}
                        </p>
                      </div>
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                        <MoreVertical className="h-5 w-5 text-gray-400 group-hover:text-violet-500" />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Progress</span>
                        <span className="font-medium text-violet-600 dark:text-violet-400">{project.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-full transition-all duration-500 group-hover:scale-x-105 origin-left"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 group-hover:bg-gray-100 dark:group-hover:bg-gray-600/50 transition-colors">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                          <Clock className="h-4 w-4 mr-1.5" />
                          Due Date
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {project.dueDate}
                        </div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 group-hover:bg-gray-100 dark:group-hover:bg-gray-600/50 transition-colors">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-1.5">
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Tasks
                        </div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">
                          {project.tasks.completed}/{project.tasks.total}
                        </div>
                      </div>
                    </div>

                    {/* Project Footer */}
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex -space-x-2">
                        {[...Array(project.members)].map((_, i) => (
                          <div
                            key={i}
                            className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800 transform hover:scale-110 transition-transform"
                          >
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                        <button className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700/50 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs font-medium ring-2 ring-white dark:ring-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600/50 transition-colors">
                          +{project.members - 3}
                        </button>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.priority === 'High'
                          ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      } flex items-center gap-1`}>
                        <ArrowUpRight className="h-3 w-3" />
                        {project.priority}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity Section */}
              <div className="mt-8">
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-sm p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Activity</h2>
                  <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 flex items-center justify-center text-white font-medium shadow-lg shadow-violet-500/20">
                          {String.fromCharCode(65 + i)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between min-w-0">
                            <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                              {['New task added', 'Project milestone completed', 'Team meeting scheduled'][i]}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">2h ago</span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {['Added new task "Update dashboard UI" to Mobile App Redesign',
                              'Completed milestone "Frontend Development" in Website Development',
                              'Scheduled team meeting for Marketing Campaign review'][i]}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ['bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
                               'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                               'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'][i]
                            }`}>
                              {['In Progress', 'Completed', 'Upcoming'][i]}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;