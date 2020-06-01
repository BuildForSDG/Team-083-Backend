const router = require('express').Router();

// const user = require('../controllers/userController');

const smeProfileController = require('../controllers/smeProfileController');

const smeFundRequestController = require('../controllers/smeFundRequestController');

const middleware = require('../middlewares/middleware');

/**
 * All the routes in this file are for SME user only
 *
 * All routes already prepend with the Api Base Path in the app.js file
 *
 * Protected Routes with allowed user role in the array argument
 *
 * */


// router.get(path, middleware(['SME']), handler);
// Create a SME Profile
router.post('/smeProfile', middleware(['ADMIN', 'SME']), smeProfileController.createSmeProfile);

router.get('/smeProfile', middleware(['ADMIN', 'SME']), smeProfileController.loggedInUserSmeProfile);

// SME Request for Funds
router.post('/fundRequest', middleware(['SME']), smeFundRequestController.createFundRequest);

module.exports = router;
