// Firebase
import { auth, db } from "../firebase/firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

let currentUser = null;

// Redirect if not logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login/login.html";
  } else {
    currentUser = user;
    document.getElementById("user-email").textContent = user.email;

    // Load this user's checklist from Firestore
    await loadChecklist();
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

// ✅ Load checklist from Firestore
async function loadChecklist() {
  const checkboxes = document.querySelectorAll(".checklist input");
  const checklistRef = doc(db, "checklists", currentUser.uid);

  try {
    const docSnap = await getDoc(checklistRef);
    let savedData = {};

    if (docSnap.exists()) {
      savedData = docSnap.data();
    }

    // Apply saved state to checkboxes
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = savedData[`box-${index}`] || false;

      checkbox.addEventListener("change", async () => {
        await updateDoc(checklistRef, {
          [`box-${index}`]: checkbox.checked,
        }).catch(async () => {
          // If doc doesn't exist yet, create it
          await setDoc(checklistRef, { [`box-${index}`]: checkbox.checked });
        });
      });
    });

    // Reset button → clears Firestore
    document.getElementById("reset").addEventListener("click", async () => {
      checkboxes.forEach((checkbox) => (checkbox.checked = false));
      await setDoc(checklistRef, {}); // reset Firestore document
    });
  } catch (error) {
    console.error("❌ Error loading checklist:", error);
  }
}
