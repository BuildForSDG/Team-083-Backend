const router = require('express').Router();

const user = require('../controllers/userController');

const middleware = require('../middlewares/middleware');


/** 
 * All the routes in this file are for SME user only
 * 
 * All routes already prepend with the Api Base Path in the app.js file
 * 
 * Protected Routes with allowed user role in the array argument 
 * 
 **/

 
// router.get(path, middleware(['SME']), handler);



module.exports = router;