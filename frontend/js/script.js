async function registerWebhook() {
    await fetch('http://localhost:3000/api/registerWebhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://webhook.site/ac949edb-7050-4552-bb2c-c31eeb71cb73' })
    });
}

async function simulateIssue() {
    await fetch('http://localhost:3000/api/simulateIssue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '123', description: 'Test issue' })
    });
}

async function getIssues() {
    const response = await fetch('http://localhost:3000/api/issues');
    const issues = await response.json();
    
    const issuesElement = document.getElementById('issues');
    issuesElement.innerHTML = `
        <div class="table">
            <div class="table-header">
                <div>ID</div>
                <div>Description</div>
                <div>Severity</div>
                <div>Created At</div>
            </div>
            ${issues.map(issue => `
                <div class="table-row">
                    <div>${issue.id}</div>
                    <div>${issue.description}</div>
                    <div>${issue.severity}</div>
                    <div>${new Date(issue.created).toLocaleString()}</div>
                </div>
            `).join('')}
        </div>
    `;
}

registerWebhook().catch(console.error);
getIssues().catch(console.error);
