const SECTIONS = ["home-section", "settings-section"];
const navelements = document.querySelectorAll(".nav-item");
const settingsBtn = document.getElementById("settings_submit_btn");
getConfigurationsFromStorage();
addSectionSwitchListeners();

settingsBtn.addEventListener("click", saveCongigurations);
function saveCongigurations(event) {
  // prevent form submission
  event.preventDefault();

  const data = {
    notion_page_id: document.getElementById("notion_page_id").value,
  };

  localStorage.setItem("configurations", JSON.stringify(data));

  showToast("Settings saved successfully");
}

function showToast(message) {
  const x = document.getElementById("toast-message");
  x.innerText = message;
  x.style.visibility = "visible";
  setTimeout(function () {
    x.style.visibility = "hidden";
  }, 1000);
}

function getConfigurationsFromStorage() {
  const configurations = localStorage.getItem("configurations");
  if (configurations) {
    const data = JSON.parse(configurations);
    document.getElementById("notion_page_id").value = data.notion_page_id;
    return;
  }

  showSection("settings-section");
}

function showSection(sectionId) {
  const section_elements = SECTIONS.map((section) =>
    document.getElementById(section)
  );
  section_elements.forEach((section) => {
    section.style.display = "none";
  });

  document.getElementById(sectionId).style.display = "block";
}

function addSectionSwitchListeners() {
  navelements.forEach((elem) => {
    elem.addEventListener("click", () => {
      showSection(elem.dataset.page);
    });
  });
}
