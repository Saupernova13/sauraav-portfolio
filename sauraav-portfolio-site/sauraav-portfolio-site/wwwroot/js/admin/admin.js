// Portfolio admin panel.
//
// Every keyed section (education, experience, projects, ...) shares the same endpoints:
//   GET    /Admin/Data
//   POST   /Admin/Sections/{section}?originalKey=...
//   DELETE /Admin/Sections/{section}/{key}
// and the same form conventions (see Views/Admin/Index.cshtml). Adding a section means adding
// its markup and one entry in SECTIONS below.
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Section configuration: how each entry is summarised in its table.
  // ---------------------------------------------------------------------------
  const SECTIONS = {
    education: {
      singular: 'education entry',
      columns: (e) => [cellText(e.schoolName), cellText(e.location, 'd-none d-md-table-cell'), cellText(period(e.startDate, e.endDate))],
    },
    experience: {
      singular: 'experience entry',
      columns: (e) => [cellText(e.title), cellText(e.location, 'd-none d-md-table-cell'), cellText(period(e.startDate, e.endDate))],
    },
    projects: {
      singular: 'project',
      columns: (e) => [cellText(e.projectName), cellLink(e.projectLink, 'Open'), cellLink(e.demoVideoPath, 'Demo', 'd-none d-md-table-cell')],
    },
    qualifications: {
      singular: 'qualification',
      columns: (e) => [cellText(e.qualificationName), cellThumb(e.imageBase64, e.qualificationName)],
    },
    skills: {
      singular: 'skill',
      columns: (e) => [cellText(e.skillName), cellLevel(e.skillLevel)],
    },
  };

  const IMAGE_MAX_EDGE = 1200;
  const IMAGE_MAX_DATA_URL_LENGTH = 2600000;

  // ---------------------------------------------------------------------------
  // HTTP
  // ---------------------------------------------------------------------------
  class ApiError extends Error {
    constructor(message, errors, status) {
      super(message);
      this.errors = errors || {};
      this.status = status;
    }
  }

  function antiforgeryToken() {
    return document.querySelector('meta[name="__RequestVerificationToken"]')?.content ?? '';
  }

  function redirectToLogin() {
    window.location.href = '/Account/Login?returnUrl=' + encodeURIComponent('/Admin');
  }

  async function api(method, url, body) {
    const headers = { RequestVerificationToken: antiforgeryToken(), Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
      redirect: 'manual',
    });

    if (response.type === 'opaqueredirect' || response.status === 401 || response.status === 403) {
      redirectToLogin();
      throw new ApiError('Your session has expired. Please log in again.', {}, response.status);
    }

    let data = null;
    try { data = await response.json(); } catch { /* non-JSON body */ }

    if (!response.ok) {
      throw new ApiError(data?.message || `Request failed (${response.status}).`, data?.errors, response.status);
    }
    return data;
  }

  // Uses XMLHttpRequest because fetch has no upload progress events.
  function uploadVideo(file, onProgress) {
    return new Promise((resolve, reject) => {
      const form = new FormData();
      form.append('video', file);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/Admin/Media/Videos');
      xhr.setRequestHeader('RequestVerificationToken', antiforgeryToken());
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.responseType = 'json';
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      });
      xhr.addEventListener('load', () => {
        const data = xhr.response;
        if (xhr.status === 401 || xhr.status === 403) { redirectToLogin(); return; }
        if (xhr.status >= 200 && xhr.status < 300 && data?.success) resolve(data.key);
        else reject(new ApiError(data?.message || `Upload failed (${xhr.status}).`, data?.errors, xhr.status));
      });
      xhr.addEventListener('error', () => reject(new ApiError('Upload failed. Check your connection and try again.')));
      xhr.send(form);
    });
  }

  // ---------------------------------------------------------------------------
  // Small DOM helpers (all text goes through textContent; nothing is parsed as HTML)
  // ---------------------------------------------------------------------------
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else node.setAttribute(key, value === true ? '' : String(value));
    });
    (children || []).forEach((child) => child && node.appendChild(child));
    return node;
  }

  function cellText(value, className) {
    return el('td', { class: className, text: value || '' });
  }

  function cellLink(href, label, className) {
    if (!href || !/^(https?:\/\/|\/)/i.test(href)) return el('td', { class: className, text: '—' });
    return el('td', { class: className }, [
      el('a', { href, target: '_blank', rel: 'noopener noreferrer', text: label }),
    ]);
  }

  function cellThumb(base64, alt) {
    const src = toDataUrl(base64);
    if (!src) return el('td', { text: '—' });
    return el('td', {}, [el('img', { class: 'admin-thumb', src, alt: alt ? `${alt} image` : '', loading: 'lazy' })]);
  }

  function cellLevel(level) {
    const value = Number(level) || 0;
    const bar = el('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': value, 'aria-valuemin': 1, 'aria-valuemax': 10 }, [
      el('div', { class: 'progress-bar' }),
    ]);
    bar.firstChild.style.width = `${value * 10}%`;
    bar.style.height = '8px';
    bar.style.minWidth = '80px';
    return el('td', {}, [el('div', { class: 'd-flex align-items-center gap-2' }, [bar, el('span', { class: 'small', text: `${value}/10` })])]);
  }

  function period(start, end) {
    const s = formatMonth(start);
    const e = formatMonth(end);
    if (!s && !e) return '';
    return `${s || '…'} – ${e || 'Present'}`;
  }

  function formatMonth(value) {
    if (!value) return '';
    const iso = isoDate(value);
    if (!iso) return value;
    const [year, month] = iso.split('-');
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${names[Number(month) - 1] || month} ${year}`;
  }

  // Keeps the calendar date as typed; no timezone shifting via Date().
  function isoDate(value) {
    if (!value) return '';
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  }

  function toDataUrl(base64) {
    if (!base64) return '';
    if (base64.startsWith('data:')) return base64;
    const mime = base64.startsWith('iVBOR') ? 'image/png'
      : base64.startsWith('R0lGOD') ? 'image/gif'
      : base64.startsWith('UklGR') ? 'image/webp'
      : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  }

  // ---------------------------------------------------------------------------
  // Toasts, modal, status badge
  // ---------------------------------------------------------------------------
  const toastContainer = document.getElementById('toastContainer');

  function toast(message, kind) {
    const node = el('div', { class: `toast toast-${kind} align-items-center`, role: 'status' }, [
      el('div', { class: 'd-flex' }, [
        el('div', { class: 'toast-body', text: message }),
        el('button', { type: 'button', class: 'btn-close btn-close-white me-2 m-auto', 'data-bs-dismiss': 'toast', 'aria-label': 'Close' }),
      ]),
    ]);
    toastContainer.appendChild(node);
    const instance = new bootstrap.Toast(node, { delay: kind === 'error' ? 6000 : 3000 });
    node.addEventListener('hidden.bs.toast', () => node.remove());
    instance.show();
  }

  const connectionState = document.getElementById('connectionState');
  function setState(text, kind) {
    connectionState.textContent = text;
    connectionState.className = `badge rounded-pill border ${kind === 'error' ? 'bg-danger' : 'bg-dark'}`;
  }

  const deleteModalNode = document.getElementById('confirmDeleteModal');
  const deleteModal = new bootstrap.Modal(deleteModalNode);
  let pendingDelete = null;

  function confirmDelete(name) {
    return new Promise((resolve) => {
      deleteModalNode.querySelector('[data-delete-name]').textContent = name;
      pendingDelete = resolve;
      deleteModal.show();
    });
  }

  deleteModalNode.querySelector('[data-confirm-delete]').addEventListener('click', () => {
    pendingDelete?.(true);
    pendingDelete = null;
    deleteModal.hide();
  });
  deleteModalNode.addEventListener('hidden.bs.modal', () => {
    pendingDelete?.(false);
    pendingDelete = null;
  });

  // ---------------------------------------------------------------------------
  // Form plumbing
  // ---------------------------------------------------------------------------
  function setBusy(form, busy) {
    const button = form.querySelector('[data-submit]');
    button.disabled = busy;
    button.querySelector('.spinner-border').hidden = !busy;
    form.querySelectorAll('input, textarea, select, button[type="reset"]').forEach((input) => {
      if (busy) {
        input.dataset.wasDisabled = input.disabled ? '1' : '';
        input.disabled = true;
      } else if (input.dataset.wasDisabled !== undefined) {
        input.disabled = input.dataset.wasDisabled === '1';
        delete input.dataset.wasDisabled;
      }
    });
  }

  function clearErrors(form) {
    form.querySelectorAll('.is-invalid').forEach((node) => node.classList.remove('is-invalid'));
    form.querySelectorAll('[data-error-for]').forEach((node) => { node.textContent = ''; node.classList.remove('d-block'); });
  }

  function showErrors(form, errors) {
    let first = null;
    Object.entries(errors || {}).forEach(([field, messages]) => {
      const target = form.querySelector(`[data-error-for="${CSS.escape(field)}"]`);
      const input = form.querySelector(`[name="${CSS.escape(field)}"]`);
      if (target) {
        target.textContent = [].concat(messages).join(' ');
        target.classList.add('d-block');
      }
      if (input) {
        input.classList.add('is-invalid');
        first = first || input;
      }
    });
    first?.focus({ preventScroll: false });
  }

  function readForm(form) {
    const data = {};
    form.querySelectorAll('[name]').forEach((input) => {
      if (input.type === 'checkbox' || input.type === 'file') return;
      let value = input.value;
      if (input.type === 'date') {
        value = input.disabled || !value ? null : value;
      } else if (input.dataset.type === 'int') {
        value = Number.parseInt(value, 10);
      } else {
        value = (value ?? '').trim();
        if (value === '') value = null;
      }
      data[input.name] = value;
    });
    form.querySelectorAll('[data-list-field]').forEach((container) => {
      data[container.dataset.listField] = Array.from(container.querySelectorAll('input'))
        .map((input) => input.value.trim())
        .filter(Boolean);
    });
    return data;
  }

  function setMediaValue(form, hiddenInput, value) {
    hiddenInput.value = value || '';
    const preview = form.querySelector(`[data-preview-for="${hiddenInput.id}"]`);
    if (!preview) return;
    const wrapper = preview.closest('.admin-preview');
    if (value) {
      preview.src = value;
      wrapper.hidden = false;
    } else {
      preview.removeAttribute('src');
      if (preview.tagName === 'VIDEO') preview.load();
      wrapper.hidden = true;
    }
  }

  function syncRangeOutput(input) {
    const output = input.form?.querySelector(`[data-range-output="${input.id}"]`);
    if (output) output.textContent = input.value;
  }

  function addListItem(container, value) {
    const input = el('input', { type: 'text', class: 'form-control', value: value || '', maxlength: 500, placeholder: 'What did you achieve?' });
    const remove = el('button', { type: 'button', class: 'btn btn-outline-danger', 'aria-label': 'Remove item', text: '×' });
    const group = el('div', { class: 'input-group' }, [input, remove]);
    remove.addEventListener('click', () => {
      group.remove();
      if (!container.children.length) addListItem(container, '');
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addListItem(container, '').querySelector('input').focus();
      }
    });
    container.appendChild(group);
    return group;
  }

  function resetEntryForm(form) {
    form.reset();
    clearErrors(form);
    delete form.dataset.originalKey;
    form.querySelector('[data-editing-banner]').hidden = true;
    form.querySelector('[data-submit-label]').textContent = 'Save';
    const title = form.closest('.card-body').querySelector('[data-form-title]');
    if (title) title.textContent = `Add ${SECTIONS[form.dataset.section].singular}`;
    form.querySelectorAll('input[type="date"]').forEach((input) => { input.disabled = true; input.value = ''; });
    form.querySelectorAll('[data-preview-for]').forEach((preview) => {
      const hidden = document.getElementById(preview.dataset.previewFor);
      if (hidden) setMediaValue(form, hidden, '');
    });
    form.querySelectorAll('[data-list-field]').forEach((container) => {
      container.replaceChildren();
      addListItem(container, '');
    });
    form.querySelectorAll('input[type="range"]').forEach(syncRangeOutput);
    form.querySelectorAll('[data-upload-progress]').forEach((bar) => { bar.hidden = true; });
  }

  function fillEntryForm(form, entry) {
    resetEntryForm(form);
    form.dataset.originalKey = entry.__key;

    form.querySelectorAll('[name]').forEach((input) => {
      if (input.type === 'checkbox' || input.type === 'file') return;
      const value = entry[input.name];
      if (input.type === 'date') {
        const on = Boolean(value);
        const toggle = form.querySelector(`[data-enables="${input.id}"]`);
        if (toggle) toggle.checked = on;
        input.disabled = !on;
        input.value = on ? isoDate(value) : '';
      } else if (input.type === 'hidden' && form.querySelector(`[data-preview-for="${input.id}"]`)) {
        setMediaValue(form, input, input.name === 'imageBase64' ? toDataUrl(value) : value || '');
      } else if (input.type === 'range') {
        input.value = value ?? input.defaultValue;
        syncRangeOutput(input);
      } else {
        input.value = value ?? '';
      }
    });

    form.querySelectorAll('[data-list-field]').forEach((container) => {
      const items = entry[container.dataset.listField];
      container.replaceChildren();
      (Array.isArray(items) && items.length ? items : ['']).forEach((item) => addListItem(container, item));
    });

    const name = entry[form.dataset.nameField] || '';
    form.querySelector('[data-editing-name]').textContent = name;
    form.querySelector('[data-editing-banner]').hidden = false;
    form.querySelector('[data-submit-label]').textContent = 'Save changes';
    const title = form.closest('.card-body').querySelector('[data-form-title]');
    if (title) title.textContent = `Edit ${SECTIONS[form.dataset.section].singular}`;

    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    form.querySelector('[name]:not([type="hidden"])')?.focus({ preventScroll: true });
  }

  // Shrinks large photos before they are stored inline in the database.
  async function fileToImageDataUrl(file) {
    const fallback = () => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read the image.'));
      reader.readAsDataURL(file);
    });

    if (typeof createImageBitmap !== 'function') return fallback();

    let bitmap;
    try { bitmap = await createImageBitmap(file); } catch { return fallback(); }

    const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const keepAlpha = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif';
    let dataUrl = canvas.toDataURL(keepAlpha ? 'image/png' : 'image/jpeg', 0.85);
    if (dataUrl.length > IMAGE_MAX_DATA_URL_LENGTH) dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    if (dataUrl.length > IMAGE_MAX_DATA_URL_LENGTH) throw new Error('That image is too large even after resizing. Try a smaller one.');
    return dataUrl;
  }

  // ---------------------------------------------------------------------------
  // Data loading and rendering
  // ---------------------------------------------------------------------------
  const state = { data: {} };

  function renderSection(section) {
    const config = SECTIONS[section];
    const body = document.querySelector(`[data-list="${section}"]`);
    const empty = document.querySelector(`[data-empty-for="${section}"]`);
    const count = document.querySelector(`[data-count="${section}"]`);
    const entries = Object.entries(state.data[section] || {}).map(([key, value]) => ({ ...value, __key: key }));

    body.replaceChildren(...entries.map((entry) => {
      const actions = el('td', { class: 'text-end' }, [
        el('div', { class: 'btn-group btn-group-sm', role: 'group' }, [
          el('button', { type: 'button', class: 'btn btn-outline-light', 'data-action': 'edit', 'data-key': entry.__key, text: 'Edit' }),
          el('button', { type: 'button', class: 'btn btn-outline-danger', 'data-action': 'delete', 'data-key': entry.__key, text: 'Delete' }),
        ]),
      ]);
      return el('tr', {}, [...config.columns(entry), actions]);
    }));

    empty.hidden = entries.length > 0;
    if (count) {
      count.textContent = String(entries.length);
      count.hidden = entries.length === 0;
    }
  }

  async function loadAll() {
    setState('Loading…');
    try {
      state.data = await api('GET', '/Admin/Data');
      document.getElementById('summaryText').value = state.data.summary?.summary || '';
      document.getElementById('summaryText').dispatchEvent(new Event('input'));
      Object.keys(SECTIONS).forEach(renderSection);
      setState('Up to date');
    } catch (error) {
      setState('Offline', 'error');
      toast(error.message, 'error');
    }
  }

  // ---------------------------------------------------------------------------
  // Wiring
  // ---------------------------------------------------------------------------
  function wireSummary() {
    const form = document.querySelector('[data-summary-form]');
    const textarea = document.getElementById('summaryText');
    const counter = document.querySelector('[data-char-count="summaryText"]');
    textarea.addEventListener('input', () => { counter.textContent = String(textarea.value.length); });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearErrors(form);
      setBusy(form, true);
      try {
        await api('PUT', '/Admin/Summary', { summary: textarea.value.trim() });
        toast('Summary saved.', 'success');
        state.data.summary = { summary: textarea.value.trim() };
      } catch (error) {
        showErrors(form, error.errors);
        toast(error.message, 'error');
      } finally {
        setBusy(form, false);
      }
    });
  }

  function wireEntryForm(form) {
    const section = form.dataset.section;
    const config = SECTIONS[section];

    form.querySelectorAll('[data-enables]').forEach((toggle) => {
      toggle.addEventListener('change', () => {
        const target = document.getElementById(toggle.dataset.enables);
        target.disabled = !toggle.checked;
        if (!toggle.checked) target.value = '';
        else target.focus();
      });
    });

    form.querySelectorAll('[data-image-for]').forEach((fileInput) => {
      fileInput.addEventListener('change', async () => {
        const hidden = document.getElementById(fileInput.dataset.imageFor);
        const file = fileInput.files?.[0];
        if (!file) return;
        try {
          setMediaValue(form, hidden, await fileToImageDataUrl(file));
        } catch (error) {
          toast(error.message, 'error');
          fileInput.value = '';
        }
      });
    });

    form.querySelectorAll('[data-clear-image], [data-clear-video]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.clearImage || button.dataset.clearVideo;
        setMediaValue(form, document.getElementById(id), '');
        form.querySelectorAll('input[type="file"]').forEach((input) => { input.value = ''; });
      });
    });

    form.querySelectorAll('[data-video-for]').forEach((fileInput) => {
      fileInput.addEventListener('change', () => {
        const hidden = document.getElementById(fileInput.dataset.videoFor);
        const file = fileInput.files?.[0];
        if (!file) return;
        // Preview locally; the actual upload happens on save.
        const preview = form.querySelector(`[data-preview-for="${hidden.id}"]`);
        preview.src = URL.createObjectURL(file);
        preview.closest('.admin-preview').hidden = false;
      });
    });

    form.querySelectorAll('[data-add-list-item]').forEach((button) => {
      button.addEventListener('click', () => {
        const container = form.querySelector(`[data-list-field="${button.dataset.addListItem}"]`);
        addListItem(container, '').querySelector('input').focus();
      });
    });

    form.querySelectorAll('input[type="range"]').forEach((input) => {
      input.addEventListener('input', () => syncRangeOutput(input));
    });

    form.querySelector('[data-cancel-edit]').addEventListener('click', () => resetEntryForm(form));
    form.addEventListener('reset', (event) => {
      event.preventDefault();
      resetEntryForm(form);
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      clearErrors(form);
      if (!form.reportValidity()) return;

      setBusy(form, true);
      const progress = form.querySelector('[data-upload-progress]');
      try {
        const videoInput = form.querySelector('[data-video-for]');
        const videoFile = videoInput?.files?.[0];
        if (videoFile) {
          const hidden = document.getElementById(videoInput.dataset.videoFor);
          progress.hidden = false;
          const bar = progress.querySelector('.progress-bar');
          const path = await uploadVideo(videoFile, (percent) => {
            bar.style.width = `${percent}%`;
            bar.setAttribute('aria-valuenow', String(percent));
          });
          hidden.value = path;
          videoInput.value = '';
        }

        const payload = readForm(form);
        const originalKey = form.dataset.originalKey;
        const query = originalKey ? `?originalKey=${encodeURIComponent(originalKey)}` : '';
        await api('POST', `/Admin/Sections/${section}${query}`, payload);

        toast(`${capitalise(config.singular)} saved.`, 'success');
        resetEntryForm(form);
        await loadAll();
      } catch (error) {
        showErrors(form, error.errors);
        toast(error.message, 'error');
      } finally {
        if (progress) progress.hidden = true;
        setBusy(form, false);
      }
    });

    resetEntryForm(form);
  }

  function wireTables() {
    document.querySelectorAll('[data-list]').forEach((body) => {
      const section = body.dataset.list;
      body.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const key = button.dataset.key;
        const entry = state.data[section]?.[key];
        if (!entry) return;

        const form = document.querySelector(`form[data-section="${section}"]`);
        const name = entry[form.dataset.nameField] || key;

        if (button.dataset.action === 'edit') {
          fillEntryForm(form, { ...entry, __key: key });
          return;
        }

        if (!(await confirmDelete(name))) return;
        button.disabled = true;
        try {
          await api('DELETE', `/Admin/Sections/${section}/${encodeURIComponent(key)}`);
          toast(`${capitalise(SECTIONS[section].singular)} deleted.`, 'success');
          if (form.dataset.originalKey === key) resetEntryForm(form);
          await loadAll();
        } catch (error) {
          toast(error.message, 'error');
          button.disabled = false;
        }
      });
    });
  }

  function wireTabs() {
    const storageKey = 'portfolio-admin-tab';
    const remembered = (() => { try { return window.localStorage.getItem(storageKey); } catch { return null; } })();
    const initial = window.location.hash.slice(1) || remembered;
    const trigger = initial && document.querySelector(`#adminTabs [data-bs-target="#${CSS.escape(initial)}"]`);
    if (trigger) bootstrap.Tab.getOrCreateInstance(trigger).show();

    document.querySelectorAll('#adminTabs [data-bs-toggle="tab"]').forEach((button) => {
      button.addEventListener('shown.bs.tab', () => {
        const id = button.dataset.bsTarget.slice(1);
        try { window.localStorage.setItem(storageKey, id); } catch { /* storage unavailable */ }
        window.history.replaceState(null, '', `#${id}`);
      });
    });
  }

  function capitalise(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  wireSummary();
  document.querySelectorAll('form[data-section]').forEach(wireEntryForm);
  wireTables();
  wireTabs();
  loadAll();
})();
