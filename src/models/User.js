
const mongoose = require('mongoose');

const validator = require('validator');

const userSchema = mongoose.Schema({
                                        _id: { 
                                            
                                            type: String, 
                                            
                                            required: true
                                        },
                                        name: { 
                                            
                                            type: String, 

                                            min: 4,
                                            
                                            required: true 
                                        },
                                        status: {
                                            
                                            type: String,
                                            
                                            enum : ['PENDING','ACTIVE','SUSPENDED'],
                                            
                                            default: 'ACTIVE'
                                        },
                                        password: {
                                            
                                            type: String,
                                            
                                            required:[true, 'Enter a valid password with minimum of eight characters']
                                        },
                                        userType: {
                                            
                                            type: String,
                                            
                                            enum : ['ADMIN','SME','FUNDER'],
                                            
                                            required: [true, 'Invalid User type'],
                                            
                                            uppercase:true
                                        },
                                        email: {
                                            
                                            type: String,
                                            
                                            required: true,
                                            
                                            unique: true,
                                            
                                            lowercase: true,
                                            
                                            validate: (value) => {
                                            
                                                return validator.isEmail(value)
                                            }
                                        }
                                        },
                                        {
                                            timestamps: true
                                        });

module.exports = mongoose.model('users', userSchema);
