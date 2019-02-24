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
    // exhibitions: [
    //   {
    //     _id: {
    //       type: Schema.Types.ObjectId,
    //       ref: 'Gallery',
    //       required: true,
    //     },
    //     name: {
    //       type: String,
    //       // required: true,
    //     },
    //   },
    // ],
    // artists: [
    //   {
    //     _id: {
    //       type: Schema.Types.ObjectId,
    //       ref: 'Artist',
    //       required: true,
    //     },
    //     name: {
    //       type: String,
    //       // required: true,
    //     },
    //   },
    // ],
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exhibition', exhibitionSchema);
