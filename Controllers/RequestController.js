const User = require("../Models/UserModel");
const Property = require("../Models/PropertyModel");
const Request = require("../Models/RequestModel");
const Review = require("../Models/ReviewModel");
const generateToken = require("../Utils/GenerateToken");
const {
  hashPassword,
  comparePassword,
} = require("../Utils/Password-Hash-Unhash");

exports.createRequest = async (req, res, next) => {
  try {
    const newRequest = await Request.create(req.body);
    const user = await User.findOneAndUpdate(
      { _id: req.body.user_id },
      { $push: { requests: newRequest } }
    );
    user.save();
    const updatedUser = await User.findById(req.body.user_id);
    res.status(201).json({
      status: "Success",
      request: newRequest,
      user: updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "Failed",
      message: `cannot create request error: ${err}`,
    });
  }
};
exports.deleteRequest = async (req, res, next) => {
  try {
    const { request_id } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.body.user_id },
      { $pull: { requests: request_id } }
    );
    await Request.findByIdAndDelete(req.body.user_id);
    user.save();
    const updatedUser = await User.findById(req.body.user_id);
    res.status(201).json({
      status: "Success",
      updatedUser,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "Failed",
      message: `cannot delete request error: ${err}`,
    });
  }
};

exports.updateRequest = async (req, res, next) => {
  try {
    const { is_pending, is_accepted, user_id, request_id, property_id } =
      req.body;
    const request = await Request.findByIdAndUpdate(
      { _id: request_id },
      {
        is_pending: is_pending,
      }
    );
    request.save();
    const request2 = await Request.findByIdAndUpdate(
      { _id: request_id },
      {
        is_accepted: is_accepted,
      }
    );
    request2.save();
    if (is_pending == false && is_accepted == true) {
      const property = await Property.findByIdAndUpdate(
        { _id: property_id },
        {
          is_sold: true,
        }
      );
      property.save();
      const user = await User.findOneAndUpdate(
        { _id: user_id },
        { $push: { purchase_history: request_id } }
      );
      user.save();
    }
    const updatedUser = await User.findById(user_id);
    const updatedProperty = await Property.findById(property_id);
    const updatedRequest = await Request.findById(request_id);
    res.status(201).json({
      status: "Success",
      user: updatedUser,
      property: updatedProperty,
      request: updatedRequest,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "Failed",
      message: `cannot update request error: ${err}`,
    });
  }
};

exports.getRequest = async (req, res, next) => {
  try {
    const request = await Request.find({ property_id: req.params.id });
    res.status(201).json({
      status: "Success",
      request,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "Failed",
      message: `cannot get request error: ${err}`,
    });
  }
};
