const router = require('express').Router();

const user = require('../controllers/userController');

const smeCategory = require('../controllers/smeCategoryController');

const smeProfile = require('../controllers/smeProfileController');

const middleware = require('../middlewares/middleware');


/**
 *
 * Routes defined in this file are Endpoints for more than one userType
 *
 * All routes already prepend with the Api Base Path in the app.js file
 *
 * */


/** Non protected Routes  * */

router.post('/login', user.login);

router.post('/signup', user.newAccount);


/** Protected Routes with allowed user role in the array argument * */


router.patch('/change_password', middleware(['ADMIN', 'SME', 'FUNDER']), user.changePassword);

router.get('/user/sme', middleware(['ADMIN', 'SME', 'FUNDER']), user.accounts('SME'));

router.get('/user/funder', middleware(['ADMIN', 'SME', 'FUNDER']), user.accounts('FUNDER'));

router.get('/user/:id', middleware(['ADMIN', 'SME', 'FUNDER']), user.accountDetail);

router.patch('/user/update', middleware(['ADMIN', 'SME', 'FUNDER']), user.accountUpdate);

router.put('/user/avatar', middleware(['ADMIN', 'SME', 'FUNDER']), user.changeAvatar);

/* SME Category View */

router.get('/categories', middleware(['ADMIN', 'SME', 'FUNDER']), smeCategory.getCategories);

router.get('/category/:name', middleware(['ADMIN', 'SME', 'FUNDER']), smeCategory.getCategory);

/* SME Profile View  */

router.get('/smeProfiles', middleware(['ADMIN', 'SME', 'FUNDER']), smeProfile.viewAllProfiles);

router.get('/smeProfile/:id', middleware(['ADMIN', 'SME', 'FUNDER']), smeProfile.viewASmeProfile);

module.exports = router;
