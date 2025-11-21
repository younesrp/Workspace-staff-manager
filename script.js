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



const zonesRules = {
  "Reception": ["receptionist", "manager"],
  "Servers": ["it", "manager"],
  "Security": ["security", "manager"],
  "Conference": ["receptionist","it","security","manager","cleaning","other"],
  "Staff": ["receptionist","it","security","manager","cleaning","other"],

};
const zoneLimits = {
  "Reception": 2,
  "Servers": 2,
  "Security": 2,
  "Conference": 10,
  "Staff": 7,
  "Archives": 1
};

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

  const regexError = validateRegex(name, email, phone, photo);
  if (regexError) return alert(regexError);

  const expItems = Array.from(experiencesContainer.children).map(div => {
    const inputs = div.querySelectorAll("input");
    if(inputs[1].value && inputs[2].value && inputs[1].value > inputs[2].value) return null;
    return {title: inputs[0].value, start: inputs[1].value, end: inputs[2].value};
  });

  if(expItems.includes(null)) return alert("La date de début doit être antérieure à la date de fin");

  const worker = {id: workerIdCounter++, name, role, photo, email, phone, experiences: expItems, assignedTo: null};
  workers.push(worker);

  addWorkerCardUnassigned(worker);

  modalBack.style.display = "none";
  inpName.value=""; inpPhoto.value=""; inpEmail.value=""; inpPhone.value="";
  experiencesContainer.innerHTML="";
}

function addWorkerCardUnassigned(worker){
  const div = document.createElement("div");
  div.className = "worker-card";
  div.dataset.workerId = worker.id;
  div.innerHTML = `<img src="${worker.photo}"><div class="worker-info"><b>${worker.name}</b> ${worker.role}</div>`;
  div.onclick = () => openProfile(worker);
  unassignedList.appendChild(div);
}

function openProfile(worker){
  profileContent.innerHTML = `
    <img src="${worker.photo}" style="width:120px;height:120px">
    <h3>${worker.name}</h3>
    <p>Rôle: ${worker.role}</p>
    <p>Email: ${worker.email}</p>
    <p>Téléphone: ${worker.phone}</p>
    <h4>Expériences:</h4>
    <ul>
      ${worker.experiences.map(e => `<li>${e.title}: ${e.start} → ${e.end}</li>`).join("")}
    </ul>
    <p>Localisation: ${worker.assignedTo || "Non assigné"}</p>
  `;
  profilePopup.style.display = "flex";
}

profilePopup.onclick = e => { if(e.target === profilePopup) profilePopup.style.display = "none"; }

document.querySelectorAll(".add-btn").forEach(btn => {
  btn.onclick = () => openEligibleChooser(btn.dataset.zone);
});

function isAllowed(role, zone) {
     if (zone === "Archives") return role !== "cleaning";
  return zonesRules[zone].includes(role);
}

closeChooser.onclick = () => chooserBack.style.display = "none";
chooserBack.onclick = e => { if(e.target === chooserBack) chooserBack.style.display = "none"; }

function openEligibleChooser(zone){
  chooserList.innerHTML = "";

  const eligibleWorkers = workers.filter(w => 
    !w.assignedTo &&
    isAllowed(w.role, zone)
  );

  eligibleWorkers.forEach(worker => {
    const div = document.createElement("div");
    div.className = "worker-card";
    div.innerHTML = `<img src="${worker.photo}"><div class="worker-info"><b>${worker.name}</b> ${worker.role}</div>`;
    div.onclick = () => {
      addWorkerCardAssigned(worker, zone);
      chooserBack.style.display = "none";
    }
    chooserList.appendChild(div);
  });

  chooserBack.style.display = "flex";
}

function validateRegex(name, email, phone, photo) {
  const nameRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ'\- ]{2,50}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?\d{8,15}$/;
  const urlRegex = /^(https?:\/\/)[^\s]+$/;
  if (!nameRegex.test(name)) return "Nom invalide (lettres uniquement)";
  if (!emailRegex.test(email)) return "Email invalide";
  if (!phoneRegex.test(phone)) return "Téléphone invalide";
  if (photo && !urlRegex.test(photo)) return "URL photo invalide";

  return null;
}

inpPhoto.oninput = () => {
  const url = inpPhoto.value.trim();
  const preview = document.getElementById("photoPreview");

  if (url) {
    preview.src = url;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
};

function refreshZoneColors() {
  document.querySelectorAll(".zone").forEach(zone => {
    const isRequired = zone.dataset.required === "true";
    const list = zone.querySelector(".assigned-list");

    if (isRequired && list.children.length === 0) {
      zone.style.backgroundColor = "rgba(255,0,0,0.2)";
    } else {
      zone.style.backgroundColor = "";
    }
  });
}

function addWorkerCardAssigned(worker, zone){
  const zoneList = document.querySelector(`.assigned-list[data-list="${zone}"]`);

  if (zoneList.children.length >= zoneLimits[zone]) {
    alert("Limite atteinte pour cette zone !");
    return;
  }

  worker.assignedTo = zone;
  zoneList.appendChild(createWorkerCardForZone(worker));

  const unassignedCard = [...unassignedList.children].find(c => parseInt(c.dataset.workerId) === worker.id);
  if(unassignedCard) unassignedList.removeChild(unassignedCard);

  refreshZoneColors();
}

function createWorkerCardForZone(worker){
  const div = document.createElement("div");
  div.className = "worker-card";
  div.innerHTML = `
    <img src="${worker.photo}">
    <div class="worker-info"><b>${worker.name}</b> ${worker.role}</div>
    <button class="remove-btn">X</button>
  `;
  div.querySelector(".remove-btn").onclick = () => removeWorkerFromZone(worker, div);

  return div;
}

function removeWorkerFromZone(worker, cardDiv){
  worker.assignedTo = null;

  addWorkerCardUnassigned(worker); 

  cardDiv.remove();

  refreshZoneColors();
}
