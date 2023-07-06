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
}

async function fetchOrgId(username) {
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/api/getOrgId?username=${username}`);
      const data = await response.json();
  
      var org_id_element = document.createElement("h2");
      org_id_element.textContent = "Organization ID: " + data.orgid;
      document.body.prepend(org_id_element);
  
    } catch (err) {
      console.error('Error:', err);
    }
  }

  var globalUser = "";
  


// async function getConsulVersions() {
//         // const response = await fetch('http://ec2-44-204-175-78.compute-1.amazonaws.com:28081/global-network-manager/2022-02-15/organizations/fc064bc9-fc9d-41ee-9e0d-11fb39e059a5/integration/3?from_app=true', {

//     const response = await fetch(process.env.HCP_URL+'/global-network-manager/2022-02-15/organizations/'+process.env.HCP_ORG+'/integration/3?from_app=true', {
//         headers: { 'Authorization': 'Bearer ' + process.env.HCP_JWT }
//     });
//     const consulVersions = await response.json();
//     console.log(consulVersions);
// }

async function getServices() {
    const response = await fetch(`http://${window.location.hostname}:3000/api/services`, {
        headers: { 'Authorization': `Bearer UIPASS123321$$` }
    });
    const consulVersions = await response.json();
    console.log(consulVersions);
}

async function login() {
    username = document.getElementById('username').value;
    console.log(username)
    fetchOrgId(username);
    const password = document.getElementById('password').value;
    const response = await fetch(`http://${window.location.hostname}:3000/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (data.message === 'Login successful') {
        // Hide the login form and show the main content
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    } else {
        alert('Invalid username or password');
    }
}


document.getElementById('getServices').addEventListener('click', getServices);


async function getIssues() {
    const response = await fetch(`http://${window.location.hostname}:3000/api/issues`);
    const issues = await response.json();
    
    const issuesElement = document.getElementById('issues');
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
    // Perform login operation...

    // If login is successful:
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
});

document.getElementById('logout-button').addEventListener('click', () => {
    // Perform logout operation...

    // After logout:
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('main-content').style.display = 'none';
});


registerWebhook().catch(console.error);
getIssues().catch(console.error);
