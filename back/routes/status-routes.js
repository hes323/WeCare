const express = require('express');
const { addNewStatus } = require('../controller/status-controller');

const router = express.Router();

router.get('/produce-status', addNewStatus);

module.exports = router;