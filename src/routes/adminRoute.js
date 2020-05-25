const router = require('express').Router();

const user = require('../controllers/userController');

const smeCategory = require('../controllers/smeCategoryController');

const smeProfile = require('../controllers/smeProfileController');

const middleware = require('../middlewares/middleware');


/**
 * All the routes in this file are for Admin user only
 *
 * All routes already prepend with the Api Base Path in the app.js file
 *
 * Protected Routes with allowed user role in the array argument
 *
 * */


router.get('/user', middleware(['ADMIN']), user.accounts('ALL'));

router.get('/user/admin', middleware(['ADMIN']), user.accounts('ADMIN'));

router.post('/create_user', middleware(['ADMIN']), user.newAccount);

router.patch('/suspend/:id', middleware(['ADMIN']), user.changeStatus('SUSPENDED'));

router.patch('/activate/:id', middleware(['ADMIN']), user.changeStatus('ACTIVE'));

router.delete('/user/:id', middleware(['ADMIN']), user.deleteUser);


// Admin SME Catgeory Routes
router.post('/category', middleware(['ADMIN']), smeCategory.createCategory);

router.patch('/category/:name', middleware(['ADMIN']), smeCategory.editCategory);

router.delete('/category/:name', middleware(['ADMIN']), smeCategory.deleteCategory);

// Admin SME verification Routes

router.patch('/verifyProfile/:id', middleware(['ADMIN']), smeProfile.verifyProfile);

router.patch('/unverifyProfile/:id', middleware(['ADMIN']), smeProfile.unverifyProfile);

module.exports = router;
