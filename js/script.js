let students = [];

// Haalt de studenten uit het JSON-bestand
fetch("data/students.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("students.json kon niet worden geladen.");
    }

    return response.json();
  })
  .then((data) => {
    students = data;

    initDesktopStudents();
    initMobileStudents();
  })
  .catch((error) => {
    console.error("Fout bij het laden van de studenten:", error);
  });

// Regelt de studenten en pijltjes op desktop
function initDesktopStudents() {
  const studentElements = [
    document.querySelector("#student-1"),
    document.querySelector("#student-2"),
    document.querySelector("#student-3"),
    document.querySelector("#student-4"),
    document.querySelector("#student-5"),
  ];

  const nextButton = document.querySelector("#next");
  const previousButton = document.querySelector("#previous");

  if (!studentElements[0] || !nextButton || !previousButton) {
    return;
  }

  let currentIndex = 0;

  function updateStudents() {
    if (students.length === 0) {
      return;
    }

    studentElements.forEach((element) => {
      element.classList.add("changing");
    });

    setTimeout(() => {
      studentElements.forEach((element, index) => {
        const studentIndex = (currentIndex + index) % students.length;
        const student = students[studentIndex];

        element.innerHTML = `
                    <a href="${student.link}">
                        <img src="${student.image}" alt="${student.name}">
                        <p>${student.name}</p>
                    </a>
                `;
      });

      requestAnimationFrame(() => {
        studentElements.forEach((element) => {
          element.classList.remove("changing");
        });
      });
    }, 250);
  }

  nextButton.addEventListener("click", () => {
    currentIndex = (currentIndex + 5) % students.length;
    updateStudents();
  });

  previousButton.addEventListener("click", () => {
    currentIndex = (currentIndex - 5 + students.length) % students.length;
    updateStudents();
  });

  updateStudents();
}

// Regelt de studenten, pagina's en puntjes op mobiel
function initMobileStudents() {
  const studentSlots = document.querySelectorAll("#screen-tribe .student-slot");
  const pageDots = document.querySelector("#pageDots");
  const screenTribe = document.querySelector("#screen-tribe");

  if (!studentSlots.length || !pageDots || !screenTribe) {
    return;
  }

  const studentsPerPage = 5;
  let currentPage = 0;

  function showStudents() {
    studentSlots.forEach((slot, index) => {
      const studentNumber = currentPage * studentsPerPage + index;
      const student = students[studentNumber];

      slot.innerHTML = "";
      slot.classList.remove("empty");

      if (!student) {
        slot.classList.add("empty");
        return;
      }

      const image = document.createElement("img");
      image.src = student.image;
      image.alt = student.name;
      image.classList.add("student-photo");

      const name = document.createElement("span");
      name.textContent = student.name;

      slot.appendChild(image);
      slot.appendChild(name);

      slot.onclick = function () {
        if (student.link) {
          window.location.href = student.link;
        }
      };
    });

    updateDots();
  }

  // Maakt de puntjes onderaan voor elke studentpagina
  function createDots() {
    pageDots.innerHTML = "";

    const pageCount = Math.ceil(students.length / studentsPerPage);

    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");

      if (i === 0) {
        dot.classList.add("active");
      }

      pageDots.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = document.querySelectorAll(".dot");

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentPage);
    });
  }

  function nextPage() {
    const maxPage = Math.ceil(students.length / studentsPerPage) - 1;

    if (currentPage >= maxPage) {
      return;
    }

    currentPage++;
    changePage("left");
  }

  function previousPage() {
    if (currentPage <= 0) {
      return;
    }

    currentPage--;
    changePage("right");
  }

  // Zorgt voor de animatie bij het wisselen van studenten
  function changePage(direction) {
    screenTribe.classList.add(
      direction === "left" ? "swipe-left" : "swipe-right",
    );

    setTimeout(() => {
      showStudents();

      studentSlots.forEach((slot) => {
        if (!slot.classList.contains("empty")) {
          slot.classList.add(
            direction === "left" ? "student-enter-left" : "student-enter-right",
          );
        }
      });

      setTimeout(() => {
        screenTribe.classList.remove("swipe-left", "swipe-right");

        studentSlots.forEach((slot) => {
          slot.classList.remove("student-enter-left", "student-enter-right");
        });
      }, 300);
    }, 300);
  }

  createDots();
  showStudents();

  // Maakt de mobiele pagina's beschikbaar voor de swipe-functie
  window.__mobileNextPage = nextPage;
  window.__mobilePreviousPage = previousPage;
}

// Regelt het swipen tussen The Tribe en Amstel Campus
function initScreenSwipe() {
  const screens = document.querySelector("#screens");

  if (!screens) {
    return;
  }

  let onCampus = false;

  function goToCampus() {
    if (onCampus) return;
    onCampus = true;
    screens.style.transform = "translateY(-100%)";
  }

  function goToTribe() {
    if (!onCampus) return;
    onCampus = false;
    screens.style.transform = "translateY(0)";
  }

  let startX = 0;
  let startY = 0;
  let isDragging = false;

  screens.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    isDragging = true;
  });

  // Blokkeert normaal scrollen tijdens het swipen
  screens.addEventListener(
    "touchmove",
    (event) => {
      if (!isDragging) {
        return;
      }

      event.preventDefault();
    },
    { passive: false },
  );

  screens.addEventListener("touchend", (event) => {
    isDragging = false;

    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;

    const differenceX = endX - startX;
    const differenceY = endY - startY;

    const isVertical = Math.abs(differenceY) >= Math.abs(differenceX);

    if (isVertical) {
      if (Math.abs(differenceY) < 50) {
        return;
      }

      if (differenceY < 0) {
        // Omhoog = naar Amstel Campus
        goToCampus();
      } else {
        // Omlaag = terug naar The Tribe
        goToTribe();
      }

      return;
    }

    // Horizontaal swipen wisselt de studenten
    if (onCampus) {
      return;
    }

    if (Math.abs(differenceX) < 50) {
      return;
    }

    if (differenceX < 0) {
      if (window.__mobileNextPage) {
        window.__mobileNextPage();
      }
    } else {
      if (window.__mobilePreviousPage) {
        window.__mobilePreviousPage();
      }
    }
  });
}

initScreenSwipe();