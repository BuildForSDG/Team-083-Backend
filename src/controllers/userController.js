const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid = require('uuidv1');
const multer = require('multer');
const fs = require('fs');


/** 
 * 
 * New SME or Funder Signup 
 * 
 * Admin creating all user type account using this handler
 * 
 **/

const newAccount = (req, res) => {

  /* Admin Account can't be created via signup route, except via create user by Admin */

  if (req.body.userType && req.body.userType.toUpperCase() == 'ADMIN' && typeof(req.userData) != 'object'){

    return res.status(400).json({
                                  status: 'error',

                                  message: 'Invalid user type'
                                });

  }

  const passwordHash = (req.body.password && req.body.password.length >= 8) ? bcrypt.hashSync(req.body.password, 10) : '';

  const user = new User({
                          _id: uuid(),

                          name: req.body.name,
                          
                          email: req.body.email,
                          
                          password: passwordHash,
                          
                          userType: req.body.userType
                        });

  user.save().then(({_id, name, email, status, userType}) => {

                            const data = { _id, name, email, status, userType};

                            /* Generate User Token */
      
                            const token = jwt.sign(data, process.env.jwtKey, { algorithm: 'HS256', expiresIn: '24h'});

                            /* Create row in the user profile collection for the account */

                            new UserProfile({userId: _id}).save();

                            return res.status(200).json({
                                                          status: 'success',
                                      
                                                          message: 'Account created Successfully',

                                                          data: {token, ...data}
                                                        });
                          }
              ).catch(error => {
                  
                  return res.status(400).json({
                                                status: 'error',

                                                message: error.code === 11000 ? 'Email Address Already in use' : error.message
                                            });
              });
}



/** 
 * 
 * ADMIN, SME or Funder Login 
 * 
 **/

const login = (req, res) => {

  let { email, password } = req.body;

  if (typeof(email) == "undefined" || typeof(password) == "undefined"){

    return res.status(403).json({
                                  status: "error",
                                
                                  message : "Enter your email and password"

                                });

  }

  User.find({email: email, status: 'ACTIVE'})

            .then( user => {
              
              if (user.length == 0){

                return res.status(403).json({
                                              status: "error",
                                            
                                              message : "Account does not exist"
          
                                            });
          
          
              }
              else if (!bcrypt.compareSync(password, user[0].password)){
          
                return res.status(403).json({
                                              status: "error",
                                            
                                              message : "Incorrect email or password"
          
                                            });
              }
              else{

                /* Extract desired user data */

                let {_id, name, email, status, userType} = user[0];
          
                const data = {_id, name, email, status, userType};
          
                const token = jwt.sign(data, process.env.jwtKey, { algorithm: 'HS256', expiresIn: '24h'});
          
                return res.status(200).json({
                                              status: 'success',

                                              message: 'login Successfully',
                                              
                                              data : {token, ...data}
                                            });

              }
            })

            .catch(error => {
                  
                return res.status(400).json({
                                              status: 'error',

                                              message:  error.message
                                          });
            })

}



/** 
 * 
 * users List 
 * 
 **/

const accounts = userType => (req, res) => {

  const cond = (userType === 'ALL' ? {} : {userType});

  User.find(cond, {password:0, __v:0})
                
    .then( users => {

        return res.status(200).json({
                                      status: 'success',
                                  
                                      message: 'Users Fetched Successfully',

                                      data: users
                                    });

    })

    .catch(error => {
          
        return res.status(400).json({
                                      status: 'error',

                                      message:  error.message
                                  });
    });
}




/** 
 * 
 * ADMIN, SME or Funder Account Details 
 * 
 **/

const accountDetail = (req, res) => {

  /* Join query on users and userprofiles collections */

  User.aggregate([
                  {
                    $match:{
                              "_id": req.params.id
                            }
                  },
                  {
                    $lookup: {
                                from: "userprofiles", // collection name in db
                                
                                localField: "_id",
                                
                                foreignField: "userId",
                                
                                as: "detail"
                            }
                  }
                ]).exec(function(error, user) {

                  if (error | user.length == 0){

                    return res.status(500).json({ 
                                                  status: "error",
                                                  
                                                  data : error ? error.message : 'Something went wrong'

                                                });
                  }
                  else{

                    /* Extract desired User Data */

                    const {_id, name, email, userType, status} = user[0];
                      
                    const {avatar, bio, phone, address, updatedAt, createdAt } = user[0].detail[0];

                    const data = {_id, name, email, userType, status, avatar, bio, phone, address, updatedAt, createdAt };

                    return res.status(200).json({
                                                  status: 'success',

                                                  message: 'Operation Successfully',

                                                  data: data
                                                  
                                                });


                  }
                });

}



/** 
 * 
 * ADMIN, SME or Funder Account Update 
 * 
 **/

const accountUpdate = async (req, res) => {

    const _id = req.userData._id;

    let {name, bio, phone, address } = req.body;

    if (typeof(name) == 'undefined' || name.length < 4 || typeof(bio) == 'undefined' 
    
      || typeof(phone) == 'undefined' || typeof(address) == 'undefined'){

      return res.status(400).json({
                                    status: 'error',
  
                                    message: 'name, bio, phone, and address required'
                                    
                                  });

    }
    else{

      try{

        const userModel = await User.updateOne({_id}, {name});
  
        const userProfieModel = await UserProfile.updateOne({userId: _id},  {bio, phone, address});

        /* Fetch user details */

        req.params.id = _id;

        accountDetail(req, res);
  
      }
      catch(e){
        
        return res.status(400).json({
                                      status: 'error',

                                      message: e.message
                                      
                                    });
      }

    }

}



/** 
 * 
 * ADMIN, SME or Funder Account Avatar 
 * 
 **/

const changeAvatar = (req, res) => {

   /* Receive file with Multer */

   const upload = multer({ dest: 'public/assets/images/' }).single('image');

   upload(req, res, (error) => {

       if (error) {

           return res.status(500).json({ 
                                           status: "error",
                                           
                                           message : error.message

                                       });
       }
       else if (typeof(req.file) == "undefined"){

           return res.status(500).json({ 
                                           status: "error",
                                           
                                           message : "Kindly upload your image"

                                       });

       }
       else if (req.file.size > 1000000){

           return res.status(400).json({ 
                                           status: "error",
                                           
                                           message : "Maximum allow file size is 1mb"

                                       });

       }
       else {

        /* confirm file is an image */

        if (req.file.mimetype === "image/png" ||  req.file.mimetype === "image/jpg" || 
        
            req.file.mimetype === "image/jpeg" ||  req.file.mimetype === "image/gif"){

              const uniqueFilename = uuid() + "." + req.file.mimetype.split("/").pop();

              fs.renameSync(req.file.path, req.file.destination + uniqueFilename);

              const filePath = "/assets/images/" + uniqueFilename;

              /* Update user avatar path */

              UserProfile.updateOne({userId: req.userData._id},  {avatar: filePath})
                            
              .then( user => {

                if (user.n > 0 ){

                  return res.status(200).json({
                                                status: 'success',
                                            
                                                message: 'Avatar Uploaded Successfully',

                                                data: {

                                                        avatar: filePath
                                                        
                                                      }
                                              });
                }
                else{
          
                  fs.unlinkSync(req.file.destination + uniqueFilename);

                  return res.status(400).json({
                                                status: 'error',
                                            
                                                message: 'Operation fail'
                                              });

                }
              })

              .catch(error => {
          
                  fs.unlinkSync(req.file.destination + uniqueFilename);
                    
                  return res.status(400).json({
                                                status: 'error',

                                                message:  error.message
                                            });
              });

        }
        else{
          
          fs.unlinkSync(req.file.path);

          return res.status(400).json({ 
                                          status: "error",
                                          
                                          message : "Upload a valid Image file"

                                      });


        }

      }
    });
}



/** 
 * 
 * Update ADMIN, SME or Funder Account Password 
 * 
 **/

const changePassword = (req, res) => {

  let { old_password, new_password } = req.body;

  if (typeof(old_password) == "undefined" || typeof(new_password) == "undefined" || new_password.length < 8){

    return res.status(400).json({
                                  status: 'error',

                                  message: 'old_password and new_password field required (Eight character minimum)'
                                });
  }
  
  User.find({email: req.userData.email})

            .then( user => {
              
              if (user.length == 0){

                return res.status(500).json({
                                              status: "error",
                                            
                                              message : "Something went wrong"
          
                                            });
          
          
              }
              else if (!bcrypt.compareSync(old_password, user[0].password)){
          
                return res.status(403).json({
                                              status: "error",
                                            
                                              message : "Incorrect old password"
          
                                            });
              }
              else{

                const passwordHash = bcrypt.hashSync(new_password, 10);
                
                User.updateOne({email: req.userData.email},  new User({password: passwordHash}))
              
                          .then( () => {

                            return res.status(200).json({
                                                          status: 'success',
                                                      
                                                          message: 'Password Changed Successfully'
                                                        });

                          })

                          .catch(error => {
                                
                              return res.status(400).json({
                                                            status: 'error',
              
                                                            message:  error.message
                                                        });
                          });
              }
            })

            .catch(error => {
                  
                return res.status(400).json({
                                              status: 'error',

                                              message:  error.message
                                          });
            });




};



/** 
 * 
 * Change ADMIN, SME or Funder Account status by Admin 
 * 
 **/

const changeStatus = status => (req, res) => {

  const _id = req.params.id;

  User.updateOne({_id, email:{$ne: req.userData.email}},  new User({status: status}))
                
    .then( user => {

      if (user.n > 0 ){

        return res.status(200).json({
                                      status: 'success',
                                  
                                      message: `Account Status Updated Successfully`
                                    });
      }
      else{

        return res.status(400).json({
                                      status: 'error',
                                  
                                      message: 'Operation fail'
                                    });

      }
    })

    .catch(error => {
          
        return res.status(400).json({
                                      status: 'error',

                                      message:  error.message
                                  });
    });
}



/** 
 * 
 * Delete ADMIN, SME or Funder Account by Admin 
 * 
 **/

const deleteUser = (req, res) => {

  const _id = req.params.id;

  User.deleteOne({_id,  email:{$ne: req.userData.email}})
                
    .then( async user => {

      if (user.n > 0 ){

        let  userProfile = await UserProfile.findOne({userId: _id});

        if (userProfile.avatar != ''){

          fs.unlinkSync(`public${userProfile.avatar}`);
        }

        await userProfile.remove();


        return res.status(200).json({
                                      status: 'success',
                                  
                                      message: 'Account Deleted Successfully'
                                    });

      }
      else{

        return res.status(400).json({
                                      status: 'error',
                                  
                                      message: 'Operation fail'
                                    });
      }

    })

    .catch(error => {
          
        return res.status(400).json({
                                      status: 'error',

                                      message:  error.message
                                  });
    });
}


module.exports = {
                    newAccount,
                    
                    login,

                    accounts,

                    accountDetail,

                    accountUpdate,

                    changeAvatar,

                    changePassword,

                    changeStatus,

                    deleteUser
                };
