// Firebase
import { auth, db, storage } from "../firebase/firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject, // ✅ added for deleting files
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

let currentUser = null;
let currentProjectId = null; // track which project is being edited

// Redirect if not logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login/login.html";
  } else {
    currentUser = user;
    document.getElementById("user-email").textContent = user.email;

    // Load all projects
    await loadProjectsList();
  }
});

// Logout
document.getElementById("logout").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "../login/login.html";
    })
    .catch((error) => {
      alert("❌ Logout error: " + error.message);
    });
});

// =============== LOAD PROJECTS LIST ==================
async function loadProjectsList() {
  const projectList = document.getElementById("projects-list");
  projectList.innerHTML = "";

  const projectsRef = collection(db, "projects", currentUser.uid, "items");

  try {
    const querySnapshot = await getDocs(projectsRef);

    querySnapshot.forEach((docSnap) => {
      const project = docSnap.data();
      const li = document.createElement("li");
      li.textContent = project.hotelName || "(Unnamed Project)";
      li.addEventListener("click", () => loadProject(docSnap.id));
      projectList.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Error loading projects list:", err);
  }
}

// =============== LOAD SINGLE PROJECT ==================
async function loadProject(projectId) {
  currentProjectId = projectId;
  const projectRef = doc(db, "projects", currentUser.uid, "items", projectId);

  try {
    const docSnap = await getDoc(projectRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("📥 Loaded project:", data);

      // Fill form
      document.getElementById("hotel-name").value = data.hotelName || "";
      document.getElementById("hotel-website").value = data.webCreated || "";
      document.getElementById("website-duplicate").value =
        data.webDuplicated || "";
      document.getElementById("hubspot").value = data.hubspot || "";
      document.getElementById("ota").value = data.ota || "";
      document.getElementById("onboarder-notes").value =
        data.onboarderNotes || "";
      document.getElementById("evaluator-snippet").value =
        data.evaluatorSnippet || "";

      // Show files with delete button
      const fileList = document.getElementById("file-list");
      fileList.innerHTML = "";
      if (data.files && Array.isArray(data.files)) {
        data.files.forEach((file, index) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <a href="${file.url}" target="_blank">${file.name}</a>
            <button data-index="${index}" class="delete-file">❌</button>
          `;
          fileList.appendChild(li);
        });

        // Attach delete handlers
        fileList.querySelectorAll(".delete-file").forEach((btn) => {
          btn.addEventListener("click", async (e) => {
            const idx = e.target.dataset.index;
            if (confirm("Are you sure you want to delete this file?")) {
              await deleteFile(idx);
            }
          });
        });
      }

      // Load checklist for this project
      await loadChecklist();
    }
  } catch (err) {
    console.error("❌ Error loading project:", err);
  }
}

// =============== DELETE FILE ==================
async function deleteFile(index) {
  if (!currentProjectId) return;

  const projectRef = doc(
    db,
    "projects",
    currentUser.uid,
    "items",
    currentProjectId
  );

  try {
    const projectSnap = await getDoc(projectRef);
    if (!projectSnap.exists()) return;

    let files = projectSnap.data().files || [];
    const fileToDelete = files[index];
    if (!fileToDelete) return;

    // Delete from storage
    const fileRef = ref(
      storage,
      `uploads/${currentUser.uid}/${currentProjectId}/${fileToDelete.name}`
    );
    try {
      await deleteObject(fileRef);
      console.log("🗑️ File deleted from storage:", fileToDelete.name);
    } catch (storageErr) {
      console.warn("⚠️ Could not delete from storage:", storageErr);
    }

    // Remove from Firestore array
    files.splice(index, 1);
    await setDoc(projectRef, { files }, { merge: true });

    // Refresh UI
    await loadProject(currentProjectId);
  } catch (err) {
    console.error("❌ Error deleting file:", err);
  }
}

// =============== CREATE NEW PROJECT ==================
document.getElementById("new-project").addEventListener("click", async () => {
  const projectsRef = collection(db, "projects", currentUser.uid, "items");

  try {
    const newDocRef = await addDoc(projectsRef, {
      hotelName: "",
      createdAt: Date.now(),
    });
    currentProjectId = newDocRef.id;
    console.log("🆕 New project created:", currentProjectId);

    // Clear form
    document
      .querySelectorAll(".project-details input, .project-details textarea")
      .forEach((el) => {
        el.value = "";
      });

    // Reset checklist
    document
      .querySelectorAll(".checklist input")
      .forEach((c) => (c.checked = false));

    // Clear file list
    document.getElementById("file-list").innerHTML = "";

    await loadProjectsList();
  } catch (err) {
    console.error("❌ Error creating project:", err);
  }
});

// =============== SAVE PROJECT ==================
document.getElementById("save-project").addEventListener("click", async () => {
  if (!currentProjectId) {
    alert("⚠️ Please create or select a project first.");
    return;
  }

  const projectRef = doc(
    db,
    "projects",
    currentUser.uid,
    "items",
    currentProjectId
  );

  // Gather data
  const projectData = {
    hotelName: document.getElementById("hotel-name").value,
    webCreated: document.getElementById("hotel-website").value,
    webDuplicated: document.getElementById("website-duplicate").value,
    hubspot: document.getElementById("hubspot").value,
    ota: document.getElementById("ota").value,
    onboarderNotes: document.getElementById("onboarder-notes").value,
    evaluatorSnippet: document.getElementById("evaluator-snippet").value,
    updatedAt: Date.now(),
  };

  // Upload files if any
  const fileInput = document.getElementById("file-upload");
  let uploadedFiles = [];

  for (let file of fileInput.files) {
    const storageRef = ref(
      storage,
      `uploads/${currentUser.uid}/${currentProjectId}/${file.name}`
    );
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    uploadedFiles.push({ name: file.name, url });
  }

  try {
    // Get existing files
    const existingSnap = await getDoc(projectRef);
    let existingFiles = [];
    if (existingSnap.exists() && existingSnap.data().files) {
      existingFiles = existingSnap.data().files;
    }

    // Merge
    if (uploadedFiles.length > 0) {
      projectData.files = [...existingFiles, ...uploadedFiles];
    }

    await setDoc(projectRef, projectData, { merge: true });
    alert("✅ Project saved successfully!");

    // Refresh UI
    await loadProjectsList();
    await loadProject(currentProjectId);
  } catch (err) {
    console.error("❌ Error saving project:", err);
    alert("Error saving project.");
  }
});

// =============== CHECKLIST FUNCTIONS ==================
async function loadChecklist() {
  if (!currentProjectId) return;

  const checklistRef = doc(
    db,
    "projects",
    currentUser.uid,
    "items",
    currentProjectId,
    "meta",
    "checklist"
  );

  try {
    const docSnap = await getDoc(checklistRef);
    let savedData = docSnap.exists() ? docSnap.data() : {};

    console.log("📥 Loaded checklist:", savedData);

    const checkboxes = document.querySelectorAll(".checklist input");

    // Apply saved state
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = !!savedData[`box-${index}`];

      checkbox.onchange = async () => {
        try {
          await setDoc(
            checklistRef,
            { [`box-${index}`]: checkbox.checked },
            { merge: true }
          );
          console.log(`💾 Saved box-${index} for ${currentProjectId}`);
        } catch (err) {
          console.error("❌ Error saving checkbox:", err);
        }
      };
    });

    // Reset button
    document.getElementById("reset").onclick = async () => {
      checkboxes.forEach((c) => (c.checked = false));
      try {
        await setDoc(checklistRef, {}); // clear Firestore
        console.log("🧹 Checklist reset for project:", currentProjectId);
      } catch (err) {
        console.error("❌ Error resetting checklist:", err);
      }
    };
  } catch (error) {
    console.error("❌ Error loading checklist:", error);
  }
}
