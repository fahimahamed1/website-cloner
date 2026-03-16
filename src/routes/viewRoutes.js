const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { title: 'Website Login Page Cloner', error: null, success: null });
});

module.exports = router;
