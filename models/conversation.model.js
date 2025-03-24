import mongoose, { Schema } from "mongoose";

const conversatoinSchema = mongoose.Schema(
  {
    contract_id: {
      type: String,
      required: true,
    },
    // participants: [
    //   {
    //     type: String,
    //     ref: "User",
    //   },
    // ],
    messages: [
      {
        type: String,
        ref: "Message",
        default: [],
      },
    ],
    // room_id: {
    //   type: Schema.Types.ObjectId,
    //   required: true,
    // },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversatoinSchema);

export default Conversation;
