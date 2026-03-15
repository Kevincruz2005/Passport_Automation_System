// Global State
let currentUser = null;
let currentApplication = null;
let selectedApplicationId = null;

// API Base
const API = '/api';

// Utilities
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

function showModal(modalId) { document.getElementById(modalId).style.display = 'block'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

// Auth Logic
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error((await res.json()).message);
        
        currentUser = await res.json();
        updateNav();
        routeUser();
    } catch (err) {
        alert("Login failed: " + err.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        dob: document.getElementById('reg-dob').value,
        nationality: document.getElementById('reg-nationality').value,
        address: document.getElementById('reg-address').value
    };

    try {
        const res = await fetch(`${API}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error((await res.json()).message);
        
        alert("Registration successful! Please login.");
        switchTab('login');
    } catch (err) {
        alert("Registration failed: " + err.message);
    }
}

function logout() {
    currentUser = null;
    currentApplication = null;
    document.getElementById('nav-user-info').style.display = 'none';
    showView('auth-view');
}

function updateNav() {
    if (currentUser) {
        document.getElementById('nav-user-info').style.display = 'flex';
        document.getElementById('user-name').innerText = currentUser.name;
        document.getElementById('user-role').innerText = currentUser.role;
    }
}

function routeUser() {
    switch(currentUser.role) {
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
    }
}

// Applicant Functions
async function loadApplicantData() {
    try {
        const res = await fetch(`${API}/applications/applicant/${currentUser.userID}`);
        const apps = await res.json();
        
        if (apps && apps.length > 0) {
            currentApplication = apps[apps.length - 1]; // get latest
            renderApplicationStatus();
        } else {
            document.getElementById('no-application-msg').style.display = 'block';
            document.getElementById('application-details').style.display = 'none';
        }
    } catch (err) {
        console.error(err);
    }
}

async function submitApplication() {
    const payload = {
        applicant: { userID: currentUser.userID },
        address: currentUser.address,
        dob: currentUser.dob,
        nationality: currentUser.nationality
    };
    
    try {
        const res = await fetch(`${API}/applications`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            closeModal('apply-modal');
            loadApplicantData();
        }
    } catch (err) { alert(err); }
}

function renderApplicationStatus() {
    document.getElementById('no-application-msg').style.display = 'none';
    document.getElementById('application-details').style.display = 'block';
    
    document.getElementById('app-id-display').innerText = `Application #${currentApplication.applicationID}`;
    
    const statusObj = document.getElementById('app-status-badge');
    statusObj.innerText = currentApplication.status.replace(/_/g, ' ');
    statusObj.className = `status-badge status-${currentApplication.status}`;
    
    updateTimeline(currentApplication.status);
    updateActions(currentApplication.status);
    
    // load docs if needed
    loadApplicantDocs();
}

function updateTimeline(status) {
    const steps = ['SUBMITTED', 'DOCUMENTS_UPLOADED', 'PAYMENT_CONFIRMED', 'POLICE_VERIFIED', 'APPROVED', 'PASSPORT_ISSUED'];
    let reached = true;
    
    steps.forEach(s => {
        let el = document.getElementById(`step-${s}`);
        if(el) {
            el.className = 'timeline-step';
            if (s === status) {
                el.classList.add('active');
                reached = false;
            } else if (reached) {
                el.classList.add('completed');
            }
        }
    });

    if(status === 'PASSPORT_ISSUED') document.getElementById('step-PASSPORT_ISSUED').className = 'timeline-step completed active';
}

function updateActions(status) {
    document.getElementById('btn-upload-docs').style.display = (status === 'SUBMITTED' || status === 'DOCUMENTS_UPLOADED') ? 'inline-block' : 'none';
    document.getElementById('btn-pay').style.display = (status === 'DOCUMENTS_UPLOADED' || status === 'PAYMENT_FAILED') ? 'inline-block' : 'none';
    document.getElementById('btn-appointment').style.display = (status === 'PAYMENT_CONFIRMED' || status === 'POLICE_VERIFIED') ? 'inline-block' : 'none';
    document.getElementById('btn-view-passport').style.display = (status === 'PASSPORT_ISSUED') ? 'inline-block' : 'none';
}

async function handleDocUpload(e) {
    e.preventDefault();
    const type = document.getElementById('doc-type').value;
    
    try {
        await fetch(`${API}/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                application: { applicationID: currentApplication.applicationID },
                documentType: type
            })
        });
        alert('Document uploaded successfully!');
        closeModal('docs-modal');
        await loadApplicantData(); // completely refresh state and UI
    } catch(err) { alert(err); }
}

async function loadApplicantDocs() {
    if(!currentApplication) return;
    const res = await fetch(`${API}/documents/${currentApplication.applicationID}`);
    const docs = await res.json();
    const list = document.getElementById('applicant-docs-list');
    list.innerHTML = '';
    docs.forEach(d => {
        list.innerHTML += `<li>${d.documentType} - <span style="color:${d.verificationStatus==='VERIFIED'?'green':'blue'}">${d.verificationStatus}</span></li>`;
    });
}

async function processPayment(success) {
    try {
        await fetch(`${API}/payments?simulateSuccess=${success}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                application: { applicationID: currentApplication.applicationID },
                amount: 1500.0
            })
        });
        closeModal('payment-modal');
        loadApplicantData();
    } catch (err) { alert(err); }
}

function scheduleAppointment() {
    alert("Appointment successfully scheduled locally! Please bring original documents.");
    closeModal('appointment-modal');
}

async function viewMyPassport() {
    try {
        const res = await fetch(`${API}/passport/${currentApplication.applicationID}`);
        if(res.ok) {
            const passport = await res.json();
            alert(`PASSPORT ISSUED!\n\nNo: ${passport.passportNumber}\nIssue: ${passport.issueDate}\nExpiry: ${passport.expiryDate}`);
        }
    } catch (err) { alert("Error fetching passport"); }
}

// Passport Officer Functions
async function loadOfficerData() {
    const res = await fetch(`${API}/applications`);
    const apps = await res.json();
    const tbody = document.getElementById('officer-table-body');
    tbody.innerHTML = '';
    
    apps.forEach(app => {
        let actionBtns = '';
        if (app.status === 'PAYMENT_CONFIRMED') {
            actionBtns += `<button class="btn btn-primary btn-sm mx-1" onclick="openPoliceInitModal(${app.applicationID})">Police Verify</button>`;
        }
        if (app.status !== 'SUBMITTED') {
            actionBtns += `<button class="btn btn-secondary btn-sm mx-1" onclick="openVerifyDocsModal(${app.applicationID})">Docs</button>`;
        }
        if (app.status === 'POLICE_VERIFIED') {
            actionBtns += `<button class="btn btn-success btn-sm mx-1" onclick="officerApprove(${app.applicationID})">Approve</button>`;
        }
        if (app.status === 'APPROVED') {
            actionBtns += `<button class="btn btn-primary btn-sm mx-1" onclick="officerIssue(${app.applicationID})">Issue Passport</button>`;
        }
        
        tbody.innerHTML += `<tr>
            <td>${app.applicationID}</td>
            <td>${app.applicant.name}</td>
            <td>${new Date(app.applicationDate).toLocaleDateString()}</td>
            <td><span class="status-badge status-${app.status}">${app.status.replace(/_/g, ' ')}</span></td>
            <td>${actionBtns}</td>
        </tr>`;
    });
}

function openPoliceInitModal(id) {
    selectedApplicationId = id;
    showModal('officer-police-init-modal');
}

async function initiatePoliceVerification() {
    const station = document.getElementById('police-station-select').value;
    try {
        await fetch(`${API}/police-verification`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId: selectedApplicationId, policeStation: station })
        });
        closeModal('officer-police-init-modal');
        loadOfficerData();
    } catch (err) { alert(err); }
}

async function openVerifyDocsModal(id) {
    const res = await fetch(`${API}/documents/${id}`);
    const docs = await res.json();
    
    const container = document.getElementById('officer-docs-container');
    container.innerHTML = '';
    
    if(docs.length === 0) container.innerHTML = '<p>No documents uploaded yet.</p>';
    
    docs.forEach(d => {
        container.innerHTML += `
            <div style="border:1px solid #ddd; padding:10px; margin-bottom:10px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>${d.documentType}</strong><br>
                    Status: <em>${d.verificationStatus}</em>
                </div>
                ${d.verificationStatus === 'PENDING' ? `
                    <div>
                        <button class="btn btn-success" onclick="verifyDoc(${d.documentID}, 'VERIFIED')">Approve</button>
                        <button class="btn btn-danger" onclick="verifyDoc(${d.documentID}, 'REJECTED')">Reject</button>
                    </div>
                ` : ''}
            </div>
        `;
    });
    showModal('officer-verify-modal');
}

async function verifyDoc(docId, status) {
    await fetch(`${API}/documents/${docId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    // close and refresh
    closeModal('officer-verify-modal');
    // loadOfficerData(); // optional
}

async function officerApprove(appId) {
    if(confirm("Approve this application?")) {
        await fetch(`${API}/passport/approve/${appId}`, { method: 'POST' });
        loadOfficerData();
    }
}

async function officerIssue(appId) {
    if(confirm("Generate and issue passport?")) {
        await fetch(`${API}/passport/issue/${appId}`, { method: 'POST' });
        loadOfficerData();
    }
}

// Police Officer Functions
async function loadPoliceData() {
    const res = await fetch(`${API}/police-verification/pending`);
    const pvs = await res.json();
    const tbody = document.getElementById('police-table-body');
    tbody.innerHTML = '';
    
    pvs.forEach(pv => {
        tbody.innerHTML += `<tr>
            <td>${pv.verificationID}</td>
            <td>App #${pv.application.applicationID} <br> ${pv.application.address}</td>
            <td>${pv.policeStation}</td>
            <td>${new Date(pv.date).toLocaleString()}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="submitPoliceReport(${pv.verificationID}, 'CLEAR')">Mark CLEAR</button>
                <button class="btn btn-danger btn-sm" onclick="submitPoliceReport(${pv.verificationID}, 'ADVERSE')">Mark ADVERSE</button>
            </td>
        </tr>`;
    });
}

async function submitPoliceReport(id, report) {
    if(confirm(`Submit ${report} report?`)) {
        await fetch(`${API}/police-verification/${id}/report`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ report })
        });
        loadPoliceData();
    }
}

// Admin Functions
async function loadAdminData() {
    const res = await fetch(`${API}/admin/report`);
    const data = await res.json();
    
    const statsDiv = document.getElementById('admin-stats');
    statsDiv.innerHTML = `<div class="stat-card"><h3>${data.totalApplications}</h3><p>Total Applications</p></div>`;
    
    for (const [status, count] of Object.entries(data.statusCounts)) {
        statsDiv.innerHTML += `
            <div class="stat-card">
                <h3 style="color:var(--primary-blue)">${count}</h3>
                <p>${status.replace(/_/g, ' ')}</p>
            </div>
        `;
    }
    
    const tbody = document.getElementById('admin-users-table');
    tbody.innerHTML = '';
    data.users.forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.userID || u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="badge">${u.role}</span></td>
            </tr>
        `;
    });
}
