require('dotenv').config();

const User = require('../../src/models/User');
const UserProfile = require('../../src/models/UserProfile');
const assert = require("assert");
const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../src/app");
const should = chai.should();
const fs = require("fs");


const apiBasePath = '/api/v1';

let token = null;   // FUNDER token

let id = null;

/* Generate Test user */

const testUser =  {
                    "name":"John Collins",
                    "email": `${Math.random().toString(36).substr(2, 10)}@test.com`,
                    "userType": 'FUNDER',
                    "password": "password101"
                };


after(async () => {

    /* Delete created FUNDER Account */

    if (id != null){

        await User.deleteOne({_id: id});

        let  userProfile = await UserProfile.findOne({userId: id});

        if (userProfile.avatar != ''){

            fs.unlinkSync(`public${userProfile.avatar}`);    // Remove Avatar if available
        }

        await userProfile.remove();
        
    }
});


chai.use(chaiHttp);

describe ("FUNDER USER ACTIVITIES", function(){

    /* Test FUNDER Create account */

    it("FUNDER can create Account", done => {

        chai.request(server)
            .post(`${apiBasePath}/signup`)
            .set("Content-Type", "application/json")
            .send(testUser)
            .end((err,res) => {
                
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.status.should.be.eql('success');
                res.body.data.userType.should.be.eql('FUNDER');

                id = res.body.data._id;
                
                done();
            })
    });

    
    /* Test FUNDER User login */

    it("FUNDER can login", done => {

        chai.request(server)
            .post(`${apiBasePath}/login`)
            .set("Content-Type", "application/json")
            .send({
                    email: testUser.email,
                    password: testUser.password    
                })
            .end((err,res) => {
                
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.status.should.be.eql('success');
                res.body.data.userType.should.be.eql('FUNDER');

                token = res.body.data.token;        // Save token in variable for subsequent FUNDER Activities
                
                done();
            })
    });

    /* Test FUNDER Viewing Account Details */

    it("FUNDER can view account details", done => {

        chai.request(server)
            .get(`${apiBasePath}/user/${id}`)
            .set("token", token)
            .set("Content-Type", "application/json")
            .end((err,res) => {
                
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.status.should.be.eql('success');
                res.body.data._id.should.be.eql(id);

                done();
            })
    });

    /* Test FUNDER Changing Password */

    it("FUNDER can change Password", done => {

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

    /* Test FUNDER Can Update Profile */

    it("FUNDER can Update Profile", done => {

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
                res.body.data._id.should.be.eql(id);

                done();
            })
    });

    /* Test FUNDER Can Update Avatar */

    it("FUNDER can update avatar", done => {

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

    /* Test FUNDER can not View all users */

    it("FUNDER can not view all users", done => {

        chai.request(server)
            .get(`${apiBasePath}/user`)
            .set("token", token)
            .set("Content-Type", "application/json")
            .end((err,res) => {
                
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.status.should.be.eql('error')

                done();
            })
    });

    /* Test FUNDER Viewing all SME */

    it("FUNDER can view all FUNDER only", done => {

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

    /* Test FUNDER Viewing all FUNDER */

    it("FUNDER can view all FUNDER only", done => {

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

    /* Test FUNDER can not View all Admin */

    it("FUNDER can not view all Admin", done => {

        chai.request(server)
            .get(`${apiBasePath}/user/admin`)
            .set("token", token)
            .set("Content-Type", "application/json")
            .end((err,res) => {
                
                res.should.have.status(403);
                res.body.should.be.a('object');
                res.body.status.should.be.eql('error');

                done();
            })
    });
    
})