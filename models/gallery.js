const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gallerySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    exhibitions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Exhibition',
        required: true,
      },
    ],
    location: {
      area: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      unit: {
        type: String,
        required: true,
      },
      latitude: {
        type: String,
        required: true,
      },
      longitude: {
        type: String,
        required: true,
      },
    },
    contact: {
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gallery', gallerySchema);
