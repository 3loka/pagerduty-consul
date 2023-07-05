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

  const router = express.Router();

  router.post('/registerWebhook', (req, res) => {
      webhookUrl = req.body.url;
      console.log('Webhook registered:', webhookUrl);
      res.status(200).end();
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
