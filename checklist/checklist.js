// Firebase
import { auth } from "../firebase/firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

let currentUserKey = null; // 🔑 prefix for localStorage keys

// Redirect if not logged in
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../login/login.html"; // go back to login
  } else {
    document.getElementById("user-email").textContent = user.email;

    // Use UID (or email) as unique storage key prefix
    currentUserKey = `checklist-${user.uid}`;
    loadChecklist();
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

// ✅ Load checklist per user
function loadChecklist() {
  const checkboxes = document.querySelectorAll(".checklist input");

  checkboxes.forEach((checkbox, index) => {
    checkbox.checked =
      localStorage.getItem(`${currentUserKey}-box-${index}`) === "true";

    checkbox.addEventListener("change", () => {
      localStorage.setItem(`${currentUserKey}-box-${index}`, checkbox.checked);
    });
  });

  document.getElementById("reset").addEventListener("click", () => {
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = false;
      localStorage.setItem(`${currentUserKey}-box-${index}`, false);
    });
  });
}
