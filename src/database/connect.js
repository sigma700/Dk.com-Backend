import mongoose from "mongoose";
import "dotenv/config";

//function for connecting with the database for making database operations

export const connectDb = async () => {
  try {
    const connection = await mongoose.connect(process.env.CONNECTION_STRING);

    if (!connection) {
      return console.error("Could not connect to the database unfortunately !");
    } else {
      console.log("Connected to the database succesfully !");
    }
  } catch (error) {
    console.error(error, "An error occured while connecting to the database !");
  }
};
