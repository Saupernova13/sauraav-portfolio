// Admin dashboard: config-driven CRUD over /Admin endpoints.
// All rendering uses textContent / element properties — never HTML strings —
// so stored content cannot inject markup.
(() => {
    'use strict';

    const SECTIONS = {
        education: {
            saveUrl: '/Admin/AddEducation',
            key: 'schoolName',
            columns: [
                (e) => e.schoolName,
                (e) => e.location || '',
                (e) => duration(e.startDate, e.endDate),
            ],
        },
        experience: {
            saveUrl: '/Admin/AddExperience',
            key: 'title',
            columns: [
                (e) => e.title,
                (e) => e.location || '',
                (e) => duration(e.startDate, e.endDate),
            ],
        },
        projects: {
            saveUrl: '/Admin/AddProject',
            key: 'projectName',
            multipart: true,
            columns: [
                (e) => e.projectName,
                (e) => link(e.projectLink, 'View'),
                (e) => link(e.demoVideoPath, 'Demo'),
            ],
        },
        qualifications: {
            saveUrl: '/Admin/AddQualification',
            key: 'qualificationName',
            columns: [(e) => e.qualificationName],
        },
        skills: {
            saveUrl: '/Admin/AddSkill',
            key: 'skillName',
            columns: [(e) => e.skillName, (e) => String(e.skillLevel)],
        },
    };

    // Per-section list of entries as last fetched, plus the key of the entry
    // being edited (so renames delete the old node after a successful save).
    const state = { entries: {}, editing: {} };

    const token = document.querySelector('meta[name="__RequestVerificationToken"]')?.content ?? '';

    // --- API ----------------------------------------------------------------

    async function request(url, options) {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const result = await response.json();
        if (result && result.success === false) throw new Error(result.message || 'Request failed');
        return result;
    }

    function saveSection(section, payload, videoFile) {
        const config = SECTIONS[section];
        if (config?.multipart) {
            const form = new FormData();
            if (videoFile) form.append('video', videoFile);
            form.append('projectData', JSON.stringify(payload));
            return request(config.saveUrl, {
                method: 'POST',
                headers: { RequestVerificationToken: token },
                body: form,
            });
        }
        const url = section === 'summary' ? '/Admin/SaveSummary' : config.saveUrl;
        return request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', RequestVerificationToken: token },
            body: JSON.stringify(payload),
        });
    }

    function deleteEntry(section, key) {
        const url = `/Admin/Delete?section=${encodeURIComponent(section)}&key=${encodeURIComponent(key)}`;
        return request(url, { method: 'DELETE', headers: { RequestVerificationToken: token } });
    }

    // --- Rendering ----------------------------------------------------------

    function duration(start, end) {
        const fmt = (d) => (d ? new Date(d).toISOString().split('T')[0] : '');
        return `${fmt(start)} – ${end ? fmt(end) : 'Present'}`;
    }

    function link(url, text) {
        if (!url || !/^(https?:\/\/|\/)/i.test(url)) return '—';
        const a = document.createElement('a');
        a.href = url;
        a.textContent = text;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        return a;
    }

    function renderTable(section, entries) {
        const tbody = document.querySelector(`[data-table="${section}"] tbody`);
        if (!tbody) return;
        tbody.replaceChildren();

        entries.forEach((entry, index) => {
            const row = document.createElement('tr');

            for (const column of SECTIONS[section].columns) {
                const td = document.createElement('td');
                const value = column(entry);
                if (value instanceof Node) td.appendChild(value);
                else td.textContent = value ?? '';
                row.appendChild(td);
            }

            const actions = document.createElement('td');
            actions.className = 'col-actions';
            for (const [label, action] of [['Edit', 'edit'], ['Delete', 'delete']]) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = action === 'delete' ? 'btn btn-sm btn-danger' : 'btn btn-sm btn-ghost';
                button.textContent = label;
                button.dataset.action = action;
                button.dataset.index = String(index);
                actions.appendChild(button);
            }
            row.appendChild(actions);
            tbody.appendChild(row);
        });
    }

    async function loadAllData() {
        const data = await request('/Admin/GetAllData', { method: 'GET' });

        const summaryField = document.querySelector('#summaryForm [name="summary"]');
        if (summaryField && data.summary) summaryField.value = data.summary.summary || '';

        for (const section of Object.keys(SECTIONS)) {
            state.entries[section] = Object.values(data[section] || {});
            renderTable(section, state.entries[section]);
        }
    }

    // --- Forms --------------------------------------------------------------

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
        });
    }

    async function collect(form) {
        const payload = {};

        for (const el of form.elements) {
            if (!el.name || el.disabled) continue;
            if (el.type === 'date') payload[el.name] = el.value || null;
            else if (el.type === 'range') payload[el.name] = Number(el.value);
            else payload[el.name] = el.value;
        }

        const list = form.querySelector('[data-list]');
        if (list) {
            payload[list.dataset.list] = [...list.querySelectorAll('input')]
                .map((i) => i.value.trim())
                .filter(Boolean);
        }

        const imageInput = form.querySelector('[data-image]');
        if (imageInput) {
            const preview = form.querySelector('[data-preview]');
            payload[imageInput.dataset.image] = imageInput.files[0]
                ? await fileToBase64(imageInput.files[0])
                : (preview?.hidden ? '' : preview?.src ?? '');
        }

        return payload;
    }

    function populate(form, entry) {
        resetForm(form);

        for (const el of form.elements) {
            if (!el.name || !(el.name in entry)) continue;
            const value = entry[el.name];
            if (el.type === 'date') {
                const checkbox = form.querySelector(`[data-toggles="${el.id}"]`);
                if (checkbox) checkbox.checked = Boolean(value);
                el.disabled = !value;
                el.value = value ? new Date(value).toISOString().split('T')[0] : '';
            } else if (el.type === 'range') {
                el.value = value;
                form.querySelector('[data-range-output]').textContent = String(value);
            } else if (el.type !== 'file') {
                el.value = value ?? '';
            }
        }

        const list = form.querySelector('[data-list]');
        if (list) {
            list.replaceChildren();
            const items = entry[list.dataset.list];
            for (const item of items?.length ? items : ['']) addListRow(list, item);
        }

        const preview = form.querySelector('[data-preview]');
        const media = entry.imageBase64 || entry.demoVideoPath;
        if (preview && media) {
            preview.src = media;
            preview.hidden = false;
        }

        const section = form.dataset.section;
        state.editing[section] = entry[SECTIONS[section].key];
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetForm(form) {
        form.reset();
        state.editing[form.dataset.section] = null;

        const preview = form.querySelector('[data-preview]');
        if (preview) {
            preview.hidden = true;
            preview.removeAttribute('src');
        }

        for (const checkbox of form.querySelectorAll('[data-toggles]')) {
            document.getElementById(checkbox.dataset.toggles).disabled = true;
        }

        const list = form.querySelector('[data-list]');
        if (list) {
            list.replaceChildren();
            addListRow(list, '');
        }

        const output = form.querySelector('[data-range-output]');
        if (output) output.textContent = form.querySelector('[data-range]')?.value ?? '';
    }

    function addListRow(list, value) {
        const row = document.createElement('div');
        row.className = 'repeat-row';

        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn btn-sm btn-ghost';
        remove.textContent = 'Remove';
        remove.dataset.listRemove = '';

        row.append(input, remove);
        list.appendChild(row);
    }

    async function submitForm(form) {
        const section = form.dataset.section;
        const payload = await collect(form);
        const videoFile = form.querySelector('[data-video]')?.files[0];

        if (section === 'projects' && !videoFile) {
            const preview = form.querySelector('[data-preview]');
            payload.demoVideoPath = preview?.hidden ? '' : preview?.getAttribute('src') ?? '';
        }

        await saveSection(section, payload, videoFile);

        // Renaming an entry writes a new node; remove the old one.
        const config = SECTIONS[section];
        const previousKey = state.editing[section];
        if (config && previousKey && previousKey !== payload[config.key]) {
            await deleteEntry(section, previousKey);
        }

        toast('Saved.');
        if (section !== 'summary') resetForm(form);
        await loadAllData();
    }

    // --- UI chrome ----------------------------------------------------------

    const toastEl = document.getElementById('statusToast');
    let toastTimer;

    function toast(message, isError = false) {
        toastEl.textContent = message;
        toastEl.classList.toggle('is-error', isError);
        toastEl.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3000);
    }

    function confirmDelete(message) {
        const dialog = document.getElementById('confirmDialog');
        document.getElementById('confirmMessage').textContent = message;
        dialog.showModal();
        return new Promise((resolve) => {
            const done = (answer) => { dialog.close(); resolve(answer); };
            document.getElementById('confirmYes').onclick = () => done(true);
            document.getElementById('confirmNo').onclick = () => done(false);
            dialog.oncancel = () => resolve(false);
        });
    }

    function switchPanel(name) {
        for (const item of document.querySelectorAll('.admin-nav-item')) {
            item.classList.toggle('is-active', item.dataset.panel === name);
        }
        for (const panel of document.querySelectorAll('.admin-panel')) {
            panel.classList.toggle('is-active', panel.id === `panel-${name}`);
        }
    }

    // --- Wiring -------------------------------------------------------------

    document.addEventListener('DOMContentLoaded', () => {
        for (const item of document.querySelectorAll('.admin-nav-item')) {
            item.addEventListener('click', () => switchPanel(item.dataset.panel));
        }

        for (const form of document.querySelectorAll('form[data-section]')) {
            resetForm(form);

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                submitForm(form).catch((err) => toast(err.message, true));
            });

            form.addEventListener('reset', (e) => {
                e.preventDefault();
                resetForm(form);
            });

            form.addEventListener('change', async (e) => {
                if (e.target.matches('[data-toggles]')) {
                    const input = document.getElementById(e.target.dataset.toggles);
                    input.disabled = !e.target.checked;
                    if (input.disabled) input.value = '';
                } else if (e.target.matches('[data-image]') || e.target.matches('[data-video]')) {
                    const preview = form.querySelector('[data-preview]');
                    const file = e.target.files[0];
                    if (file) {
                        preview.src = e.target.matches('[data-video]')
                            ? URL.createObjectURL(file)
                            : await fileToBase64(file);
                        preview.hidden = false;
                    } else {
                        preview.hidden = true;
                        preview.removeAttribute('src');
                    }
                }
            });

            form.addEventListener('input', (e) => {
                if (e.target.matches('[data-range]')) {
                    form.querySelector('[data-range-output]').textContent = e.target.value;
                }
            });

            form.addEventListener('click', (e) => {
                if (e.target.matches('[data-list-add]')) {
                    addListRow(form.querySelector('[data-list]'), '');
                } else if (e.target.matches('[data-list-remove]')) {
                    e.target.closest('.repeat-row').remove();
                }
            });
        }

        for (const table of document.querySelectorAll('[data-table]')) {
            const section = table.dataset.table;

            table.addEventListener('click', async (e) => {
                const button = e.target.closest('button[data-action]');
                if (!button) return;

                const entry = state.entries[section][Number(button.dataset.index)];
                if (!entry) return;

                if (button.dataset.action === 'edit') {
                    populate(document.querySelector(`form[data-section="${section}"]`), entry);
                    return;
                }

                const key = entry[SECTIONS[section].key];
                if (!await confirmDelete(`Delete “${key}”? This cannot be undone.`)) return;

                try {
                    await deleteEntry(section, key);
                    toast('Deleted.');
                    await loadAllData();
                } catch (err) {
                    toast(err.message, true);
                }
            });
        }

        loadAllData().catch((err) => toast(err.message, true));
    });
})();
