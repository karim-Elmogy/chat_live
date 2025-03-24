import mongoose from "mongoose";

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.dataBase);
    console.log("connected to mongo db");
  } catch (err) {
    console.log("error connecting to mongodb", err.message);
  }
};

export default connectToMongoDB;
