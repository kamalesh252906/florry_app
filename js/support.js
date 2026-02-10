import { api } from './api.js';

const supUser = JSON.parse(localStorage.getItem('florryUser'));

document.addEventListener('DOMContentLoaded', () => {
    if (supUser) {
        const nameField = document.getElementById('sup-name');
        const emailField = document.getElementById('sup-email');
        if (nameField) nameField.value = supUser.name || '';
        if (emailField) emailField.value = supUser.email || '';
        loadTickets();
    }

    const form = document.getElementById('support-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = e.target.querySelector('button');
            const originalText = btn.textContent;

            try {
                btn.disabled = true;
                btn.textContent = 'Encrypting & Sending...';

                const data = {
                    user_id: supUser ? supUser.user_id : null,
                    name: document.getElementById('sup-name').value,
                    email: document.getElementById('sup-email').value,
                    subject: document.getElementById('sup-subject').value,
                    message: document.getElementById('sup-message').value
                };

                await api.sendSupportMessage(data);
                alert('Success! Your inquiry has been secured. We will notify you once a representative replies.');
                e.target.reset();
                if (supUser) loadTickets();
            } catch (err) {
                alert('Secure Sending Failed: ' + err.message);
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }
});

async function loadTickets() {
    if (!supUser) return;
    try {
        const tickets = await api.getSupportMessages(supUser.user_id);
        const container = document.getElementById('tickets-container');
        const section = document.getElementById('ticket-history-section');

        if (tickets && tickets.length > 0 && container && section) {
            section.style.display = 'block';
            container.innerHTML = tickets.map(t => `
                <div class="ticket-card">
                    <span class="status-tag ${t.status === 'open' ? 'open' : 'replied'}">
                        ${t.status}
                    </span>
                    <h3 style="margin-bottom: 12px; font-weight: 800;">${t.subject}</h3>
                    <p style="color: var(--gray); font-size: 0.9rem; line-height: 1.6; margin-bottom: 20px;">${t.message}</p>
                    
                    ${t.reply ? `
                        <div class="admin-reply">
                            <p style="margin: 0; font-size: 0.95rem; line-height: 1.6;">${t.reply}</p>
                        </div>
                    ` : `
                        <p style="font-size: 0.85rem; color: #94a3b8; font-style: italic; display: flex; align-items: center; gap: 8px;">
                            <span style="display:inline-block; width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: pulse 1.5s infinite;"></span>
                            Assigning representative...
                        </p>
                    `}
                    
                    <div style="margin-top: 20px; font-size: 0.75rem; color: #cbd5e1; text-align: right;">
                        Issued: ${new Date(t.created_at).toLocaleDateString()}
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}
