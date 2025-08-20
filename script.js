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
    if (checkbox.id === "prank-item") {
      checkbox.checked = true;
      checkbox.addEventListener("change", () => {
        checkbox.checked = true;
      });
      return;
    }

    checkbox.checked = localStorage.getItem(`checkbox-${index}`) === "true";

    checkbox.addEventListener("change", () => {
      localStorage.setItem(`checkbox-${index}`, checkbox.checked);
    });
  });

  // Reset button
  document.getElementById("reset").addEventListener("click", () => {
    checkboxes.forEach((checkbox, index) => {
      if (checkbox.id === "prank-item") {
        checkbox.checked = true;
        return;
      }
      checkbox.checked = false;
      localStorage.setItem(`checkbox-${index}`, false);
    });
  });
});
