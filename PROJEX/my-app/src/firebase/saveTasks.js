import { doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const saveTasks = async (projectId, editedTitle) => {
  if (!editedTitle.trim() || !projectId) return;

  try {
    // Reference to the TITLE document inside the project
    const titleRef = doc(db, "projects", projectId, "TITLE", "titleDoc");

    // Update Firestore without affecting tasks
    await updateDoc(titleRef, {
      title: editedTitle,
    });

    console.log(`✅ Title updated successfully for ${projectId}`);
  } catch (error) {
    console.error("❌ Error updating project title:", error);
  }
};

export default saveTasks;
