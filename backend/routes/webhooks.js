const express = require('express');
const axios = require('axios');
const Sequelize = require('sequelize');
const { DataTypes } = Sequelize;

module.exports = function(sequelize) {
      
  const Issue = sequelize.define('Issue', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    organization_id: DataTypes.STRING,
    project_id: DataTypes.STRING,
    event: DataTypes.STRING,
    description: DataTypes.STRING,
    severity: DataTypes.STRING,
    created: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.NOW
    },
    meta: {
        type: DataTypes.JSON,
    }
}, {
    timestamps: false,
    tableName: 'issues',
    freezeTableName: true
});

  
      

  let webhookUrl;

  const router = express.Router();

  router.post('/registerWebhook', (req, res) => {
      webhookUrl = req.body.url;
      console.log('Webhook registered:', webhookUrl);
      res.status(200).end();
  });

  function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Missing token' });
    }
  
    if (token !== 'token123321@@') {
      return res.status(403).json({ message: 'Invalid token' });
    }
  
    next();
  }

  // router.get('/getOrgId', (req, res) => {
  //   const username = req.session.username;
  //   const userData = cache[username];
  //   if (!userData) {
  //     return res.status(400).json({ message: 'Invalid username' });
  //   }
  //   res.json({ orgid: userData.orgid });
  // });
  
  router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (username === 'user1' && password === '') {
      req.session.username = username;
      req.session.userData = {
        hcp_jwt: "dummyToken1",
        orgid: "fc064bc9-fc9d-41ee-9e0d-11fb39e059a5",
        projectid: "dummyProjectId1",
        url: "http://ec2-44-204-175-78.compute-1.amazonaws.com:28081",
        installationToken: "3"
      };
      res.status(200).json({ message: 'Login successful', username });
    } else if (username === 'user2' && password === '') {
      req.session.username = username;
      req.session.userData = {
        hcp_jwt: "dummyToken1",
        orgid: "fc064bc9-fc9d-41ee-9e0d-11fb39e059a5",
        projectid: "dummyProjectId1",
        url: "http://ec2-44-204-175-78.compute-1.amazonaws.com:28081",
        installationToken: "3"
      };
      res.status(200).json({ message: 'Login successful', username });
    } else {
      // Invalid credentials
      res.status(400).json({ message: 'Invalid username or password' });
    }
  });

  router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
      if(err) {
        return res.status(500).json({ message: 'Could not log out, please try again.' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });
  
  
  router.get('/getOrgId', (req, res) => {
    const userData = req.session.userData;
    if (!userData) {
      return res.status(400).json({ message: 'Invalid session' });
    }
    res.json({ orgid: userData.orgid });
  });
  
  // And so on for the other routes
  

  // router.post('/login', (req, res) => {
  //   const { username, password } = req.body;
  
  //   if (username === 'user1' && password === 'password') {
  //     req.session.username = username; 
  //     // Successful login for User1
  //     cache["user1"] = {
  //       hcp_jwt: "dummyToken1",
  //       orgid: "fc064bc9-fc9d-41ee-9e0d-11fb39e059a5",
  //       projectid: "dummyProjectId1",
  //       url: "http://ec2-44-204-175-78.compute-1.amazonaws.com:28081",
  //       installationToken: "3"
  //     };
  //     res.status(200).json({ message: 'Login successful', username });
  //   } else if (username === 'user2' && password === 'password') {
  //     req.session.username = username; 
  //     // Successful login for User2
  //     cache["user2"] = {
  //       hcp_jwt: "dummyToken1",
  //       orgid: "fc064bc9-fc9d-41ee-9e0d-11fb39e059a5",
  //       projectid: "dummyProjectId1",
  //       url: "http://ec2-44-204-175-78.compute-1.amazonaws.com:28081",
  //       installationToken: "3"
  //     };
  //     res.status(200).json({ message: 'Login successful', username });
  //   } else {
  //     // Invalid credentials
  //     res.status(400).json({ message: 'Invalid username or password' });
  //   }
  // });

  router.post('/events', authenticate, async (req, res) => {
    const event = req.body.payload;

    // Segregate the values for the Issue model and the meta field.
    const { installation_id, organization_id, project_id, event: event_type, sender, payload: { id, description, severity } } = event;
    const meta = { installation_id, sender };

    // We no longer include these values when building the issue object.
    const issueData = { id, description, severity, organization_id, project_id, event: event_type, meta: JSON.stringify(meta) };

    console.log('Received event:', issueData);

    try {
        const issue = Issue.build(issueData);
        await issue.save();
        console.log('Saved issue:', issue.toJSON());
        res.status(200).end();
    } catch (err) {
        console.error('Error saving issue:', err);
        res.status(500).json({ message: 'Error saving issue' });
    }
});





  router.post('/simulateIssue', async (req, res) => {
      const issue = Issue.build(req.body);
      console.log('Simulated issue:', issue.toJSON());

      if (webhookUrl) {
          await axios.post(webhookUrl, issue.toJSON());
      }

      try {
          await issue.save();
          console.log('Saved issue:', issue.toJSON());
          res.status(200).end();
      } catch (err) {
          console.error('Error saving issue:', err);
          res.status(500).json({ message: 'Error saving issue' });
      }
  });


  router.post('/storeData', (req, res) => {
    const { token, orgid, projectid, url, installationToken } = req.body;
    if (!token || !orgid || !projectid) {
        return res.status(400).json({ message: 'Token, OrgID and ProjectID are required' });
    }
    
    // Store the values in the session for the user
    if (token) {
        req.session.userData.hcp_jwt = token;
    }
    if (orgid) {
        req.session.userData.orgid = orgid;
    }
    if (projectid) {
        req.session.userData.projectid = projectid;
    }
    if (url) {
        req.session.userData.url = url;
    }
    if (installationToken) {
        req.session.userData.installationToken = installationToken;
    }

    res.status(200).json({ message: 'Token, OrgID and ProjectID stored successfully' });
});

router.get('/services', async (req, res) => {
  const userData = req.session.userData;
  if (!userData) {
      return res.status(400).json({ message: 'Invalid session' });
  }

  const url = `${userData.url}/global-network-manager/2022-02-15/organizations/${userData.orgid}/projects/${userData.projectid}/services?filter.kinds=KIND_TYPICAL&filter.kinds=KIND_MESH_GATEWAY&filter.kinds=KIND_INGRESS_GATEWAY&from_app=true&installation_token=${userData.installationToken}`;

  try {
      const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${userData.hcp_jwt}` }
      });
      res.json(response.data);
  } catch (err) {
      console.error('Error getting services:', err);
      res.status(500).json({ message: 'Error getting services' });
  }
});

router.get('/clearSession', (req, res) => {
  // Clear the session data for the user
  req.session.userData = {};

  res.status(200).json({ message: 'Session cleared successfully' });
});



  

  // router.get('/issues', async (req, res) => {
  //     try {
  //         const oneWeekAgo = new Date();
  //         oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  //         const issues = await Issue.findAll({
  //           where: {
  //             created: {
  //               [Sequelize.Op.gte]: oneWeekAgo
  //             }
  //           }
  //         });
  //         res.json(issues.map(issue => issue.toJSON()));
  //     } catch (err) {
  //         console.error('Error retrieving issues:', err);
  //         res.status(500).json({ message: 'Error retrieving issues' });
  //     }
  // });
  router.get('/issues', async (req, res) => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
      const userOrgId = req.session.userData?.orgid;
    
      if (!userOrgId) {
        return res.status(400).json({ message: 'No organization found for this user.' });
      }
    
      const issues = await Issue.findAll({
        where: {
          created: {
            [Sequelize.Op.gte]: oneWeekAgo
          },
          organization_id: userOrgId // Filter by the user's organization id
        }
      });
      res.json(issues.map(issue => issue.toJSON()));
    } catch (err) {
      console.error('Error retrieving issues:', err);
      res.status(500).json({ message: 'Error retrieving issues' });
    }
  });
  

  return router;
}
