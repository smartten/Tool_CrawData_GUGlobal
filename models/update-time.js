import mongoose from "mongoose";

const Schema = mongoose.Schema;
const updateTimeSchema = new Schema({
  time: {
    type: String,
  },
  url: {
    type: String,
  },
  name: {
    type: String,
  },
});

export const UpdateTimeModel = mongoose.model("update-time", updateTimeSchema);


