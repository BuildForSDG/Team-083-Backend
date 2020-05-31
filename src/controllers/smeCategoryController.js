/* eslint-disable no-underscore-dangle */
const SmeCategory = require('../models/SmeCategory');
const ErrorHandler = require('../utility/error');

/**
 * Reserved Route for an admin to add sme categories
 * @param {object} req
 * @param {object} res
 * @returns {object} res object
 */

const createCategory = async (req, res) => {
  const {
    name, description
  } = req.body;

  // Check that category is unique
  const categoryExists = await SmeCategory.findOne({ name });

  if (categoryExists) throw new ErrorHandler(400, 'Category already exists');

  if (!name || name.length < 2) throw new ErrorHandler(400, 'Kindly add name to proceed');

  const smeCategory = new SmeCategory({
    name, description
  });

  // Save the category
  await smeCategory.save((err, category) => {
    if (err) throw new ErrorHandler(500, 'Something went wrong, please try again', err);
    res.status(201).json({
      status: 'success',
      message: 'Category has been added successfully',
      category
    });
  });
};

/**
 * Reserved Route for an admin to edit sme categories
 * @param {object} req
 * @param {object} res
 * @returns {object} res object
 */

const editCategory = async (req, res) => {
  let { name } = req.params;
  const { description } = req.body;

  name = name.toLowerCase();

  const categoryExists = await SmeCategory.findOne({ name });

  if (!categoryExists) throw new ErrorHandler(404, 'Category does not exist');

  const updated = await SmeCategory.findByIdAndUpdate({ _id: categoryExists._id },
    { $set: { description } }, { new: true });
  if (!updated) throw new ErrorHandler(500, 'Something went wrong, please try again');
  res.status(200).json({
    status: 'success',
    message: 'Category has been edited successfully',
    category: updated
  });
};

/**
 * Route to get a specific category
 * @param {*} req
 * @param {*} res
 * @returns {object} res object
 */

const getCategory = async (req, res) => {
  let { name } = req.params;
  name = name.toLowerCase();
  const category = await SmeCategory.findOne({ name });

  if (!category) throw new ErrorHandler('404', 'That category does not exist');
  res.status(200).json({
    status: 'success',
    message: 'Category found successfully',
    category
  });
};

/**
 * Route to get all categories
 * @param {object} req
 * @param {object} res
 * @returns {object} res object
 */

const getCategories = async (req, res) => {
  const allCategories = await SmeCategory.find();
  if (!allCategories) throw new ErrorHandler(404, 'No categories found');
  res.status(200).json({
    status: 'success',
    message: `${allCategories.length} categories have been found`,
    allCategories
  });
};

/**
 * Route to delete a category
 * @param {object} req
 * @param {object} res
 * @returns {object} res object
 */

const deleteCategory = async (req, res) => {
  const { name } = req.params;

  const category = await SmeCategory.findOne({ name });

  if (!category) throw new ErrorHandler(404, 'That category does not exist');
  const delCategory = await SmeCategory.deleteOne({ _id: category._id });
  if (!delCategory) throw new ErrorHandler(500, 'Something went wrong, please try again');
  res.status(200).json({
    status: 'success',
    message: 'category deleted successfully'
  });
};

module.exports = {
  createCategory, editCategory, getCategories, getCategory, deleteCategory
};
