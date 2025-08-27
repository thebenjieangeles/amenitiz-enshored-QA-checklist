// Mock users for demo purposes
const mockUsers = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "user", password: "user123", role: "user" },
];

const messageBox = document.getElementById("message");

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.style.display = "block";
}

// Handle login
document.getElementById("login").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showMessage("⚠️ Please enter both username and password.", "error");
    return;
  }

  const user = mockUsers.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    localStorage.setItem("loggedInUser", JSON.stringify(user));
    showMessage(`✅ Welcome, ${user.username}! Redirecting...`, "success");

    // Redirect after 1s
    setTimeout(() => {
      window.location.href = "../checklist/checklist.html";
    }, 1000);
  } else {
    showMessage("❌ Invalid username or password.", "error");
  }
});

// Handle signup
document.getElementById("signup").addEventListener("click", () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    showMessage(
      "⚠️ Please enter both username and password to sign up.",
      "error"
    );
    return;
  }

  const exists = mockUsers.some((u) => u.username === username);
  if (exists) {
    showMessage("⚠️ Username already exists. Please choose another.", "error");
    return;
  }

  mockUsers.push({ username, password, role: "user" });
  showMessage(
    `🎉 Account created for ${username}. You can now log in.`,
    "success"
  );
});
