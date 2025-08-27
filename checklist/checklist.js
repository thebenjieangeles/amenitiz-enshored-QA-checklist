document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".checklist input");

  // Load saved state
  checkboxes.forEach((checkbox, index) => {
    checkbox.checked = localStorage.getItem(`checkbox-${index}`) === "true";

    checkbox.addEventListener("change", () => {
      localStorage.setItem(`checkbox-${index}`, checkbox.checked);
    });
  });

  // Reset button
  document.getElementById("reset").addEventListener("click", () => {
    checkboxes.forEach((checkbox, index) => {
      checkbox.checked = false;
      localStorage.setItem(`checkbox-${index}`, false);
    });
  });
});
