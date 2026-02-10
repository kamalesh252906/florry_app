import { api } from './api.js';

// Simple auth check
if (!localStorage.getItem('florrySuperAdmin')) {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('florrySuperAdmin');
    window.location.href = 'login.html';
}

async function loadData() {
    try {
        const [shops, supportMsgs] = await Promise.all([
            api.getPendingAdmins(),
            api.getSupportMessages()
        ]);

        renderShops(shops);
        renderSupportMessages(supportMsgs);

        // Update small stats
        const count = shops ? shops.length : 0;
        document.getElementById('stat-pending').textContent = count;
        document.getElementById('stat-shops').textContent = count;

    } catch (e) {
        console.error(e);
        alert("Failed to load command data");
    }
}

function renderShops(shops) {
    const container = document.getElementById('shop-approvals');
    if (!shops || shops.length === 0) {
        container.innerHTML = '<div class="empty-state">All shop nodes verified. No pending requests.</div>';
        return;
    }

    container.innerHTML = shops.map(shop => `
        <div class="approval-card">
            <div class="card-top">
                <h3 style="color: var(--super-dark);">${shop.shop_name || 'Unnamed Shop'}</h3>
                <span class="status-badge">${shop.status.toUpperCase()}</span>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
                    <span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">PRINCIPAL</span>
                    <span style="font-size: 0.9rem; font-weight: 700; color: var(--super-dark);">${shop.name}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9;">
                    <span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">SECURE IP</span>
                    <span style="font-size: 0.85rem; font-weight: 700; color: var(--super-accent); font-family: monospace;">${shop.email}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.8rem; color: #64748b; font-weight: 700;">COMM ID</span>
                    <span style="font-size: 0.9rem; font-weight: 700; color: var(--super-dark);">${shop.phone || 'N/A'}</span>
                </div>
            </div>
            
            <div class="aadhaar-link-box" onclick="window.open('${shop.aadhaar_image_url}')">
                <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
                    <div style="background: white; padding: 8px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"></rect><circle cx="9" cy="10" r="2"></circle><path d="M15 8h2"></path><path d="M15 12h2"></path><path d="M7 16h10"></path></svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 800; font-size: 0.85rem; color: var(--super-dark);">Identity Credentials</div>
                        <div style="font-size: 0.75rem; color: #64748b; letter-spacing: 1px;">XXXX-XXXX-${shop.aadhaar_number?.slice(-4) || 'XXXX'}</div>
                    </div>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </div>
            </div>

            <div class="action-btns">
                <button class="btn-action btn-reject" onclick="handleAction('admin', ${shop.admin_id}, 'reject')">Deny</button>
                <button class="btn-action btn-approve" onclick="handleAction('admin', ${shop.admin_id}, 'approve')">Authorize</button>
            </div>
        </div>
    `).join('');
}

function renderSupportMessages(msgs) {
    const container = document.getElementById('support-messages');
    if (!msgs || msgs.length === 0) {
        container.innerHTML = '<div class="empty-state">No active support inquiries. Clean slate!</div>';
        return;
    }

    container.innerHTML = msgs.map(msg => `
        <div class="approval-card" style="border-left: 5px solid ${msg.status === 'open' ? 'var(--super-accent)' : '#10b981'};">
            <div class="card-top">
                <h3 style="font-size: 1.1rem; letter-spacing: -0.5px;">${msg.subject}</h3>
                <span class="status-badge" style="background: ${msg.status === 'open' ? '#e0f2fe' : '#f0fdf4'}; color: ${msg.status === 'open' ? '#0369a1' : '#166534'};">
                    ${msg.status === 'open' ? 'PENDING' : 'RESOLVED'}
                </span>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; background: #f8fafc; padding: 10px 15px; border-radius: 12px;">
                <div style="width: 35px; height: 35px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: var(--super-dark); box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
                    ${msg.name.charAt(0)}
                </div>
                <div>
                    <div style="font-weight: 700; font-size: 0.9rem; color: var(--super-dark);">${msg.name}</div>
                    <div style="font-size: 0.75rem; color: var(--super-accent); font-weight: 600;">${msg.email}</div>
                </div>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="font-size: 0.7rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Transmission Content</div>
                <p style="margin: 0; color: #334155; line-height: 1.6; font-size: 0.95rem; font-weight: 500;">${msg.message}</p>
            </div>

            ${msg.reply ? `
                <div style="margin-top: 15px; padding: 15px; background: #f0fdf4; border-radius: 14px; border: 1px solid #dcfce7; position: relative;">
                    <div style="font-size: 0.65rem; font-weight: 900; color: #166534; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 2px;">Administrator Directive</div>
                    <p style="margin: 0; font-size: 0.9rem; color: #064e3b; font-weight: 600; line-height: 1.5;">${msg.reply}</p>
                </div>
            ` : `
                <div id="reply-box-${msg.message_id}" style="margin-top: 20px;">
                    <textarea id="reply-text-${msg.message_id}" placeholder="Enter administrator response..." style="width: 100%; padding: 15px; border: 2px solid #f1f5f9; border-radius: 14px; font-family: inherit; font-size: 0.9rem; min-height: 100px; resize: none; margin-bottom: 12px; transition: all 0.2s;" onfocus="this.style.borderColor='var(--super-accent)'" onblur="this.style.borderColor='#f1f5f9'"></textarea>
                    <button class="btn btn-approve submit-reply-btn" data-msg-id="${msg.message_id}" style="width: 100%; background: var(--super-dark); padding: 14px; border-radius: 12px;">Transmit Response</button>
                </div>
            `}
            
            <div style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                <button class="purge-log-btn" data-msg-id="${msg.message_id}" style="border: none; background: #fee2e2; color: #dc2626; padding: 8px 14px; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">PURGE LOG</button>
                <div style="font-size: 0.75rem; color: #94a3b8; font-weight: 600; font-family: monospace;">
                    ${new Date(msg.created_at).toLocaleDateString()} | ${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    `).join('');

    // Attach listeners to newly rendered elements
    document.querySelectorAll('.submit-reply-btn').forEach(btn => {
        btn.onclick = () => submitReply(btn.dataset.msgId);
    });
    document.querySelectorAll('.purge-log-btn').forEach(btn => {
        btn.onclick = () => deleteTicket(btn.dataset.msgId);
    });
}


async function deleteTicket(msgId) {
    if (!confirm("Are you sure you want to permanently delete this support ticket?")) return;
    try {
        await api.deleteSupportMessage(msgId);
        alert("Ticket deleted successfully.");
        loadData();
    } catch (e) {
        alert("Failed to delete: " + e.message);
    }
}

async function submitReply(msgId) {
    const text = document.getElementById(`reply-text-${msgId}`).value;
    if (!text) return alert("Please type a response.");

    try {
        const btn = document.querySelector(`#reply-box-${msgId} .btn`);
        btn.disabled = true;
        btn.textContent = "Sending...";

        await api.replyToSupportMessage(msgId, text);
        alert("Response sent successfully!");
        loadData(); // Reload UI
    } catch (e) {
        alert("Failed: " + e.message);
    }
}

async function handleAction(type, id, action) {
    if (!confirm(`Proceed with ${action} for this ${type}?`)) return;

    try {
        if (type === 'admin') {
            if (action === 'approve') await api.approveAdmin(id);
            else await api.rejectAdmin(id);
        } else {
            if (action === 'approve') await api.approveRider(id);
            else await api.rejectRider(id);
        }
        loadData(); // Reload
    } catch (e) {
        alert(e.message);
    }
}

// Attach to document
document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // Logout Link
    const logoutBtn = document.getElementById('super-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    }

    // Refresh Broadcast Button
    const refreshBtn = document.getElementById('super-refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadData();
        });
    }
});


// Since the map function generates strings with onclick, we need to expose these to global or rewrite rendering
// Rewriting rendering to use event delegation or after-render attachment is better.
// For now, I'll expose them to window as before to keep it simple and working.
window.handleAction = handleAction;
window.submitReply = submitReply;
window.deleteTicket = deleteTicket;
window.loadData = loadData;
window.logout = logout;
