const router = require('express').Router();

// const user = require('../controllers/userController');

const smeProfile = require('../controllers/smeProfileController');

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

router.post('/smeProfile', middleware(['ADMIN', 'SME']), smeProfile.createSmeProfile);

router.get('/smeProfile', middleware(['ADMIN', 'SME']), smeProfile.loggedInUserSmeProfile);


module.exports = router;
