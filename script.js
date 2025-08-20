// document.addEventListener("DOMContentLoaded", () => {
//   const checkboxes = document.querySelectorAll(".checklist input");

//   checkboxes.forEach((checkbox, index) => {
//     checkbox.checked = localStorage.getItem(`checkbox-${index}`) === "true";

//     checkbox.addEventListener("change", () => {
//       localStorage.setItem(`checkbox-${index}`, checkbox.checked);
//     });
//   });

//   document.getElementById("reset").addEventListener("click", () => {
//     checkboxes.forEach((checkbox, index) => {
//       checkbox.checked = false;
//       localStorage.setItem(`checkbox-${index}`, false);
//     });
//   });
// });

document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".checklist input");

  checkboxes.forEach((checkbox, index) => {
    // Skip the prank item
    if (checkbox.id === "prank-item") {
      checkbox.checked = true;
      checkbox.addEventListener("change", () => {
        checkbox.checked = true; // force always checked
      });
      return; // don't store in localStorage
    }

    // Normal checkboxes → load from localStorage
    checkbox.checked = localStorage.getItem(`checkbox-${index}`) === "true";

    // Save state when changed
    checkbox.addEventListener("change", () => {
      localStorage.setItem(`checkbox-${index}`, checkbox.checked);
    });
  });

  // Reset button
  document.getElementById("reset").addEventListener("click", () => {
    checkboxes.forEach((checkbox, index) => {
      if (checkbox.id === "prank-item") {
        checkbox.checked = true; // stays checked
        return;
      }
      checkbox.checked = false;
      localStorage.setItem(`checkbox-${index}`, false);
    });
  });
});
