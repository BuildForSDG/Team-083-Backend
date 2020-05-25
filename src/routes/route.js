const user = require('../controllers/userController');

const middleware = require('../middlewares/middleware');

const basePath = '/api/v1';


const routes = (app) => {
  /** Non protected Routes * */

  app.post(`${basePath}/login`, user.login);

  app.post(`${basePath}/signup`, user.signup);


  /** Protected Routes with allowed user role in the array argument * */

  app.get(`${basePath}/account`, middleware(['ADMIN', 'SME', 'FUNDER']), user.account);


  /* Error 404 */

  app.use((req, res, next) => res.status(404).json({
    success: 'error',

    message: 'Invalid api endpoint or Method'
  }));
};


module.exports = routes;
