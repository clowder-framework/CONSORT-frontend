const express = require('express');
const router = express.Router();
const { 
  userQueries, 
  publicationQueries, 
  annotationQueries, 
  feedbackQueries, 
  contentQueries 
} = require('../rctdb/queries');

// Users routes
router.get('/users', async (req, res) => {
  try {
    const users = await userQueries.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const user = await userQueries.upsertUser({
      ...req.body
    });
    res.status(201).json(user[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// TODO: need to be implemented
router.get('/users/:email', async (req, res) => {
  try {
    const user = await userQueries.getUserByEmail(req.params.email);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.get('/users/:name', async (req, res) => {
  try {
    const user = await userQueries.getUserByName(req.params.name);
    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Publications routes
router.get('/publications', async (req, res) => {
  try {
    const publications = await publicationQueries.getAllPublicationsWithUsers();
    res.json(publications);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ error: 'Failed to fetch publications' });
  }
});

router.post('/publications', async (req, res) => {
  try {
    const publication = await publicationQueries.upsertPublication({
      ...req.body
    });
    res.status(201).json(publication[0]);
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(500).json({ error: 'Failed to create publication' });
  }
});

router.get('/publications/:uuid', async (req, res) => {
  try {
    const publication = await publicationQueries.getPublicationByUuid(parseInt(req.params.uuid));
    if (publication.length === 0) {
      return res.status(404).json({ error: 'Publication not found' });
    }
    res.json(publication[0]);
  } catch (error) {
    console.error('Error fetching publication:', error);
    res.status(500).json({ error: 'Failed to fetch publication' });
  }
});

router.get('/publications/:uuid/annotations', async (req, res) => {
  try {
    const annotations = await annotationQueries.getAnnotationsWithContext(parseInt(req.params.uuid));
    res.json(annotations);
  } catch (error) {
    console.error('Error fetching annotations:', error);
    res.status(500).json({ error: 'Failed to fetch annotations' });
  }
});

// Annotations routes
router.post('/annotations', async (req, res) => {
  try {
    const annotation = await annotationQueries.createAnnotation(req.body);
    res.status(201).json(annotation[0]);
  } catch (error) {
    console.error('Error creating annotation:', error);
    res.status(500).json({ error: 'Failed to create annotation' });
  }
});

router.put('/annotations/:uuid', async (req, res) => {
  try {
    const annotation = await annotationQueries.updateAnnotation(parseInt(req.params.uuid), req.body);
    if (annotation.length === 0) {
      return res.status(404).json({ error: 'Annotation not found' });
    }
    res.json(annotation[0]);
  } catch (error) {
    console.error('Error updating annotation:', error);
    res.status(500).json({ error: 'Failed to update annotation' });
  }
});

// Feedback routes
router.post('/feedback', async (req, res) => {
  try {
    const feedback = await feedbackQueries.createFeedback({
      ...req.body,
      time: new Date()
    });
    res.status(201).json(feedback[0]);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to create feedback' });
  }
});

router.get('/annotations/:uuid/feedback', async (req, res) => {
  try {
    const feedback = await feedbackQueries.getFeedbackByAnnotation(parseInt(req.params.uuid));
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: 'Failed to fetch feedback' });
  }
});

// Health check route
router.get('/health', async (req, res) => {
  try {
    const { rctdbTestConnection } = require('../rctdb/connection');
    const isHealthy = await rctdbTestConnection();
    res.json({ 
      status: isHealthy ? 'healthy' : 'unhealthy',
      database: isHealthy ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router; 