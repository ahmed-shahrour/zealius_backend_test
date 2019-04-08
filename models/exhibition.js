const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exhibitionSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    galleries: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Gallery',
        required: true,
      },
    ],
    artists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Artist',
        required: true,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exhibition', exhibitionSchema);
