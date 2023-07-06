async function registerWebhook() {
    await fetch(`http://${window.location.hostname}:3000/api/registerWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: 'https://webhook.site/ac949edb-7050-4552-bb2c-c31eeb71cb73' })
    });
}

async function simulateIssue() {
    await fetch(`http://${window.location.hostname}:3000/api/simulateIssue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: '123', description: 'Test issue' })
    });
}async function fetchOrgId() {
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/getOrgId`);
      const data = await response.json();
  
      var org_id_element = document.getElementById("orgId");
      org_id_element.textContent = "Organization ID: " + data.orgid;
  
    } catch (err) {
      console.error('Error:', err);
    }
  }
  



async function getServices() {
    const response = await fetch(`http://${window.location.hostname}:3000/api/services`, {
        headers: { 'Authorization': `Bearer UIPASS123321$$` }
    });
    const services = await response.json();

    const servicesElement = document.getElementById('getServices');
    servicesElement.innerHTML = `
        <div class="table">
            <div class="table-header">
                <div>Service Name</div>
                <div>Total</div>
                <div>Passing</div>
                <div>Warning</div>
                <div>Critical</div>
                <div>Cluster</div>
                <div>Namespace</div>
                <div>Partition</div>
                <div>Kind</div>
            </div>
            ${services.services.map(service => 
                service.summaries.map(summary => `
                    <div class="table-row">
                        <div>${service.name}</div>
                        <div>${summary.total}</div>
                        <div>${summary.passing}</div>
                        <div>${summary.warning}</div>
                        <div>${summary.critical}</div>
                        <div>${summary.cluster}</div>
                        <div>${summary.namespace}</div>
                        <div>${summary.partition}</div>
                        <div>${summary.kind}</div>
                    </div>
                `).join('')).join('')}
        </div>
    `;
}


async function login() {
    username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const response = await fetch(`http://${window.location.hostname}:3000/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.message === 'Login successful') {
        getIssues().catch(console.error);
        fetchOrgId();
        // Hide the login form and show the main content
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    } else {
        alert('Invalid username or password');
    }
}


document.getElementById('getServices').addEventListener('click', getServices);


async function getIssues() {
    // fetchOrgId()
    const response = await fetch(`http://${window.location.hostname}:3000/api/issues`);
    const issues = await response.json();
    
    const issuesElement = document.getElementById('issues');
    console.log(issues)
    issuesElement.innerHTML = `
        <div class="table">
            <div class="table-header">
                <div>ID</div>
                <div>Description</div>
                <div>Severity</div>
                <div>Created At</div>
                <div>Organization ID</div>
                <div>Project ID</div>
                <div>Event</div>
            </div>
            ${issues.map(issue => `
                <div class="table-row">
                    <div>${issue.id}</div>
                    <div>${issue.description}</div>
                    <div>${issue.severity}</div>
                    <div>${new Date(issue.created).toLocaleString()}</div>
                    <div>${issue.organization_id}</div>
                    <div>${issue.project_id}</div>
                    <div>${issue.event}</div>
                </div>
            `).join('')}
        </div>
    `;
}




document.getElementById('login-button').addEventListener('click', () => {
    login();

    // If login is successful:
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
});


document.getElementById('logout-button').addEventListener('click', async () => {
    try {
      await fetch(`http://${window.location.hostname}:3000/api/logout`, {
        method: 'POST', // Assuming you're using a POST request to clear the session
        headers: { 'Content-Type': 'application/json' },
      });
      
      // After logout:
      document.getElementById('login-form').style.display = 'block';
      document.getElementById('main-content').style.display = 'none';
    } catch (err) {
      console.error('Error:', err);
    }
  });

  

registerWebhook().catch(console.error);


