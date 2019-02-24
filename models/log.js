const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    diff: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

logSchema.index({ action: 1, category: 1 });
module.exports = mongoose.model('Log', logSchema);
