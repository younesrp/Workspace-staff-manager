let workers = [];
let workerIdCounter = 0;

const unassignedList = document.getElementById("unassignedList");
const btnAdd = document.getElementById("btnAdd");
const modalBack = document.getElementById("modalBack");
const modal = document.getElementById("modal");
const cancelModal = document.getElementById("cancelModal");
const saveWorker = document.getElementById("saveWorker");
const inpName = document.getElementById("inpName");
const inpRole = document.getElementById("inpRole");
const inpPhoto = document.getElementById("inpPhoto");
const inpEmail = document.getElementById("inpEmail");
const inpPhone = document.getElementById("inpPhone");
const experiencesContainer = document.getElementById("experiences");
const addExp = document.getElementById("addExp");

const profilePopup = document.getElementById("profilePopup");
const profileContent = document.getElementById("profileContent");

const chooserBack = document.getElementById("chooserBack");
const chooserList = document.getElementById("chooserList");
const closeChooser = document.getElementById("closeChooser");


btnAdd.onclick = () => modalBack.style.display = "flex";
cancelModal.onclick = () => modalBack.style.display = "none";
modalBack.onclick = e => { if(e.target === modalBack) modalBack.style.display = "none"; }

addExp.onclick = e => {
  e.preventDefault();
  const div = document.createElement("div");
  div.className = "exp-item";
  div.innerHTML = `<input type="text" placeholder="Titre"><input type="date"><input type="date">`;
  experiencesContainer.appendChild(div);
}

saveWorker.onclick = () => {
  const name = inpName.value.trim();
  const role = inpRole.value;
  const photo = inpPhoto.value || "https://via.placeholder.com/60";
  const email = inpEmail.value.trim();
  const phone = inpPhone.value.trim();

  if(!name || !email || !phone) return alert("Tous les champs obligatoires doivent être remplis");

  const expItems = Array.from(experiencesContainer.children).map(div => {
    const inputs = div.querySelectorAll("input");
    if(inputs[1].value && inputs[2].value && inputs[1].value > inputs[2].value) return null;
    return {title: inputs[0].value, start: inputs[1].value, end: inputs[2].value};
  });

  if(expItems.includes(null)) return alert("La date de début doit être antérieure à la date de fin");

  const worker = {id: workerIdCounter++, name, role, photo, email, phone, experiences: expItems, assignedTo: null};
  workers.push(worker);
  addWorkerCard(worker);
  modalBack.style.display = "none";
  inpName.value=""; inpPhoto.value=""; inpEmail.value=""; inpPhone.value="";
  experiencesContainer.innerHTML="";
}

function addWorkerCard(worker){
  const div = document.createElement("div");
  div.className = "worker-card";
  div.dataset.id = worker.id;
  div.innerHTML = `<img src="${worker.photo}"><div class="worker-info"><b>${worker.name}</b>${worker.role}</div>`;
  div.onclick = () => openProfile(worker.id);
  unassignedList.appendChild(div);
}




document.querySelectorAll(".add-btn").forEach(btn => {
  btn.onclick = () => openEligibleChooser(btn.dataset.zone);
});

