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
        description: DataTypes.STRING,
        severity: DataTypes.STRING,
        created: {
          type: DataTypes.DATE,
          defaultValue: Sequelize.NOW
        }
      }, {
        timestamps: false,
        tableName: 'issues',
        freezeTableName: true
      });
      
      

  let webhookUrl;

//   let cache = {
//     User1: {
//         hcp_jwt: "dummyToken1",
//         orgid: "fc064bc9-fc9d-41ee-9e0d-11fb39e059a5",
//         projectid: "dummyProjectId1",
//         url: "http://ec2-44-204-175-78.compute-1.amazonaws.com:28081",
//         installationToken: "3"
//     },
//     User2: {
//       hcp_jwt: "dummyToken1",
//       orgid: "fc064bc9-fc9d-41ee-9e0d-11fb39e059a5",
//       projectid: "dummyProjectId1",
//       url: "http://ec2-44-204-175-78.compute-1.amazonaws.com:28081",
//       installationToken: "3"
//     }
// };


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
  

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (username === 'user1' && password === 'password') {
      // Successful login for User1
      cache["user1"] = {
        hcp_jwt: "dummyToken1",
        orgid: "fc064bc9-fc9d-41ee-9e0d-11fb39e059a5",
        projectid: "dummyProjectId1",
        url: "http://ec2-44-204-175-78.compute-1.amazonaws.com:28081",
        installationToken: "3"
      };
      res.status(200).json({ message: 'Login successful', username });
    } else if (username === 'user2' && password === 'password') {
      // Successful login for User2
      cache["user2"] = {
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
  


  router.post('/events', authenticate, async (req, res) => {
      const event = req.body;
  console.log('Received event:', event);

  try {
      const issue = Issue.build(event);
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
    
    // Store the values in the cache for the user
    if (token) {
        cache[user].hcp_jwt = token;
    }
    if (orgid) {
        cache[user].orgid = orgid;
    }
    if (projectid) {
        cache[user].projectid = projectid;
    }
    if (url) {
        cache[user].url = url;
    }

    if (installationToken) {
      cache[user].installationToken = installationToken;
  }


    res.status(200).json({ message: 'Token, OrgID and ProjectID stored successfully' });
});



// router.get('/clearCache', (req, res) => {
//   // Clear the cache
//   cache['hcp_jwt'] = null;
//   cache['orgid'] = null;
//   cache['projectid'] = null;
//   cache['url'] = null;

//   res.status(200).json({ message: 'Cache cleared successfully' });
// });



// //   router.get('/consulVersions', async (req, res) => {
// //     // const authHeader = req.headers['authorization'];
// //     // const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
// //     // console.log(token)
// //     // console.log(process.env.UI_TOKEN)

// //     // if (token == null || token !== process.env.UI_TOKEN) return res.sendStatus(401); // if there isn't a token in the request, or it's not the expected one, return 401 Unauthorized

// //     const url = `${process.env.HCP_URL}/global-network-manager/2022-02-15/organizations/${process.env.HCP_ORG}/integration/3?from_app=true`;

// //     try {
// //         const response = await axios.get(url, {
// //             headers: { 'Authorization': `Bearer ${process.env.HCP_JWT}` }
// //         });
// //         res.json(response.data);
// //     } catch (err) {
// //         console.error('Error getting consul versions:', err);
// //         res.status(500).json({ message: 'Error getting consul versions' });
// //     }
// // });

// router.get('/services', async (req, res) => {
//   const url = `${cache['orgid']}/global-network-manager/2022-02-15/organizations/${cache['orgid']}/projects/${cache['projectid']}/services?filter.kinds=KIND_TYPICAL&filter.kinds=KIND_MESH_GATEWAY&filter.kinds=KIND_INGRESS_GATEWAY&from_app=true`;

//   try {
//       const response = await axios.get(url, {
//           headers: { 'Authorization': `Bearer ${cache['hcp_jwt']}` }
//       });
//       res.json(response.data);
//   } catch (err) {
//       console.error('Error getting consul versions:', err);
//       res.status(500).json({ message: 'Error getting consul versions' });
//   }
// });




// router.post('/storeData', (req, res) => {
//   const { token, orgid, projectid, url, username } = req.body;
//   if (!token || !orgid || !projectid || !username) {
//       return res.status(400).json({ message: 'Token, OrgID, ProjectID and Username are required' });
//   }
  
//   // Store the token, OrgID and ProjectID in the cache under the username
//   cache[username] = { token, orgid, projectid, url };

//   res.status(200).json({ message: 'Data stored successfully' });
// });

router.get('/services', async (req, res) => {
  const { username } = req.query;
  const userData = cache[username];
  if (!userData) {
      return res.status(400).json({ message: 'Invalid username' });
  }

  const url = `${userData.url}/global-network-manager/2022-02-15/organizations/${userData.orgid}/projects/${userData.projectid}/services?filter.kinds=KIND_TYPICAL&filter.kinds=KIND_MESH_GATEWAY&filter.kinds=KIND_INGRESS_GATEWAY&from_app=true&installation_token=${userData.installationToken}`;

  try {
      const response = await axios.get(url, {
          headers: { 'Authorization': `Bearer ${userData.token}` }
      });
      res.json(response.data);
  } catch (err) {
      console.error('Error getting services:', err);
      res.status(500).json({ message: 'Error getting services' });
  }
});

router.get('/clearCache', (req, res) => {
  const { username } = req.query;
  // Clear the cache for the specific user
  cache[username] = {};

  res.status(200).json({ message: 'Cache cleared successfully' });
});


  

  router.get('/issues', async (req, res) => {
      try {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const issues = await Issue.findAll({
            where: {
              created: {
                [Sequelize.Op.gte]: oneWeekAgo
              }
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
