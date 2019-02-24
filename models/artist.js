const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artistSchema = new Schema(
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Artist', artistSchema);
