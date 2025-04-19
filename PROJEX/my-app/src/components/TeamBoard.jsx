import React, { useState, useEffect } from "react";
import { Menu, X, Edit2, Check, Users, Plus, PlusCircle } from "lucide-react";
import { Trash2 } from "lucide-react";
import { db } from "../firebase/firebaseConfig"; // Ensure Firebase is initialized
import {
  doc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

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

const TeamBoard = ({
  userId = "E08NoFqaVzdKousTl3G8MiioMHg2",
  projectId = "sikqpiiReM9Bz9yp3XCV",
}) => {
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
  const [isLoading, setIsLoading] = useState(true);

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

  const [roles, setRoles] = useState([]);

  // Get Firestore base path
  const getTeamPath = () => `users/${userId}/projects/${projectId}/team`;

  // Load all departments on component mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setIsLoading(true);
        const teamsCollectionRef = collection(db, getTeamPath());
        const teamsSnapshot = await getDocs(teamsCollectionRef);

        const departmentsData = [];
        teamsSnapshot.forEach((doc) => {
          const data = doc.data();

          // Make sure color has the proper format
          let color =
            data.color ||
            "bg-gradient-to-br from-blue-500 to-cyan-600 backdrop-blur-lg bg-opacity-80";

          // If color doesn't have the proper prefix, add it
          if (!color.startsWith("bg-gradient-to-br")) {
            color = `bg-gradient-to-br ${color} backdrop-blur-lg bg-opacity-80`;
          }

          departmentsData.push({
            id: doc.id,
            title: data.title || "Unnamed Department",
            color: color,
            members: data.members || [],
          });
        });

        setRoles(departmentsData);
        console.log("Loaded departments:", departmentsData);
      } catch (error) {
        console.error("Error loading departments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDepartments();
  }, [userId, projectId]);

  const handleUpdateMember = async () => {
    if (!editingMember) return;

    try {
      const departmentId = editingMember.departmentId;
      const departmentRef = doc(db, `${getTeamPath()}/${departmentId}`);

      // Get the current department data
      const departmentSnapshot = await getDoc(departmentRef);
      if (!departmentSnapshot.exists()) {
        console.error("Department not found:", departmentId);
        return;
      }

      const departmentData = departmentSnapshot.data();
      const members = departmentData.members || [];

      // Find and update the member in the array
      const updatedMembers = members.map((member) =>
        member.id === editingMember.id
          ? {
              id: editingMember.id,
              name: editingMember.name,
              role: editingMember.role,
              status: editingMember.status,
            }
          : member
      );

      // Update Firestore
      await updateDoc(departmentRef, {
        members: updatedMembers,
      });

      // Update local state
      setRoles((prevRoles) =>
        prevRoles.map((role) => {
          if (role.id === departmentId) {
            return {
              ...role,
              members: updatedMembers,
            };
          }
          return role;
        })
      );

      // Clear editing state
      setEditingMember(null);
    } catch (error) {
      console.error("Error updating member:", error);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;

    try {
      const departmentRef = doc(db, `${getTeamPath()}/${editingDepartment.id}`);

      // Extract just the color part without the prefixes
      let colorValue = editingDepartment.color;
      if (colorValue.includes("bg-gradient-to-br")) {
        colorValue = colorValue
          .replace("bg-gradient-to-br ", "")
          .replace(" backdrop-blur-lg bg-opacity-80", "");
      }

      // Update Firestore with just the color value
      await updateDoc(departmentRef, {
        title: editingDepartment.title,
        color: colorValue,
      });

      // For local state, use the full class string
      const fullColor = `bg-gradient-to-br ${colorValue} backdrop-blur-lg bg-opacity-80`;

      // Update local state
      setRoles((prevRoles) =>
        prevRoles.map((role) =>
          role.id === editingDepartment.id
            ? {
                ...editingDepartment,
                color: fullColor,
              }
            : role
        )
      );

      // Clear editing state
      setEditingDepartment(null);
    } catch (error) {
      console.error("Error updating department:", error);
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      // Find the department containing this member
      const department = roles.find((role) =>
        role.members.some((member) => member.id === memberId)
      );

      if (!department) {
        console.error("Department for member not found:", memberId);
        return;
      }

      const departmentRef = doc(db, `${getTeamPath()}/${department.id}`);

      // Get member to remove
      const memberToRemove = department.members.find((m) => m.id === memberId);
      if (!memberToRemove) return;

      // Remove from Firestore
      await updateDoc(departmentRef, {
        members: arrayRemove(memberToRemove),
      });

      // Update local state
      setRoles((prevRoles) =>
        prevRoles.map((role) => {
          if (role.id === department.id) {
            return {
              ...role,
              members: role.members.filter((member) => member.id !== memberId),
            };
          }
          return role;
        })
      );
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      // Delete from Firestore
      const departmentRef = doc(db, `${getTeamPath()}/${departmentId}`);
      await deleteDoc(departmentRef);

      // Update local state
      setRoles((prevRoles) =>
        prevRoles.filter((role) => role.id !== departmentId)
      );
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.title.trim()) return;

    try {
      const newId = newDepartment.title.toLowerCase().replace(/\s+/g, "-");
      const newDeptRef = doc(db, `${getTeamPath()}/${newId}`);

      // Use consistent color format
      const colorValue = newDepartment.color;
      const fullColorClass = `bg-gradient-to-br ${colorValue} backdrop-blur-lg bg-opacity-80`;

      const newDept = {
        id: newId,
        title: newDepartment.title,
        color: fullColorClass,
        members: [], // Empty initially
      };

      // Save to Firestore with consistent format
      await setDoc(newDeptRef, {
        title: newDepartment.title,
        color: colorValue, // Store just the color part without prefixes for consistency
        members: [],
      });

      // Update local state
      setRoles([...roles, newDept]);
      setNewDepartment({ title: "", color: "from-blue-500 to-cyan-600" });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding department:", error);
    }
  };
  const handleAddMember = async () => {
    if (
      !newMember.departmentId.trim() ||
      !newMember.name.trim() ||
      !newMember.role.trim()
    ) {
      alert("Please provide valid details");
      return;
    }

    try {
      const newMemberObj = {
        id: Date.now(),
        name: newMember.name,
        role: newMember.role,
        status: newMember.status || "active",
      };

      const departmentRef = doc(
        db,
        `${getTeamPath()}/${newMember.departmentId}`
      );

      // Update Firestore
      await updateDoc(departmentRef, {
        members: arrayUnion(newMemberObj),
      });

      // Update local state
      setRoles((prevRoles) =>
        prevRoles.map((dept) => {
          if (dept.id === newMember.departmentId) {
            return {
              ...dept,
              members: [...dept.members, newMemberObj],
            };
          }
          return dept;
        })
      );

      // Reset form state
      setNewMember({
        name: "",
        role: "",
        departmentId: "",
        status: "active",
      });
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleDragStart = (member, sourceRoleId) => {
    setDraggedMember({ member, sourceRoleId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetRoleId) => {
    if (!draggedMember) return;
    const { member, sourceRoleId } = draggedMember;

    if (sourceRoleId === targetRoleId) {
      setDraggedMember(null);
      return;
    }

    try {
      // Source and target department references
      const sourceDeptRef = doc(db, `${getTeamPath()}/${sourceRoleId}`);
      const targetDeptRef = doc(db, `${getTeamPath()}/${targetRoleId}`);

      // 1. Remove member from source department
      await updateDoc(sourceDeptRef, {
        members: arrayRemove(member),
      });

      // 2. Add member to target department
      await updateDoc(targetDeptRef, {
        members: arrayUnion(member),
      });

      // Update local state
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
    } catch (error) {
      console.error("Error moving member between departments:", error);
    } finally {
      setDraggedMember(null);
    }
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

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`
     w-full h-[560px] overflow-auto 
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
            <div className="space-y-2">
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
                  className="w-full px-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      {role.members?.length || 0} member
                      {(role.members?.length || 0) !== 1 ? "s" : ""}
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
                    {role.members &&
                      role.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between bg-white bg-opacity-50 backdrop-blur-sm p-3 rounded-lg cursor-move hover:bg-opacity-70 transition-colors"
                          draggable
                          onDragStart={() => handleDragStart(member, role.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-semibold">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div
                                className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                                  member.status
                                )}`}
                              ></div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">
                                {member.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingMember({
                                  ...member,
                                  departmentId: role.id,
                                });
                              }}
                              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmation({
                                  type: "member",
                                  id: member.id,
                                });
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    {role.members.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        No members in this department
                      </div>
                    )}
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
