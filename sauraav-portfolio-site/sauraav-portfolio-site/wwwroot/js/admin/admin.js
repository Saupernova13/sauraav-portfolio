// Reads the antiforgery token injected by the layout
function getAntiforgeryToken() {
  return document.querySelector('meta[name="__RequestVerificationToken"]')?.content ?? '';
}

function postHeaders() {
  return {
    'Content-Type': 'application/json',
    'RequestVerificationToken': getAntiforgeryToken(),
  };
}

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}

function showAlert(title, text, icon) {
  Swal.fire({ title, text, icon });
}

async function confirmDelete() {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
  });
  return result.isConfirmed;
}

// Summary
document.getElementById('summaryForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const response = await fetch('/Admin/SaveSummary', {
    method: 'POST',
    headers: postHeaders(),
    body: JSON.stringify({ summary: document.getElementById('summaryText').value }),
  });
  const result = await response.json();
  if (result.success) { showAlert('Success', 'Summary saved', 'success'); loadAllData(); }
  else showAlert('Error', result.message, 'error');
});

// Education date toggles
document.getElementById('hasStartDate').addEventListener('change', function () {
  const el = document.getElementById('eduStartDate');
  el.disabled = !this.checked;
  if (!this.checked) el.value = '';
});
document.getElementById('hasEndDate').addEventListener('change', function () {
  const el = document.getElementById('eduEndDate');
  el.disabled = !this.checked;
  if (!this.checked) el.value = '';
});

document.getElementById('educationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const imageBase64 = await convertToBase64(document.getElementById('eduImage').files[0]);
  const data = {
    schoolName: document.getElementById('schoolName').value,
    description: document.getElementById('educationDescription').value || '',
    location: document.getElementById('location').value || '',
    startDate: document.getElementById('hasStartDate').checked ? document.getElementById('eduStartDate').value : null,
    endDate: document.getElementById('hasEndDate').checked ? document.getElementById('eduEndDate').value : null,
    imageBase64: imageBase64 || document.getElementById('eduImagePreview').src || '',
  };
  const res = await fetch('/Admin/AddEducation', { method: 'POST', headers: postHeaders(), body: JSON.stringify(data) });
  const result = await res.json();
  if (result.success) { showAlert('Success', 'Education saved', 'success'); loadAllData(); clearEducationForm(); }
  else showAlert('Error', result.message, 'error');
});

// Experience date toggles
document.getElementById('expHasStartDate').addEventListener('change', function () {
  const el = document.getElementById('expStartDate');
  el.disabled = !this.checked;
  if (!this.checked) el.value = '';
});
document.getElementById('expHasEndDate').addEventListener('change', function () {
  const el = document.getElementById('expEndDate');
  el.disabled = !this.checked;
  if (!this.checked) el.value = '';
});

document.getElementById('experienceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const imageBase64 = await convertToBase64(document.getElementById('expImage').files[0]);
  const accomplishments = Array.from(document.querySelectorAll('.accomplishment'))
    .map(i => i.value)
    .filter(v => v.trim() !== '');
  const data = {
    title: document.getElementById('expTitle').value,
    location: document.getElementById('expLocation').value,
    accomplishments,
    startDate: document.getElementById('expHasStartDate').checked ? document.getElementById('expStartDate').value : null,
    endDate: document.getElementById('expHasEndDate').checked ? document.getElementById('expEndDate').value : null,
    imageBase64: imageBase64 || document.getElementById('expImagePreview').src || '',
  };
  const res = await fetch('/Admin/AddExperience', { method: 'POST', headers: postHeaders(), body: JSON.stringify(data) });
  const result = await res.json();
  if (result.success) { showAlert('Success', 'Experience saved', 'success'); loadAllData(); clearExperienceForm(); }
  else showAlert('Error', result.message, 'error');
});

document.getElementById('projectForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData();
  const videoFile = document.getElementById('projectVideo').files[0];
  if (videoFile) formData.append('video', videoFile);
  const projectData = {
    projectName: document.getElementById('projectName').value,
    description: document.getElementById('projectDescription').value,
    projectLink: document.getElementById('projectLink').value,
    demoVideoPath: document.getElementById('projIsEdit').value === 'true' ? document.getElementById('projectVideoPreview').src : '',
  };
  formData.append('projectData', JSON.stringify(projectData));
  // FormData POST — antiforgery token via header
  const res = await fetch('/Admin/AddProject', {
    method: 'POST',
    headers: { 'RequestVerificationToken': getAntiforgeryToken() },
    body: formData,
  });
  const result = await res.json();
  if (result.success) { showAlert('Success', 'Project saved', 'success'); loadAllData(); clearProjectForm(); }
  else showAlert('Error', result.message, 'error');
});

document.getElementById('qualificationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const imageBase64 = await convertToBase64(document.getElementById('qualificationImage').files[0]);
  const data = {
    qualificationName: document.getElementById('qualificationName').value,
    imageBase64: imageBase64 || document.getElementById('qualImagePreview').src || '',
  };
  const res = await fetch('/Admin/AddQualification', { method: 'POST', headers: postHeaders(), body: JSON.stringify(data) });
  const result = await res.json();
  if (result.success) { showAlert('Success', 'Qualification saved', 'success'); loadAllData(); clearQualificationForm(); }
  else showAlert('Error', result.message, 'error');
});

document.getElementById('skillForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    skillName: document.getElementById('skillName').value,
    skillLevel: parseInt(document.getElementById('skillLevel').value),
  };
  const res = await fetch('/Admin/AddSkill', { method: 'POST', headers: postHeaders(), body: JSON.stringify(data) });
  const result = await res.json();
  if (result.success) { showAlert('Success', 'Skill saved', 'success'); loadAllData(); clearSkillForm(); }
  else showAlert('Error', result.message, 'error');
});

// Load all data
async function loadAllData() {
  const response = await fetch('/Admin/GetAllData');
  const data = await response.json();

  if (data.summary) document.getElementById('summaryText').value = data.summary.summary || '';

  const educationList = document.getElementById('educationList');
  educationList.innerHTML = '';
  if (data.education) {
    Object.values(data.education).forEach(edu => {
      educationList.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${edu.schoolName}</td>
          <td>${edu.location || ''}</td>
          <td>${formatDuration(edu.startDate, edu.endDate)}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick='editEducation(${JSON.stringify(edu)})'>Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteEducation('${edu.schoolName}')">Delete</button>
          </td>
        </tr>`);
    });
  }

  const experienceList = document.getElementById('experienceList');
  experienceList.innerHTML = '';
  if (data.experience) {
    Object.values(data.experience).forEach(exp => {
      experienceList.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${exp.title}</td>
          <td>${exp.location || ''}</td>
          <td>${formatDuration(exp.startDate, exp.endDate)}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick='editExperience(${JSON.stringify(exp)})'>Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteExperience('${exp.title}')">Delete</button>
          </td>
        </tr>`);
    });
  }

  const projectsList = document.getElementById('projectsList');
  projectsList.innerHTML = '';
  if (data.projects) {
    Object.values(data.projects).forEach(proj => {
      projectsList.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${proj.projectName}</td>
          <td><a href="${proj.projectLink}" target="_blank" rel="noopener noreferrer">View</a></td>
          <td>${proj.demoVideoPath ? `<a href="${proj.demoVideoPath}" target="_blank" rel="noopener noreferrer">Demo</a>` : 'None'}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick='editProject(${JSON.stringify(proj)})'>Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteProject('${proj.projectName}')">Delete</button>
          </td>
        </tr>`);
    });
  }

  const qualificationsList = document.getElementById('qualificationsList');
  qualificationsList.innerHTML = '';
  if (data.qualifications) {
    Object.values(data.qualifications).forEach(qual => {
      qualificationsList.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${qual.qualificationName}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick='editQualification(${JSON.stringify(qual)})'>Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteQualification('${qual.qualificationName}')">Delete</button>
          </td>
        </tr>`);
    });
  }

  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = '';
  if (data.skills) {
    Object.values(data.skills).forEach(skill => {
      skillsList.insertAdjacentHTML('beforeend', `
        <tr>
          <td>${skill.skillName}</td>
          <td>${skill.skillLevel}</td>
          <td>
            <button class="btn btn-sm btn-primary" onclick='editSkill(${JSON.stringify(skill)})'>Edit</button>
            <button class="btn btn-sm btn-danger" onclick="deleteSkill('${skill.skillName}')">Delete</button>
          </td>
        </tr>`);
    });
  }
}

// Edit functions
function editEducation(edu) {
  document.getElementById('eduIsEdit').value = 'true';
  document.getElementById('eduOriginalSchool').value = edu.schoolName;
  document.getElementById('schoolName').value = edu.schoolName;
  document.getElementById('educationDescription').value = edu.description || '';
  document.getElementById('location').value = edu.location || '';
  setDateField('hasStartDate', 'eduStartDate', edu.startDate);
  setDateField('hasEndDate', 'eduEndDate', edu.endDate);
  if (edu.imageBase64) { document.getElementById('eduImagePreview').src = edu.imageBase64; document.getElementById('eduImagePreview').style.display = 'block'; }
}

function editExperience(exp) {
  document.getElementById('expIsEdit').value = 'true';
  document.getElementById('expOriginalTitle').value = exp.title;
  document.getElementById('expTitle').value = exp.title;
  document.getElementById('expLocation').value = exp.location || '';
  document.getElementById('accomplishmentsList').innerHTML = '';
  (exp.accomplishments?.length ? exp.accomplishments : ['']).forEach(addAccomplishment);
  setDateField('expHasStartDate', 'expStartDate', exp.startDate);
  setDateField('expHasEndDate', 'expEndDate', exp.endDate);
  if (exp.imageBase64) { document.getElementById('expImagePreview').src = exp.imageBase64; document.getElementById('expImagePreview').style.display = 'block'; }
}

function editProject(proj) {
  document.getElementById('projIsEdit').value = 'true';
  document.getElementById('projOriginalName').value = proj.projectName;
  document.getElementById('projectName').value = proj.projectName;
  document.getElementById('projectDescription').value = proj.description;
  document.getElementById('projectLink').value = proj.projectLink;
  if (proj.demoVideoPath) { const v = document.getElementById('projectVideoPreview'); v.src = proj.demoVideoPath; v.style.display = 'block'; }
}

function editQualification(qual) {
  document.getElementById('qualIsEdit').value = 'true';
  document.getElementById('qualOriginalName').value = qual.qualificationName;
  document.getElementById('qualificationName').value = qual.qualificationName;
  if (qual.imageBase64) { document.getElementById('qualImagePreview').src = qual.imageBase64; document.getElementById('qualImagePreview').style.display = 'block'; }
}

function editSkill(skill) {
  document.getElementById('skillIsEdit').value = 'true';
  document.getElementById('skillOriginalName').value = skill.skillName;
  document.getElementById('skillName').value = skill.skillName;
  document.getElementById('skillLevel').value = skill.skillLevel;
  document.getElementById('skillLevelValue').textContent = skill.skillLevel;
}

// Delete functions
async function deleteEducation(name) {
  if (!await confirmDelete()) return;
  const res = await fetch(`/Admin/DeleteEducation?schoolName=${encodeURIComponent(name)}`, { method: 'DELETE' });
  const r = await res.json();
  if (r.success) { showAlert('Deleted!', 'Education entry deleted.', 'success'); loadAllData(); }
  else showAlert('Error', r.message, 'error');
}

async function deleteExperience(title) {
  if (!await confirmDelete()) return;
  const res = await fetch(`/Admin/DeleteExperience?title=${encodeURIComponent(title)}`, { method: 'DELETE' });
  const r = await res.json();
  if (r.success) { showAlert('Deleted!', 'Experience entry deleted.', 'success'); loadAllData(); }
  else showAlert('Error', r.message, 'error');
}

async function deleteProject(name) {
  if (!await confirmDelete()) return;
  const res = await fetch(`/Admin/DeleteProject?projectName=${encodeURIComponent(name)}`, { method: 'DELETE' });
  const r = await res.json();
  if (r.success) { showAlert('Deleted!', 'Project deleted.', 'success'); loadAllData(); }
  else showAlert('Error', r.message, 'error');
}

async function deleteQualification(name) {
  if (!await confirmDelete()) return;
  const res = await fetch(`/Admin/DeleteQualification?qualificationName=${encodeURIComponent(name)}`, { method: 'DELETE' });
  const r = await res.json();
  if (r.success) { showAlert('Deleted!', 'Qualification deleted.', 'success'); loadAllData(); }
  else showAlert('Error', r.message, 'error');
}

async function deleteSkill(name) {
  if (!await confirmDelete()) return;
  const res = await fetch(`/Admin/DeleteSkill?skillName=${encodeURIComponent(name)}`, { method: 'DELETE' });
  const r = await res.json();
  if (r.success) { showAlert('Deleted!', 'Skill deleted.', 'success'); loadAllData(); }
  else showAlert('Error', r.message, 'error');
}

// Clear form functions
function clearEducationForm() {
  document.getElementById('educationForm').reset();
  document.getElementById('eduIsEdit').value = 'false';
  document.getElementById('eduOriginalSchool').value = '';
  document.getElementById('eduImagePreview').style.display = 'none';
  document.getElementById('eduStartDate').disabled = true;
  document.getElementById('eduEndDate').disabled = true;
}

function clearExperienceForm() {
  document.getElementById('experienceForm').reset();
  document.getElementById('expIsEdit').value = 'false';
  document.getElementById('expOriginalTitle').value = '';
  document.getElementById('expImagePreview').style.display = 'none';
  document.getElementById('expStartDate').disabled = true;
  document.getElementById('expEndDate').disabled = true;
  document.getElementById('accomplishmentsList').innerHTML = '';
  addAccomplishment('');
}

function clearProjectForm() {
  document.getElementById('projectForm').reset();
  document.getElementById('projIsEdit').value = 'false';
  document.getElementById('projOriginalName').value = '';
  document.getElementById('projectVideoPreview').style.display = 'none';
}

function clearQualificationForm() {
  document.getElementById('qualificationForm').reset();
  document.getElementById('qualIsEdit').value = 'false';
  document.getElementById('qualOriginalName').value = '';
  document.getElementById('qualImagePreview').style.display = 'none';
}

function clearSkillForm() {
  document.getElementById('skillForm').reset();
  document.getElementById('skillIsEdit').value = 'false';
  document.getElementById('skillOriginalName').value = '';
  document.getElementById('skillLevel').value = 5;
  document.getElementById('skillLevelValue').textContent = '5';
}

// Helpers
function formatDuration(start, end) {
  return `${start ? formatDate(start) : ''} - ${end ? formatDate(end) : 'Present'}`;
}

function setDateField(checkboxId, inputId, value) {
  const checked = !!value;
  document.getElementById(checkboxId).checked = checked;
  const input = document.getElementById(inputId);
  input.disabled = !checked;
  input.value = checked ? formatDate(value) : '';
}

function addAccomplishment(value = '') {
  document.getElementById('accomplishmentsList').insertAdjacentHTML('beforeend', `
    <div class="input-group mb-2">
      <input type="text" class="form-control accomplishment" value="${value}" required>
      <div class="input-group-append">
        <button type="button" class="btn btn-outline-danger" onclick="removeAccomplishment(this)">Remove</button>
      </div>
    </div>`);
}

function removeAccomplishment(btn) {
  btn.closest('.input-group').remove();
}

// File preview handlers
document.getElementById('eduImage').addEventListener('change', async function () {
  const preview = document.getElementById('eduImagePreview');
  if (this.files[0]) { preview.src = await convertToBase64(this.files[0]); preview.style.display = 'block'; }
  else preview.style.display = 'none';
});

document.getElementById('expImage').addEventListener('change', async function () {
  const preview = document.getElementById('expImagePreview');
  if (this.files[0]) { preview.src = await convertToBase64(this.files[0]); preview.style.display = 'block'; }
  else preview.style.display = 'none';
});

document.getElementById('projectVideo').addEventListener('change', function () {
  const preview = document.getElementById('projectVideoPreview');
  if (this.files[0]) { preview.src = URL.createObjectURL(this.files[0]); preview.style.display = 'block'; }
  else preview.style.display = 'none';
});

document.getElementById('qualificationImage').addEventListener('change', async function () {
  const preview = document.getElementById('qualImagePreview');
  if (this.files[0]) { preview.src = await convertToBase64(this.files[0]); preview.style.display = 'block'; }
  else preview.style.display = 'none';
});

document.getElementById('skillLevel').addEventListener('input', function () {
  document.getElementById('skillLevelValue').textContent = this.value;
});

document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
  document.getElementById('eduStartDate').disabled = true;
  document.getElementById('eduEndDate').disabled = true;
  document.getElementById('expStartDate').disabled = true;
  document.getElementById('expEndDate').disabled = true;
  addAccomplishment('');

  document.getElementById('eduClearForm').addEventListener('click', clearEducationForm);
  document.getElementById('expClearForm').addEventListener('click', clearExperienceForm);
  document.getElementById('projClearForm').addEventListener('click', clearProjectForm);
  document.getElementById('qualClearForm').addEventListener('click', clearQualificationForm);
  document.getElementById('skillClearForm').addEventListener('click', clearSkillForm);
});
