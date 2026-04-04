// ============================================================
//  Passport Automation System — app.js
//  Professional SPA controller
// ============================================================

// ── Global State ─────────────────────────────────────────────
let currentUser        = null;
let currentApplication = null;
let selectedAppId      = null;   // used by officer modals

const API = '/api';

// ── Toast Notification System ─────────────────────────────────
/**
 * Show a non-blocking toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration  ms before auto-dismiss
 */
function showToast(message, type = 'info', duration = 4000) {
    const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
    const container = document.getElementById('toast-container');

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

// ── View / Modal Utilities ────────────────────────────────────
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function showModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal when clicking the grey backdrop
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    if (tab === 'login') {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-login').setAttribute('aria-selected', 'true');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('tab-register').setAttribute('aria-selected', 'true');
        document.getElementById('register-form').classList.add('active');
    }
}

function showFileSelected(input) {
    const msg = document.getElementById('file-selected-msg');
    if (input.files && input.files[0]) {
        msg.textContent = `✓ ${input.files[0].name} (${(input.files[0].size / 1024).toFixed(0)} KB)`;
        msg.style.display = 'block';
    } else {
        msg.style.display = 'none';
    }
}

// ── Button Loading State Helpers ──────────────────────────────
function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (loading) {
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span>';
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
        btn.disabled = false;
    }
}

// ── Auth ──────────────────────────────────────────────────────
async function handleLogin(e) {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    setLoading('btn-login-submit', true);
    try {
        const res = await fetch(`${API}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Invalid credentials');
        }
        currentUser = await res.json();
        updateNav();
        routeUser();
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
    } catch (err) {
        showToast('Login failed: ' + err.message, 'error');
    } finally {
        setLoading('btn-login-submit', false);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const payload = {
        name:        document.getElementById('reg-name').value.trim(),
        email:       document.getElementById('reg-email').value.trim(),
        password:    document.getElementById('reg-password').value,
        dob:         document.getElementById('reg-dob').value,
        nationality: document.getElementById('reg-nationality').value.trim(),
        address:     document.getElementById('reg-address').value.trim()
    };

    setLoading('btn-register-submit', true);
    try {
        const res = await fetch(`${API}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Registration failed');
        }
        showToast('Account created! Please log in.', 'success');
        switchTab('login');
        document.getElementById('login-email').value = payload.email;
    } catch (err) {
        showToast('Registration failed: ' + err.message, 'error');
    } finally {
        setLoading('btn-register-submit', false);
    }
}

function logout() {
    currentUser        = null;
    currentApplication = null;
    selectedAppId      = null;
    document.getElementById('nav-user-info').style.display = 'none';
    showView('auth-view');
    showToast('You have been logged out.', 'info');
}

function updateNav() {
    if (!currentUser) return;
    document.getElementById('nav-user-info').style.display = 'flex';
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-role').textContent = currentUser.role.replace(/_/g, ' ');
}

function routeUser() {
    switch (currentUser.role) {
        case 'APPLICANT':
            showView('applicant-view');
            loadApplicantData();
            break;
        case 'PASSPORT_OFFICER':
            showView('officer-view');
            loadOfficerData();
            break;
        case 'POLICE_OFFICER':
            showView('police-view');
            loadPoliceData();
            break;
        case 'ADMIN':
            showView('admin-view');
            loadAdminData();
            break;
        default:
            showToast('Unknown role. Please contact admin.', 'error');
    }
}

// ── Applicant Functions ───────────────────────────────────────
async function loadApplicantData() {
    try {
        const res  = await fetch(`${API}/applications/applicant/${currentUser.userID}`);
        const apps = await res.json();

        if (apps && apps.length > 0) {
            currentApplication = apps[apps.length - 1];
            renderApplicationStatus();
        } else {
            document.getElementById('no-application-msg').style.display  = 'block';
            document.getElementById('application-details').style.display = 'none';
        }
    } catch (err) {
        console.error('Failed to load applicant data:', err);
        showToast('Could not load application data.', 'error');
    }
}

async function submitApplication() {
    const payload = {
        applicant:   { userID: currentUser.userID },
        address:     currentUser.address,
        dob:         currentUser.dob,
        nationality: currentUser.nationality
    };

    setLoading('btn-submit-app', true);
    try {
        const res = await fetch(`${API}/applications`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Application submission failed');
        closeModal('apply-modal');
        await loadApplicantData();
        showToast('Application submitted successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        setLoading('btn-submit-app', false);
    }
}

function renderApplicationStatus() {
    document.getElementById('no-application-msg').style.display  = 'none';
    document.getElementById('application-details').style.display = 'block';

    document.getElementById('app-id-display').textContent =
        `Application #${currentApplication.applicationID}`;

    const badge = document.getElementById('app-status-badge');
    badge.textContent = currentApplication.status.replace(/_/g, ' ');
    badge.className   = `status-badge status-${currentApplication.status}`;

    updateTimeline(currentApplication.status);
    updateActions(currentApplication.status);
    loadApplicantDocs();
}

function updateTimeline(status) {
    const steps = [
        'SUBMITTED',
        'DOCUMENTS_UPLOADED',
        'PAYMENT_CONFIRMED',
        'POLICE_VERIFICATION_PENDING',
        'POLICE_VERIFIED',
        'APPROVED',
        'PASSPORT_ISSUED'
    ];

    let reachedActive = false;
    steps.forEach(s => {
        const el = document.getElementById(`step-${s}`);
        if (!el) return;
        el.className = 'timeline-step';

        if (reachedActive) {
            // nothing — future step stays greyed out
        } else if (s === status) {
            el.classList.add('active');
            reachedActive = true;
            if (s === 'PASSPORT_ISSUED') el.classList.add('completed');
        } else {
            el.classList.add('completed');
        }
    });
}

function updateActions(status) {
    const show = (id, condition) => {
        const el = document.getElementById(id);
        if (el) el.style.display = condition ? 'inline-flex' : 'none';
    };

    show('btn-upload-docs',
        status === 'SUBMITTED' || status === 'DOCUMENTS_UPLOADED');
    show('btn-pay',
        status === 'DOCUMENTS_UPLOADED' || status === 'PAYMENT_FAILED');
    show('btn-appointment',
        status === 'PAYMENT_CONFIRMED' ||
        status === 'POLICE_VERIFICATION_PENDING' ||
        status === 'POLICE_VERIFIED');
    show('btn-view-passport',
        status === 'PASSPORT_ISSUED');
}

// ── Document Upload (Real FormData) ──────────────────────────
function openDocsModal() {
    document.getElementById('docs-form').reset();
    document.getElementById('file-selected-msg').style.display = 'none';
    loadApplicantDocs();
    showModal('docs-modal');
}

async function handleDocUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('doc-file');
    const file      = fileInput.files[0];
    const type      = document.getElementById('doc-type').value;

    if (!file) {
        showToast('Please select a file to upload.', 'warning');
        return;
    }

    // Build multipart/form-data payload — real file bytes go here
    const formData = new FormData();
    formData.append('applicationId', currentApplication.applicationID);
    formData.append('documentType', type);
    formData.append('file', file);

    setLoading('btn-doc-upload-submit', true);
    try {
        const res = await fetch(`${API}/documents`, {
            method: 'POST',
            body:   formData   // Do NOT set Content-Type header — browser sets boundary automatically
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Upload failed');
        }
        showToast(`"${file.name}" uploaded successfully!`, 'success');
        document.getElementById('docs-form').reset();
        document.getElementById('file-selected-msg').style.display = 'none';
        await loadApplicantData();  // refresh status + docs list
        loadApplicantDocs();
    } catch (err) {
        showToast('Upload error: ' + err.message, 'error');
    } finally {
        setLoading('btn-doc-upload-submit', false);
    }
}

async function loadApplicantDocs() {
    if (!currentApplication) return;
    try {
        const res  = await fetch(`${API}/documents/${currentApplication.applicationID}`);
        const docs = await res.json();
        const list = document.getElementById('applicant-docs-list');
        list.innerHTML = '';

        if (docs.length === 0) {
            list.innerHTML = '<li class="text-muted">No documents uploaded yet.</li>';
            return;
        }

        docs.forEach(d => {
            const statusColor = d.verificationStatus === 'VERIFIED'
                ? 'var(--success)'
                : d.verificationStatus === 'REJECTED'
                    ? 'var(--danger)'
                    : 'var(--warning)';

            list.innerHTML += `
                <li>
                    <span>
                        <strong>${d.documentType.replace(/_/g,' ')}</strong>
                        ${d.fileName ? `<br><small class="text-muted">${d.fileName}</small>` : ''}
                    </span>
                    <span style="color:${statusColor};font-weight:700;">${d.verificationStatus}</span>
                </li>`;
        });
    } catch (err) {
        console.error('Could not load document list:', err);
    }
}

// ── Payment ───────────────────────────────────────────────────
async function processPayment(success) {
    setLoading(success ? 'btn-pay-confirm' : 'btn-pay-cancel', true);
    try {
        const res = await fetch(`${API}/payments?simulateSuccess=${success}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                application: { applicationID: currentApplication.applicationID },
                amount: 1500.0
            })
        });
        if (!res.ok) throw new Error('Payment request failed');
        closeModal('payment-modal');
        await loadApplicantData();
        showToast(
            success ? 'Payment of ₹1,500 confirmed!' : 'Payment cancelled.',
            success ? 'success' : 'warning'
        );
    } catch (err) {
        showToast('Payment error: ' + err.message, 'error');
    } finally {
        setLoading(success ? 'btn-pay-confirm' : 'btn-pay-cancel', false);
    }
}

// ── Appointment (Real Backend) ────────────────────────────────
async function scheduleAppointment(e) {
    e.preventDefault();
    const dateTimeVal = document.getElementById('appointment-time').value;
    const notes       = document.getElementById('appointment-notes').value.trim();

    if (!dateTimeVal) {
        showToast('Please select a date and time.', 'warning');
        return;
    }

    setLoading('btn-appt-submit', true);
    try {
        const res = await fetch(`${API}/appointments`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                applicationId:       currentApplication.applicationID,
                appointmentDateTime: dateTimeVal,   // ISO local: "2025-05-10T10:30"
                notes:               notes || null
            })
        });
        if (!res.ok) throw new Error('Could not schedule appointment');
        const appt = await res.json();

        closeModal('appointment-modal');

        // Show confirmation inline in the dashboard
        const box = document.getElementById('appt-confirm-box');
        const dt  = new Date(appt.appointmentDateTime);
        box.innerHTML = `&#10003; Appointment confirmed for <strong>${dt.toLocaleString()}</strong>. Please bring originals of all uploaded documents.`;
        box.style.display = 'block';

        showToast('Appointment scheduled!', 'success');
    } catch (err) {
        showToast('Appointment error: ' + err.message, 'error');
    } finally {
        setLoading('btn-appt-submit', false);
    }
}

// ── View Passport ─────────────────────────────────────────────
async function viewMyPassport() {
    try {
        const res = await fetch(`${API}/passport/${currentApplication.applicationID}`);
        if (!res.ok) throw new Error('Passport not found');
        const passport = await res.json();

        document.getElementById('pp-number').textContent      = passport.passportNumber;
        document.getElementById('pp-nationality').textContent = currentApplication.nationality || 'INDIAN';
        document.getElementById('pp-name').textContent        = currentUser.name;
        document.getElementById('pp-dob').textContent         = formatDate(currentApplication.dob || currentUser.dob);
        document.getElementById('pp-issue').textContent       = formatDate(passport.issueDate);
        document.getElementById('pp-expiry').textContent      = formatDate(passport.expiryDate);
        document.getElementById('pp-address').textContent     = currentApplication.address || currentUser.address || '—';

        showModal('passport-modal');
    } catch (err) {
        showToast('Could not load passport: ' + err.message, 'error');
    }
}

function downloadPassportPDF() {
    const element = document.getElementById('passport-card');
    html2pdf().set({
        margin:      0.5,
        filename:    `Passport_${currentUser.name.replace(/\s+/g, '_')}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF:       { unit: 'in', format: 'letter', orientation: 'landscape' }
    }).from(element).save();
}

// ── Passport Officer Functions ────────────────────────────────
async function loadOfficerData() {
    const tbody = document.getElementById('officer-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">Loading…</td></tr>';

    try {
        const res  = await fetch(`${API}/applications`);
        const apps = await res.json();
        tbody.innerHTML = '';

        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">No applications yet.</td></tr>';
            return;
        }

        apps.forEach(app => {
            let actions = '';

            if (app.status !== 'SUBMITTED') {
                actions += `<button class="btn btn-ghost btn-sm mx-1" onclick="openVerifyDocsModal(${app.applicationID})" title="Review uploaded documents">
                                &#128196; Docs
                            </button>`;
            }
            if (app.status === 'PAYMENT_CONFIRMED') {
                actions += `<button class="btn btn-secondary btn-sm mx-1" onclick="openPoliceInitModal(${app.applicationID})" title="Send to police for verification">
                                &#128170; Police Verify
                            </button>`;
            }
            if (app.status === 'POLICE_VERIFIED') {
                actions += `<button class="btn btn-success btn-sm mx-1" onclick="officerApprove(${app.applicationID})" title="Approve this application">
                                &#10003; Approve
                            </button>`;
            }
            if (app.status === 'APPROVED') {
                actions += `<button class="btn btn-primary btn-sm mx-1" onclick="officerIssue(${app.applicationID})" title="Issue the passport">
                                &#127891; Issue Passport
                            </button>`;
            }

            tbody.innerHTML += `
                <tr>
                    <td><strong>#${app.applicationID}</strong></td>
                    <td>${app.applicant.name}</td>
                    <td>${formatDate(app.applicationDate)}</td>
                    <td><span class="status-badge status-${app.status}">${app.status.replace(/_/g,' ')}</span></td>
                    <td>${actions || '<span class="text-muted">—</span>'}</td>
                </tr>`;
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;">Failed to load data.</td></tr>';
        showToast('Error loading officer data.', 'error');
    }
}

function openPoliceInitModal(id) {
    selectedAppId = id;
    showModal('officer-police-init-modal');
}

async function initiatePoliceVerification() {
    const station = document.getElementById('police-station-select').value;
    setLoading('btn-police-send', true);
    try {
        const res = await fetch(`${API}/police-verification`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ applicationId: selectedAppId, policeStation: station })
        });
        if (!res.ok) throw new Error('Could not initiate verification');
        closeModal('officer-police-init-modal');
        await loadOfficerData();
        showToast(`Police verification request sent to ${station}.`, 'success');
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    } finally {
        setLoading('btn-police-send', false);
    }
}

async function openVerifyDocsModal(appId) {
    const container = document.getElementById('officer-docs-container');
    container.innerHTML = '<p class="text-muted">Loading documents…</p>';
    showModal('officer-verify-modal');

    try {
        const res  = await fetch(`${API}/documents/${appId}`);
        const docs = await res.json();
        container.innerHTML = '';

        if (docs.length === 0) {
            container.innerHTML = '<p class="text-muted">No documents uploaded for this application yet.</p>';
            return;
        }

        docs.forEach(d => {
            const isPending = d.verificationStatus === 'PENDING';
            const badgeClass = d.verificationStatus === 'VERIFIED'
                ? 'status-APPROVED'
                : d.verificationStatus === 'REJECTED'
                    ? 'status-REJECTED'
                    : 'status-DOCUMENTS_UPLOADED';

            // Build a preview/download link if file data exists (fileName present)
            const previewLink = d.fileName
                ? `<a href="${API}/documents/${d.documentID}/download"
                        target="_blank"
                        class="btn btn-ghost btn-sm"
                        title="Open document in new tab">
                        &#128065; View File
                    </a>`
                : '';

            container.innerHTML += `
                <div class="doc-review-card">
                    <div class="doc-meta">
                        <strong>${d.documentType.replace(/_/g,' ')}</strong>
                        <small>
                            ${d.fileName ? `File: ${d.fileName}` : 'No file attached'}
                            ${d.uploadedAt ? ` &bull; Uploaded: ${formatDate(d.uploadedAt)}` : ''}
                        </small>
                    </div>
                    <div class="doc-actions">
                        <span class="status-badge ${badgeClass}">${d.verificationStatus}</span>
                        ${previewLink}
                        ${isPending ? `
                            <button class="btn btn-success btn-sm" onclick="verifyDoc(${d.documentID}, 'VERIFIED')">&#10003; Approve</button>
                            <button class="btn btn-danger btn-sm"  onclick="verifyDoc(${d.documentID}, 'REJECTED')">&#10005; Reject</button>
                        ` : ''}
                    </div>
                </div>`;
        });
    } catch (err) {
        container.innerHTML = '<p class="text-muted">Failed to load documents.</p>';
    }
}

async function verifyDoc(docId, status) {
    try {
        const res = await fetch(`${API}/documents/${docId}/verify`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ status })
        });
        if (!res.ok) throw new Error('Verification update failed');
        showToast(`Document marked as ${status}.`, status === 'VERIFIED' ? 'success' : 'warning');

        // Refresh just the modal content — get the appId from the open modal context
        const container = document.getElementById('officer-docs-container');
        const firstCard = container.querySelector('.doc-review-card');
        // Re-render by re-fetching; we need app id — extract from existing fetch above
        // Simplest: close and let officer reopen
        closeModal('officer-verify-modal');
        loadOfficerData();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

async function officerApprove(appId) {
    if (!confirm(`Approve Application #${appId}?`)) return;
    try {
        const res = await fetch(`${API}/passport/approve/${appId}`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }
        await loadOfficerData();
        showToast(`Application #${appId} approved!`, 'success');
    } catch (err) {
        showToast('Approval failed: ' + err.message, 'error');
    }
}

async function officerIssue(appId) {
    if (!confirm(`Issue passport for Application #${appId}?`)) return;
    try {
        const res = await fetch(`${API}/passport/issue/${appId}`, { method: 'POST' });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message);
        }
        await loadOfficerData();
        showToast(`Passport issued for Application #${appId}!`, 'success');
    } catch (err) {
        showToast('Issuance failed: ' + err.message, 'error');
    }
}

// ── Police Officer Functions ──────────────────────────────────
async function loadPoliceData() {
    const tbody = document.getElementById('police-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">Loading…</td></tr>';

    try {
        const res = await fetch(`${API}/police-verification/pending`);
        const pvs = await res.json();
        tbody.innerHTML = '';

        if (pvs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;padding:2rem;">No pending verifications.</td></tr>';
            return;
        }

        pvs.forEach(pv => {
            tbody.innerHTML += `
                <tr>
                    <td><strong>#${pv.verificationID}</strong></td>
                    <td>
                        App <strong>#${pv.application.applicationID}</strong><br>
                        <small class="text-muted">${pv.application.applicant ? pv.application.applicant.name : ''}</small>
                    </td>
                    <td>${pv.policeStation}</td>
                    <td>${formatDateTime(pv.date)}</td>
                    <td>
                        <button class="btn btn-success btn-sm mx-1"
                            onclick="submitPoliceReport(${pv.verificationID}, 'CLEAR')"
                            title="Mark this application CLEAR">
                            &#10003; Clear
                        </button>
                        <button class="btn btn-danger btn-sm mx-1"
                            onclick="submitPoliceReport(${pv.verificationID}, 'ADVERSE')"
                            title="Mark ADVERSE (will reject application)">
                            &#10005; Adverse
                        </button>
                    </td>
                </tr>`;
        });
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-muted" style="text-align:center;">Failed to load.</td></tr>';
        showToast('Error loading police queue.', 'error');
    }
}

async function submitPoliceReport(id, report) {
    if (!confirm(`Submit ${report} report for Verification #${id}?`)) return;
    try {
        const res = await fetch(`${API}/police-verification/${id}/report`, {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ report })
        });
        if (!res.ok) throw new Error('Report submission failed');
        await loadPoliceData();
        showToast(
            report === 'CLEAR'
                ? `Verification #${id} marked CLEAR — application progressed.`
                : `Verification #${id} marked ADVERSE — application will be rejected.`,
            report === 'CLEAR' ? 'success' : 'warning'
        );
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
}

// ── Admin Functions ───────────────────────────────────────────
async function loadAdminData() {
    try {
        const res  = await fetch(`${API}/admin/report`);
        const data = await res.json();

        const statsDiv = document.getElementById('admin-stats');
        statsDiv.innerHTML = `
            <div class="stat-card">
                <h3>${data.totalApplications}</h3>
                <p>Total Applications</p>
            </div>`;

        for (const [status, count] of Object.entries(data.statusCounts)) {
            statsDiv.innerHTML += `
                <div class="stat-card">
                    <h3>${count}</h3>
                    <p>${status.replace(/_/g,' ')}</p>
                </div>`;
        }

        const tbody = document.getElementById('admin-users-table');
        tbody.innerHTML = '';
        data.users.forEach(u => {
            tbody.innerHTML += `
                <tr>
                    <td>${u.userID || u.id || '—'}</td>
                    <td>${u.name}</td>
                    <td>${u.email}</td>
                    <td><span class="badge">${u.role.replace(/_/g,' ')}</span></td>
                </tr>`;
        });
    } catch (err) {
        showToast('Error loading admin report.', 'error');
    }
}

// ── Date Formatting Helpers ───────────────────────────────────
function formatDate(value) {
    if (!value) return '—';
    try {
        const d = Array.isArray(value)
            ? new Date(value[0], value[1] - 1, value[2])
            : new Date(value);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return String(value); }
}

function formatDateTime(value) {
    if (!value) return '—';
    try {
        const d = Array.isArray(value)
            ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0)
            : new Date(value);
        return d.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
    } catch { return String(value); }
}
