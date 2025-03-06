let slider = document.getElementById("myRange");
let valueDisplay = document.getElementById("valueDisplay");
let preview = document.getElementById("preview");
let config
let titleWeight
loadConfig()



slider.oninput = function () {
  valueDisplay.innerHTML = this.value;
  preview.setAttribute("style", "font-weight: " + valueDisplay.textContent);
};

function saveConfig() {
  config = [];
  config.push({
    "title-weight": valueDisplay.textContent,
  });
  localStorage.setItem("todo-config", JSON.stringify(config));
  titleWeight = valueDisplay.textContent;
  displayTasks();
}


function loadConfig(){
    config = JSON.parse(localStorage.getItem("todo-config"));
    titleWeight = config[0]['title-weight'] || 400;
    slider.value = titleWeight
    valueDisplay.innerText = titleWeight
    preview.setAttribute("style", "font-weight: " + titleWeight)
}