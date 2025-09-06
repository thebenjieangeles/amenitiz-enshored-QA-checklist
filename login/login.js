// Import Firebase
import { auth } from "../firebase/firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const messageBox = document.getElementById("message");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.style.display = "block";
}

// ✅ Check if already logged in (auto redirect)
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "../checklist/checklist.html";
  }
});

// Handle login
document.getElementById("login").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showMessage("⚠️ Please enter both email and password.", "error");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showMessage(`✅ Welcome, ${user.email}! Redirecting...`, "success");

      setTimeout(() => {
        window.location.href = "../checklist/checklist.html";
      }, 1000);
    })
    .catch((error) => {
      showMessage(formatError(error.code), "error");
    });
});

// Handle signup
document.getElementById("signup").addEventListener("click", () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    showMessage("⚠️ Please enter both email and password to sign up.", "error");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      showMessage(
        `🎉 Account created for ${user.email}. Redirecting...`,
        "success"
      );

      // ✅ Auto-redirect after signup
      setTimeout(() => {
        window.location.href = "../checklist/checklist.html";
      }, 1000);
    })
    .catch((error) => {
      showMessage(formatError(error.code), "error");
    });
});

// ✅ Friendlier error messages
function formatError(code) {
  switch (code) {
    case "auth/invalid-email":
      return "❌ Invalid email format.";
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "❌ Incorrect email or password.";
    case "auth/email-already-in-use":
      return "⚠️ This email is already registered.";
    case "auth/weak-password":
      return "⚠️ Password should be at least 6 characters.";
    default:
      return "⚠️ Something went wrong. Please try again.";
  }
}
