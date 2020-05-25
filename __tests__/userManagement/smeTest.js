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

let token = null;   // sme token

let id = null;

/* Generate Test user */

const testUser =  {
                    "name":"John Collins",
                    "email": `${Math.random().toString(36).substr(2, 10)}@test.com`,
                    "userType": 'SME',
                    "password": "password101"
                };


after(async () => {

    /* Delete created SME Account */

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

describe ("SME USER ACTIVITIES", function(){

    /* Test SME Create account */

    it("SME can create Account", done => {

        chai.request(server)
            .post(`${apiBasePath}/signup`)
            .set("Content-Type", "application/json")
            .send(testUser)
            .end((err,res) => {
                
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.status.should.be.eql('success');
                res.body.data.userType.should.be.eql('SME');

                id = res.body.data._id;
                
                done();
            })
    });

    
    /* Test SME User login */

    it("SME can login", done => {

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
                res.body.data.userType.should.be.eql('SME');

                token = res.body.data.token;        // Save token in variable for subsequent SME Activities
                
                done();
            })
    });

    /* Test SME Viewing Account Details */

    it("SME can view account details", done => {

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

    /* Test SME Changing Password */

    it("SME can change Password", done => {

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

    /* Test SME Can Update Profile */

    it("SME can Update Profile", done => {

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

    /* Test SME Can Update Avatar */

    it("SME can update avatar", done => {

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

    /* Test SME can not View all users */

    it("SME can not view all users", done => {

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

    /* Test SME Viewing all SME */

    it("SME can view all SME only", done => {

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

    /* Test SME Viewing all FUNDER */

    it("SME can view all FUNDER only", done => {

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

    /* Test SME can not View all Admin */

    it("SME can not view all Admin", done => {

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