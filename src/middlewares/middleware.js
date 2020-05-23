const jwt = require('jsonwebtoken');

/**  
 * 
 * Verify jwt token and only allow access to permited routes
 * 
 * An array of userType allowed for every route is required as an argument to the middleware method 
 * 
 * This makes it flexible for all applicable protected routes
 * 
 **/

const middleware = allowedUser => (req, res, next) =>  {

  let token = req.headers['token'];

  if (token) {

    jwt.verify(token, process.env.jwtKey, (error, userData) => {

        if (error) {
            
            return res.status(403).json({
                                          status: "error",

                                          message: 'Token is not valid'
                                      });
        } 
        else {

            /* Confirm user have permission to the route */

            if (allowedUser.indexOf(userData.userType) >= 0){

                req.userData = userData;
    
                next();
            }
            else{
            
                return res.status(403).json({
                                              status: "error",
    
                                              message: 'You don\'t have Required permission to acess this route'
                                          });


            }
        }
    });
  } 
  else {
    
    return res.status(403).json({
                                  status: "error",
              
                                  message: "Auth token is not supplied"
                              });
  }
};

module.exports = middleware;