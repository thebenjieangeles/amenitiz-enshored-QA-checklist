// index.js

// Placeholder for now – later we’ll add:
// 1. Check if user is already logged in
// 2. Redirect them straight to checklist.html if logged in

document.addEventListener("DOMContentLoaded", () => {
  console.log("Index page loaded.");

  // Example: fake check if logged in (we'll connect this to Firebase later)
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn) {
    window.location.href = "checklist/checklist.html";
  }
});
