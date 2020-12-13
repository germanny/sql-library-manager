const express = require('express');
const router = express.Router();

/* Redirect to /books as homepage */
router.get('/', (req, res, next) => {
  res.redirect("/books")
});

module.exports = router;
