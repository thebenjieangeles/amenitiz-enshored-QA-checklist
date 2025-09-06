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
    let savedData = docSnap.exists() ? docSnap.data() : {};

    console.log("📥 Loaded checklist:", savedData);

    // Apply saved state
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = !!savedData[`box-${index}`];

      checkbox.addEventListener("change", async () => {
        console.log(
          `💾 Saving box-${index}: ${checkbox.checked} for user ${currentUser.uid}`
        );
        try {
          await setDoc(
            checklistRef,
            { [`box-${index}`]: checkbox.checked },
            { merge: true } // ✅ ensures we don't overwrite other boxes
          );
        } catch (err) {
          console.error("❌ Error saving checkbox:", err);
        }
      });
    });

    // Reset button → clears Firestore and UI
    document.getElementById("reset").addEventListener("click", async () => {
      checkboxes.forEach((c) => (c.checked = false));
      try {
        await setDoc(checklistRef, {}); // overwrite with empty object
        console.log("🧹 Checklist reset for user:", currentUser.uid);
      } catch (err) {
        console.error("❌ Error resetting checklist:", err);
      }
    });
  } catch (error) {
    console.error("❌ Error loading checklist:", error);
  }
}
