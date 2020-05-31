/* eslint-disable no-underscore-dangle */
require('dotenv').config();

const fs = require('fs');
const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User');
const UserProfile = require('../../src/models/UserProfile');
const Smecategory = require('../../src/models/SmeCategory');
const server = require('../../src/app');

const should = chai.should();

const apiBasePath = '/api/v1';


let adminTestToken;


/* Generate Test user */


const testUser = (userType) => ({

  name: 'John Collins Okey',
  email: `${Math.random().toString(36).substr(2, 10)}@test.com`,
  userType,
  password: 'password101'

});

const categoryOne = {

  name: 'Test Category One',
  description: 'Businesses that deal with minning on a large scale'
};

/* Generate Admin Access token */

before(() => {
  adminTestToken = jwt.sign(testUser('ADMIN'), process.env.jwtKey,
    { algorithm: 'HS256', expiresIn: '24h' });
});

after(async () => {
  // Delete created category if it still exists (Db Clean up)
  await Smecategory.deleteOne({ name: categoryOne.name });
});

chai.use(chaiHttp);

describe('SMEFUND CATEGORY API', () => {
  describe('ADMIN USER ACTIVITIES', () => {
    /* Test that an admin can create a category */
    it('Admin can create a category', (done) => {
      chai.request(server)

        .post(`${apiBasePath}/category`)

        .set('token', adminTestToken)

        .set('Content-Type', 'application/json')

        .send(categoryOne)

        .end((err, res) => {
          res.should.have.status(201);

          res.body.should.be.a('object');

          res.body.status.should.be.eql('success');

          done();
        });
    });


    /* Test that two categories cannot have the same name */
    it('Admin cannot create two categories with the same name', (done) => {
      chai.request(server)

        .post(`${apiBasePath}/category`)

        .set('token', adminTestToken)

        .set('Content-Type', 'application/json')

        .send(categoryOne)

        .end((err, res) => {
          res.should.have.status(400);

          res.body.should.be.a('object');

          res.body.status.should.be.eql('error');

          res.body.message.should.be.eql('Category already exists');

          done();
        });
    });

    /* Test that an admin can edit a category  */
    it('Admin can edit a category', (done) => {
      chai.request(server)

        .patch(`${apiBasePath}/category/${categoryOne.name}`)

        .set('token', adminTestToken)

        .set('Content-Type', 'application/json')

        .send({
          description: 'Very Informative Category group'
        })

        .end((err, res) => {
          res.should.have.status(200);

          res.body.should.be.a('object');

          res.body.status.should.be.eql('success');

          done();
        });
    });

    /* Test that an admin can view all categories  */
    it('Admin can view a specific category', (done) => {
      chai.request(server)

        .get(`${apiBasePath}/category/${categoryOne.name}`)

        .set('token', adminTestToken)

        .set('Content-Type', 'application/json')


        .end((err, res) => {
          res.should.have.status(200);

          res.body.should.be.a('object');

          res.body.status.should.be.eql('success');

          done();
        });
    });

    /* Test that an admin can view all categories  */
    it('Admin can view all categories', (done) => {
      chai.request(server)

        .get(`${apiBasePath}/categories`)

        .set('token', adminTestToken)

        .set('Content-Type', 'application/json')


        .end((err, res) => {
          res.should.have.status(200);

          res.body.should.be.a('object');

          res.body.status.should.be.eql('success');

          done();
        });
    });
    /* Test that an admin can delete a category  */
    it('Admin can delete a specific category', (done) => {
      chai.request(server)

        .delete(`${apiBasePath}/category/${categoryOne.name}`)

        .set('token', adminTestToken)

        .set('Content-Type', 'application/json')


        .end((err, res) => {
          res.should.have.status(200);

          res.body.should.be.a('object');

          res.body.status.should.be.eql('success');

          done();
        });
    });
  });
});
