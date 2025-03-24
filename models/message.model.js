import moment from "moment";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const messageSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // Define the _id field as a String to accept UUIDs
      default: () => uuidv4(), // Generate UUIDs automatically
    },
    sender: {
      id: {
        type: Number,
      },
      image_url: {
        type: String,
        default:
          "https://plus10v2.alexondev.net/assets/images/users/default.jpg",
      },
    },
    message: {
      type: String,
    },
    contract_id: {
      type: String, // Assuming contract_id is a string
    },
    room_id: {
      type: String, // Assuming room_id is a string
      required: true,
    },
    message_type: {
      type: String,
      enum: ["text", "image", "video","document"], // Define allowed message types
      default: "text",
    },
    file: {
      file_url: String, // Store the URL or path of the uploaded file
      file_type: String, // E.g., "image" or "video"
      file_mimes_type: String, // E.g., "image/webp", "video/mp4"
      file_size: String, // E.g., "10.23 KB"
      file_name: String, // E.g., "example.webp"
    },
    
    // file: [
    //   {
    //     file_url: String,
    //     file_type: String,
    //     file_mimes_type: String,
    //     file_size: String,
    //     file_name: String,
    //   }
    // ],
    time: {
      timestamp: {
        type: Number,
        default: () => moment().unix(), // Current time in seconds since Unix epoch
      },
      formatted: {
        type: String,
        default: () => moment().format("MMM D, YYYY | h:mm A"), // Formatted time
      },
    },
  },
  {
    toJSON: {
      transform: async function (doc, ret) {
        ret.id = ret._id; // Rename _id to id
        delete ret._id; // Optionally remove the original _id
        
        if (ret.sender && ret.sender.id) {
          try {
            const response = await axios.get(
              `https://plus10v2.alexondev.net/api/image/${ret.sender.id}`
            );
            if (response.data && response.data.data.image) {
              ret.sender.image_url = response.data.data.image;
            }
          } catch (error) {
            console.error("Error fetching user image:", error.message);
          }
        }
      },
    },
    timestamps: true, // Enables createdAt and updatedAt timestamps
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;