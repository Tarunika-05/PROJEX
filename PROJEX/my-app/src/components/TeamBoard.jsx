import React, { useState } from "react";
import { Menu, X, Edit2, Check, Users, Plus, PlusCircle } from "lucide-react";
import { Trash2 } from "lucide-react";

const IconMoon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const TeamBoard = () => {
  const [boardTitle, setBoardTitle] = useState("Team Overview");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(boardTitle);
  const [draggedMember, setDraggedMember] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    type: null,
    id: null,
  });

  const handleUpdateMember = () => {
    if (!editingMember) return;

    setRoles(
      roles.map((role) => ({
        ...role,
        members: role.members.map((member) =>
          member.id === editingMember.id ? editingMember : member
        ),
      }))
    );

    setEditingMember(null);
  };

  const handleUpdateDepartment = () => {
    if (!editingDepartment) return;

    setRoles(
      roles.map((role) =>
        role.id === editingDepartment.id ? editingDepartment : role
      )
    );

    setEditingDepartment(null);
  };

  const handleDeleteMember = (memberId) => {
    setRoles(
      roles.map((role) => ({
        ...role,
        members: role.members.filter((member) => member.id !== memberId),
      }))
    );
  };

  const handleDeleteDepartment = (departmentId) => {
    setRoles(roles.filter((role) => role.id !== departmentId));
  };

  const [newDepartment, setNewDepartment] = useState({
    title: "",
    color: "from-blue-500 to-cyan-600",
  });

  const [newMember, setNewMember] = useState({
    name: "",
    role: "",
    departmentId: "",
    status: "active",
  });

  const [roles, setRoles] = useState([
    {
      id: "leadership",
      title: "Leadership",
      color:
        "bg-gradient-to-br from-purple-500 to-indigo-600 backdrop-blur-lg bg-opacity-80",
      members: [
        {
          id: 1,
          name: "Sarah Johnson",
          role: "Project Manager",
          status: "active",
        },
        {
          id: 2,
          name: "Mike Chen",
          role: "Tech Lead",
          status: "active",
        },
      ],
    },
    {
      id: "engineering",
      title: "Engineering",
      color:
        "bg-gradient-to-br from-blue-500 to-cyan-600 backdrop-blur-lg bg-opacity-80",
      members: [
        {
          id: 3,
          name: "Alex Kumar",
          role: "Senior Developer",
          status: "busy",
        },
        {
          id: 4,
          name: "Rachel Lee",
          role: "Frontend Developer",
          status: "active",
        },
      ],
    },
    {
      id: "design",
      title: "Design",
      color:
        "bg-gradient-to-br from-pink-500 to-rose-600 backdrop-blur-lg bg-opacity-80",
      members: [
        {
          id: 5,
          name: "David Park",
          role: "UI Designer",
          status: "offline",
        },
      ],
    },
  ]);

  const handleAddDepartment = () => {
    const newId = newDepartment.title.toLowerCase().replace(/\s+/g, "-");
    const newDept = {
      id: newId,
      title: newDepartment.title,
      color: `bg-gradient-to-br ${newDepartment.color} backdrop-blur-lg bg-opacity-80`,
      members: [],
    };

    setRoles([...roles, newDept]);
    setNewDepartment({ title: "", color: "from-blue-500 to-cyan-600" });
    setShowAddModal(false);
  };

  const handleAddMember = () => {
    const newMemberObj = {
      id: Date.now(),
      name: newMember.name,
      role: newMember.role,
      status: newMember.status,
    };

    setRoles(
      roles.map((role) => {
        if (role.id === newMember.departmentId) {
          return {
            ...role,
            members: [...role.members, newMemberObj],
          };
        }
        return role;
      })
    );

    setNewMember({
      name: "",
      role: "",
      departmentId: "",
      status: "active",
    });
    setShowAddModal(false);
  };

  const handleDragStart = (member, sourceRoleId) => {
    setDraggedMember({ member, sourceRoleId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetRoleId) => {
    if (!draggedMember) return;
    const { member, sourceRoleId } = draggedMember;

    if (sourceRoleId === targetRoleId) {
      setDraggedMember(null);
      return;
    }

    setRoles((prevRoles) => {
      const newRoles = prevRoles.map((role) => {
        if (role.id === sourceRoleId) {
          return {
            ...role,
            members: role.members.filter((m) => m.id !== member.id),
          };
        }
        if (role.id === targetRoleId) {
          return {
            ...role,
            members: [...role.members, member],
          };
        }
        return role;
      });
      return newRoles;
    });

    setDraggedMember(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const handleTitleSave = () => {
    setBoardTitle(editedTitle);
    setIsEditingTitle(false);
  };

  return (
    <div
      className={`
    h-full w-full 
    ${"bg-white/60 border-white/50"} 
    backdrop-blur-lg rounded-2xl p-8 shadow-lg border
  `}
    >
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {/* Added Team Heading Here */}
              <h1 className="text-3xl font-bold text-gray-800 flex items-center mt-46">
                <Users size={40} className="mr-2 text-indigo-600" />
                Team
              </h1>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setModalType("member");
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg flex items-center shadow-lg hover:from-indigo-600 hover:to-indigo-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Add Member
                </button>
                <button
                  onClick={() => {
                    setModalType("department");
                    setShowAddModal(true);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg flex items-center shadow-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
                >
                  <PlusCircle size={20} className="mr-2" />
                  Add Department
                </button>
              </div>
            </div>
          </div>

          {/* Add Department Modal */}
          <Modal
            isOpen={showAddModal && modalType === "department"}
            onClose={() => setShowAddModal(false)}
            title="Add New Department"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={newDepartment.title}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Theme
                </label>
                <select
                  value={newDepartment.color}
                  onChange={(e) =>
                    setNewDepartment({
                      ...newDepartment,
                      color: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="from-blue-500 to-cyan-600">Blue</option>
                  <option value="from-purple-500 to-indigo-600">Purple</option>
                  <option value="from-pink-500 to-rose-600">Pink</option>
                  <option value="from-green-500 to-emerald-600">Green</option>
                  <option value="from-orange-500 to-red-600">Orange</option>
                </select>
              </div>
              <button
                onClick={handleAddDepartment}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Department
              </button>
            </div>
          </Modal>

          {/* Add Member Modal */}
          <Modal
            isOpen={showAddModal && modalType === "member"}
            onClose={() => setShowAddModal(false)}
            title="Add New Member"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) =>
                    setNewMember({ ...newMember, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={newMember.role}
                  onChange={(e) =>
                    setNewMember({ ...newMember, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  value={newMember.departmentId}
                  onChange={(e) =>
                    setNewMember({
                      ...newMember,
                      departmentId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newMember.status}
                  onChange={(e) =>
                    setNewMember({ ...newMember, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <button
                onClick={handleAddMember}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Member
              </button>
            </div>
          </Modal>

          {/* Edit Member Modal */}
          <Modal
            isOpen={editingMember !== null}
            onClose={() => setEditingMember(null)}
            title="Edit Team Member"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingMember?.name || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter member name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <input
                  type="text"
                  value={editingMember?.role || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      role: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter role"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editingMember?.status || ""}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      status: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateMember}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingMember(null)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>

          {/* Edit Department Modal */}
          <Modal
            isOpen={editingDepartment !== null}
            onClose={() => setEditingDepartment(null)}
            title="Edit Department"
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={editingDepartment?.title || ""}
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Theme
                </label>
                <select
                  value={
                    editingDepartment?.color
                      ?.replace("bg-gradient-to-br ", "")
                      .replace(" backdrop-blur-lg bg-opacity-80", "") || ""
                  }
                  onChange={(e) =>
                    setEditingDepartment({
                      ...editingDepartment,
                      color: `bg-gradient-to-br ${e.target.value} backdrop-blur-lg bg-opacity-80`,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="from-blue-500 to-cyan-600">Blue</option>
                  <option value="from-purple-500 to-indigo-600">Purple</option>
                  <option value="from-pink-500 to-rose-600">Pink</option>
                  <option value="from-green-500 to-emerald-600">Green</option>
                  <option value="from-orange-500 to-red-600">Orange</option>
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleUpdateDepartment}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingDepartment(null)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={deleteConfirmation.type !== null}
            onClose={() => setDeleteConfirmation({ type: null, id: null })}
            title={`Delete ${
              deleteConfirmation.type === "member"
                ? "Team Member"
                : "Department"
            }`}
          >
            <div className="space-y-4">
              <p className="text-gray-600">
                Are you sure you want to delete this {deleteConfirmation.type}?
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (deleteConfirmation.type === "member") {
                      handleDeleteMember(deleteConfirmation.id);
                    } else {
                      handleDeleteDepartment(deleteConfirmation.id);
                    }
                    setDeleteConfirmation({ type: null, id: null });
                  }}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
                <button
                  onClick={() =>
                    setDeleteConfirmation({ type: null, id: null })
                  }
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>

          {/* Team Board Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.id}
                className="bg-white bg-opacity-60 backdrop-blur-lg rounded-xl shadow-lg overflow-hidden border border-white border-opacity-20"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(role.id)}
              >
                <div
                  className={`${role.color} p-4 flex justify-between items-center`}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {role.title}
                    </h3>
                    <p className="text-white text-opacity-80 text-sm">
                      {role.members.length} member
                      {role.members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingDepartment(role)}
                      className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-lg bg-transparent"
                      style={{ border: "none", outline: "none" }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirmation({
                          type: "department",
                          id: role.id,
                        })
                      }
                      className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-lg bg-transparent "
                      style={{ border: "none", outline: "none" }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {role.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between bg-white bg-opacity-50 backdrop-blur-sm p-3 rounded-lg cursor-move hover:bg-opacity-70 transition-colors"
                        draggable
                        onDragStart={() => handleDragStart(member, role.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-sm">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {member.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {member.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${getStatusColor(
                              member.status
                            )}`}
                          />
                          <button
                            onClick={() =>
                              setEditingMember({
                                ...member,
                                departmentId: role.id,
                              })
                            }
                            className="p-1 text-gray-500 hover:text-gray-700 rounded"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setDeleteConfirmation({
                                type: "member",
                                id: member.id,
                              })
                            }
                            className="p-1 text-gray-500 hover:text-gray-700 rounded"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamBoard;
