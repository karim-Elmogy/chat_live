import Message from "../models/message.model.js";
import getConv from "./getConv.js";
import cors from "cors";
import Conversation from "../models/conversation.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import axios from "axios"; // Make sure this is imported
import https from "https";
// https://plus10v2.alexondev.net/api/chat/message?contract_id=7





export const sendMessage = async (req, res) => {
  try {
    const { contract_id } = req.query;
    const x = await getConv(JSON.parse(contract_id));
    console.log("🚀 ~ sendMessage ~ x:", x);
    console.log("🚀 ~ sendMessage ~ contract_id:", contract_id);

    res.status(201).json({
      result: "success",
      code: 200,
      timestamp: "2024-09-19 08:32:50",
      message: "success",
      data: x,
    });
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// export const getMessages = async (req, res) => {
//   try {
//     const { contract_id, page = 1 } = req.query;

//     const {conversation, count} = await getConv(contract_id, page);

//     // let image_url = "https://plus10v2.alexondev.net/assets/images/users/default.jpg";
//     //     try {
//     //       const imageResponse = await axios.get(`https://plus10v2.alexondev.net/api/image/${userId}`, { httpsAgent: agent });
//     //       if (imageResponse.data && imageResponse.data.image) {
//     //         image_url = imageResponse.data.image;
//     //       }
//     //     } catch (error) {
//     //       console.error("Error fetching user image:", error.message);
//     //     }
//     res.status(200).json({
//       result: "success",
//       code: 200,
//       timestamp: "2024-10-10 08:40:33",
//       message: "success",
//       data: conversation.messages,
   
//       meta: {
//         messages: {
//           totalItems: count,
//           itemsPerPage: 20,
//           totalPages: Math.ceil(count / 20),
//           currentPage: +page,
//         },
//       },
//     });
//   } catch (error) {
//     console.log("Error in getMessages controller: ", error.message);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

export const getMessages = async (req, res) => {
  try {
    const { contract_id, page = 1 } = req.query;

    const { conversation, count } = await getConv(contract_id, page);

    const updatedMessages = await Promise.all(
      conversation.messages.map(async (msg) => {
        const userId = msg.sender.id;

        let image_url = null;

        try {
          const response = await axios.get(`https://plus10v2.alexondev.net/api/image/${userId}`);
          image_url = response.data?.data?.image || null;
        } catch (err) {
          console.log(`Failed to fetch image for user ${userId}: ${err.message}`);
        }

        return {
          ...msg,
          sender: {
            ...msg.sender,
            image_url,
          },
        };
      })
    );

    res.status(200).json({
      result: "success",
      code: 200,
      timestamp: new Date().toISOString(),
      message: "success",
      data: updatedMessages,
      meta: {
        messages: {
          totalItems: count,
          itemsPerPage: 20,
          totalPages: Math.ceil(count / 20),
          currentPage: Number(page),
        },
      },
    });
  } catch (error) {
    console.log("Error in getMessages controller:", error.message);
    // res.status(500).json({ error: "Internal server error" });
        res.status(200).json({});

  }
};

