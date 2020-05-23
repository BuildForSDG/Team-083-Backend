require('dotenv').config();

const User = require('../../src/models/User');
const UserProfile = require('../../src/models/UserProfile');
const assert = require("assert");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../src/app");
const should = chai.should();
const fs = require("fs");
const jwt = require('jsonwebtoken');


const apiBasePath = '/api/v1';

let token = null;   // To be used by admin for most transactions after admin login test

let ids = [];

let adminLogin = null;

/* Generate Test user */

const testUser =  (userType) => ({
                                    "name":"John Collins",
                                    "email": `${Math.random().toString(36).substr(2, 10)}@test.com`,
                                    "userType": userType,
                                    "password": "password101"
                                });

/* Generate Admin Access token */

before(() => {
    
    adminTestToken = jwt.sign(testUser('ADMIN'), process.env.jwtKey, 
        
                { algorithm: 'HS256', expiresIn:'24h'});
});


after(async () => {

    ids = ids.filter(id => id !== '');  // Remove empty value

    /* Delete any reminant record created by the test if exist */

    if (ids.length > 0){

        let cond = {

                    '$or': ids.map(id => ({_id: id}))
                };

        await User.deleteMany(cond);

        cond = {

                    '$or': ids.map(id => ({userId: id}))
                };

        let  userProfile = await UserProfile.find(cond);

        for (i=0; i < userProfile.length; i++){

            if (userProfile[i].avatar != ''){

                fs.unlinkSync(`public${userProfile[i].avatar}`);    // Remove Avatar if available
            }

            await userProfile[i].remove();
        }

    }
});



chai.use(chaiHttp);

describe("SMEFUND USER API", function(){

    /* Test for Cross Origin Request */

    describe ("TEST FOR CROSS ORIGIN REQUEST and Error 404", function(){

        it("Confirm Cross Origin is returning status ok with correct allow methods", done => {

            chai.request(server)
                .options(apiBasePath)
                .end((err,res)=>{

                    res.should.have.status(200);

                    res.header['access-control-allow-methods'].should.be.eql('GET, POST, PUT, DELETE, PATCH, OPTIONS');
                    
                    done()
                })
        });

        /* Test for Error 404 */

        it("Should return error 404 for invalid path or method", done => {

            chai.request(server)
                .get(`${apiBasePath}/dfbv/xxx/zzz`)
                .end((err,res)=>{

                    res.should.have.status(404);
                    res.body.status.should.be.eql('error');
                    
                    done()
                })
        });

    })

    describe ("ADMIN USER ACTIVITIES", function(){

        let adminUser = testUser('ADMIN');

        /* Test Admin User Creation */

        it("Admin can create another admin", done => {

            chai.request(server)
                .post(`${apiBasePath}/create_user`)
                .set("token", adminTestToken)
                .set("Content-Type", "application/json")
                .send(adminUser)
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.userType.should.be.eql('ADMIN');

                    ids[0] = res.body.data._id;

                    adminLogin = {email: adminUser.email, password: adminUser.password};
                    
                    done();
                })
        });

        /* Test Created Admin User login */

        it("Created Admin can login", done => {

            chai.request(server)
                .post(`${apiBasePath}/login`)
                .set("Content-Type", "application/json")
                .send(adminLogin)
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.userType.should.be.eql('ADMIN');

                    token = res.body.data.token;        // Save token in variable for subsequent Admin Activities
                    
                    done();
                })
        });

        /* Test SME User Creation */

        it("Admin can create SME Account", done => {

            chai.request(server)
                .post(`${apiBasePath}/create_user`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .send(testUser('SME'))
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.userType.should.be.eql('SME');

                    ids[1] = res.body.data._id;
                    
                    done();
                })
        });

        /* Test FUNDER User Creation */

        it("Admin can create FUNDER Account", done => {

            chai.request(server)
                .post(`${apiBasePath}/create_user`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .send(testUser('FUNDER'))
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.userType.should.be.eql('FUNDER');

                    ids[2] = res.body.data._id;
                    
                    done();
                })
        });

        /* Test Admin Viewing Account Details */

        it("Admin can view account details", done => {

            chai.request(server)
                .get(`${apiBasePath}/user/${ids[0]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data._id.should.be.eql(ids[0]);

                    done();
                })
        });

        /* Test Admin Changing Password */

        it("Admin can change Password", done => {

            chai.request(server)
                .patch(`${apiBasePath}/change_password`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .send({
                        "old_password":"password101",  
                        "new_password":"newpassword102"
                    })
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Password Changed Successfully');

                    done();
                })
        });

        /* Test Admin Can Update Profile */

        it("Admin can Update Profile", done => {

            chai.request(server)
                .patch(`${apiBasePath}/user/update`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .send({
                        "name":"Steve Jobs",
                        "bio": "Everything about me is cool",
                        "phone": "2347000000001",
                        "address": "2, Andela road Lagos"
                    })
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data._id.should.be.eql(ids[0]);

                    done();
                })
        });

        /* Test Admin Can Update Avatar */

        it("Admin can update avatar", done => {

            chai.request(server)
                
                .put(`${apiBasePath}/user/avatar`)
                .set("token", token)
                .set("Content-Type", "application/x-www-form-urlencoded")
                .attach("image", fs.readFileSync('__tests__/userManagement/test-image.png'), "test.png")
                
                .end((err,res)=>{
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.avatar.should.be.a('string');
                    
                    done()
                })
        });

        /* Test Admin Viewing all users */

        it("Admin can view all users", done => {

            chai.request(server)
                .get(`${apiBasePath}/user`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.should.be.a('array');

                    done();
                })
        });

        /* Test Admin Viewing all SME */

        it("Admin can view all SME only", done => {

            chai.request(server)
                .get(`${apiBasePath}/user/sme`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.should.be.a('array');

                    done();
                })
        });

        /* Test Admin Viewing all FUNDER */

        it("Admin can view all FUNDER only", done => {

            chai.request(server)
                .get(`${apiBasePath}/user/funder`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.should.be.a('array');

                    done();
                })
        });

        /* Test Admin Viewing all Admin */

        it("Admin can view all Admin only", done => {

            chai.request(server)
                .get(`${apiBasePath}/user/admin`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.data.should.be.a('array');

                    done();
                })
        });

        /* Test Admin Suspend SME */

        it("Admin can Suspend SME", done => {

            chai.request(server)
                .patch(`${apiBasePath}/suspend/${ids[1]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Status Updated Successfully');

                    done();
                })
        });

        /* Test Admin Activate SME */

        it("Admin can Activate suspended SME", done => {

            chai.request(server)
                .patch(`${apiBasePath}/activate/${ids[1]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Status Updated Successfully');

                    done();
                })
        });

        /* Test Admin Suspend FUNDER */

        it("Admin can Suspend FUNDER", done => {

            chai.request(server)
                .patch(`${apiBasePath}/suspend/${ids[1]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Status Updated Successfully');

                    done();
                })
        });

        /* Test Admin Activate FUNDER */

        it("Admin can Activate suspended FUNDER", done => {

            chai.request(server)
                .patch(`${apiBasePath}/activate/${ids[2]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Status Updated Successfully');

                    done();
                })
        });

        /* Test Admin Can not Suspend its account */

        it("Admin can not suspend own account", done => {

            chai.request(server)
                .patch(`${apiBasePath}/suspend/${ids[0]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('error');

                    done();
                })
        });

        /* Test Admin can suspend other Admin account using Admin Test Token */

        it("Admin can Suspend other Admin", done => {

            chai.request(server)
                .patch(`${apiBasePath}/suspend/${ids[0]}`)
                .set("token", adminTestToken)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Status Updated Successfully');

                    done();
                })
        });

        /* Test Admin Activate other Admin account using Admin test token*/

        it("Admin can Activate other suspended Admin", done => {

            chai.request(server)
                .patch(`${apiBasePath}/activate/${ids[0]}`)
                .set("token", adminTestToken)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Status Updated Successfully');

                    done();
                })
        });

        /* Test Admin Delete SME Account */

        it("Admin can Delete SME Account", done => {

            chai.request(server)
                .delete(`${apiBasePath}/user/${ids[1]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Deleted Successfully');

                    ids[1] = '';  // Remove Id if successful and create empty space

                    done();
                })
        });

        /* Test Admin Delete FUNDER Account */

        it("Admin can Delete FUNDER Account", done => {

            chai.request(server)
                .delete(`${apiBasePath}/user/${ids[2]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Deleted Successfully');

                    ids[2] = '';  // Remove Id if successful and create empty space

                    done();
                })
        });

        /* Test Admin can not Delete own Account */

        it("Admin can not Delete own Account", done => {

            chai.request(server)
                .delete(`${apiBasePath}/user/${ids[0]}`)
                .set("token", token)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(400);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('error');

                    done();
                })
        });

        /* Test Admin can Delete other Admin Account */

        it("Admin can Delete other Admin Account", done => {

            chai.request(server)
                .delete(`${apiBasePath}/user/${ids[0]}`)
                .set("token", adminTestToken)
                .set("Content-Type", "application/json")
                .end((err,res) => {
                    
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.status.should.be.eql('success');
                    res.body.message.should.be.eql('Account Deleted Successfully');

                    ids[0] = '';  // Remove Id if successful and create empty space

                    done();
                })
        });

    });


})