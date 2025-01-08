document.addEventListener('DOMContentLoaded', function () {
    loadPortfolioData();
});

async function loadPortfolioData() {
    try {
        const response = await fetch('/Home/GetPortfolioData');
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            // Populate each section
            populateSummary(data.summary);
            populateEducation(data.education);
            populateExperience(data.experience);
            populateProjects(data.projects);
            populateQualifications(data.qualifications);
            populateSkills(data.skills);
        } else {
            console.error('Error loading portfolio data:', result.message);
        }
    } catch (error) {
        console.error('Error loading portfolio data:', error);
    }
}

function populateSummary(summary) {
    if (!summary) return;
    const container = document.getElementById('summaryContent');
    container.innerHTML = `<p>${summary.content}</p>`;
}

function populateEducation(education) {
    if (!education) return;
    const container = document.getElementById('educationContent');
    container.innerHTML = Object.values(education).map(edu => `
        <div class="education-card">
            <h3>${edu.schoolName}</h3>
            <p>${edu.degree}</p>
            <p>${edu.year}</p>
        </div>
    `).join('');
}

function populateExperience(experience) {
    if (!experience) return;
    const container = document.getElementById('experienceContent');
    container.innerHTML = Object.values(experience).map(exp => `
        <div class="experience-card">
            <h3>${exp.title}</h3>
            <h4>${exp.company}</h4>
            <p>${exp.period}</p>
            <p>${exp.description}</p>
        </div>
    `).join('');
}

function populateProjects(projects) {
    if (!projects) return;
    const container = document.getElementById('projectsContent');
    container.innerHTML = `
        <div class="projects-grid">
            ${Object.values(projects).map(project => `
                <div class="project-card">
                    <h3>${project.projectName}</h3>
                    <p>${project.description}</p>
                    ${project.projectLink ? `<a href="${project.projectLink}" target="_blank">View Project</a>` : ''}
                    ${project.demoVideoPath ? `<video src="${project.demoVideoPath}" controls></video>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

function populateQualifications(qualifications) {
    if (!qualifications) return;
    const container = document.getElementById('qualificationsContent');
    container.innerHTML = Object.values(qualifications).map(qual => `
        <div class="qualification-card">
            <h3>${qual.qualificationName}</h3>
            <p>${qual.description}</p>
            <p>Issued by: ${qual.issuedBy}</p>
        </div>
    `).join('');
}

function populateSkills(skills) {
    if (!skills) return;
    const container = document.getElementById('skillsContent');
    container.innerHTML = `
        <div class="skills-grid">
            ${Object.values(skills).map(skill => `
                <div class="skill-item">
                    <h3>${skill.skillName}</h3>
                    <p>${skill.proficiencyLevel}</p>
                </div>
            `).join('')}
        </div>
    `;
}