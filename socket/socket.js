import { Server } from "socket.io";
import http from "http";
import express from "express";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import fs from "node:fs";
import { v4 as uuidv4 } from "uuid";
import {Mutex} from 'async-mutex';
import cors from 'cors';
import axios from "axios"; // Make sure this is imported
import { fileTypeFromBuffer } from "file-type";
import { sendFCMNotification } from "../utuils/notification.js";
import moment from "moment";


const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  maxHttpBufferSize: 1e8,
});

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on(
    "join-room",
    async ({ message, user_id, receiverId, room_id, ...data }) => {
  
      socket.join(room_id);
      let conversation = await Conversation.findOne({
        contract_id: room_id,
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [user_id, receiverId],
          contract_id: room_id,
        });
      }
      const messageMutex = new Mutex();
      socket.on(
        "new-message",
        async ({
          message,
          userId,
          receiverId,
          file_name,
          file,
          message_type = "text",
        }) => {
          console.log("🚀 ~ socket.on ~ message:", message);
            const release = await messageMutex.acquire();
          try {
            const newMessage = new Message({
              _id: uuidv4(),
              sender: { id: user_id },
              message,
              room_id,
              message_type,
              contract_id: room_id,
            });
            
            

            
            // the flie is single
                
               if (message_type !== "text") {
                  const imagePath = uuidv4() + "-" + file_name;
                
                  const buffer = Buffer.from(file);
                
                  const fileType = await fileTypeFromBuffer(buffer);
                  const mimeType = fileType?.mime || "application/octet-stream";
                
                  let folder = "others";
                  if (["image", "video", "file","document"].includes(message_type)) {
                    folder = message_type;
                  }
                  
                  
            

                
                  const dirPath = `uploads/${folder}`;
                  if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                  }
                
                  const uploadPath = `${dirPath}/${imagePath}`;
                  fs.writeFileSync(uploadPath, buffer);
                
                  const fileSizeKB = (buffer.length / 1024).toFixed(2) + " KB";
                
                  newMessage.file = {
                    file_url: `https://server.alexonsolutions.net/${folder}/${imagePath}`,
                    file_type: message_type,
                    file_mimes_type: mimeType,
                    file_size: fileSizeKB,
                    file_name: file_name,
                  };
                }
                
                
                // in Muli
                // if (message_type !== "text" && Array.isArray(files)) {
                //   const uploadedFiles = [];
                
                //   for (const fileData of files) {
                //     const { file, file_name } = fileData;
                
                //     const imagePath = uuidv4() + "-" + file_name;
                //     const buffer = Buffer.from(file);
                
                //     const fileType = await fileTypeFromBuffer(buffer);
                //     const mimeType = fileType?.mime || "application/octet-stream";
                
                //     let folder = "others";
                //     if (["image", "video", "file", "document"].includes(message_type)) {
                //       folder = message_type;
                //     }
                
                //     const dirPath = `uploads/${folder}`;
                //     if (!fs.existsSync(dirPath)) {
                //       fs.mkdirSync(dirPath, { recursive: true });
                //     }
                
                //     const uploadPath = `${dirPath}/${imagePath}`;
                //     fs.writeFileSync(uploadPath, buffer);
                
                //     const fileSizeKB = (buffer.length / 1024).toFixed(2) + " KB";
                
                //     uploadedFiles.push({
                //       file_url: `https://server.alexonsolutions.net/${folder}/${imagePath}`,
                //       file_type: message_type,
                //       file_mimes_type: mimeType,
                //       file_size: fileSizeKB,
                //       file_name: file_name,
                //     });
                //   }
                
                //   newMessage.files = uploadedFiles;
                // }



                
                
             

                
                
                

            if (newMessage) {
              console.log("🚀 ~ newMessage:", newMessage);
              conversation.messages.push(newMessage._id);
            }

            const [x, m] = await Promise.all([
              conversation.save(),
              newMessage.save(),
            ]);
            
            
           
        



               
            
            
            
            
            
              
            //   await sendFCMNotification({
            //          token: "fHiCUv0k30O9kdpBlgwCIi:APA91bFlAhi4hOF6KWQH4u0dwk7LVd_TJ59rRG9vBNxO-55bwlIlUDHaFRPLN4DzNJN3XSC5RvD_UjtS4E7YhtXuChwM_vYFqEswzsbtK9HlByedOACgIY0",
            //       title: "رسالة جديدة",
            //       body: message_type === "text" ? message : `وصلك ${message_type}`,
            //       data: {
            //         messageId: String(newMessage._id),
            //         roomId: String(newMessage.room_id),
            //         senderId: String(userId),
            //       },
            //     });
            
            
                         try {
                          const response = await axios.get(`https://plus10v2.alexondev.net/api/token/${receiverId}`);
                          const allDeviceToken = response.data?.data;
                        
                          if (Array.isArray(allDeviceToken)) {
                            await Promise.all(
                              allDeviceToken.map((item) =>
                                sendFCMNotification({
                                  token: item.device_token,
                                  title: "رسالة جديدة",
                                  body: message_type === "text" ? message : `وصلك ${message_type}`,
                                  data: {
                                    messageId: String(newMessage._id),
                                    roomId: String(newMessage.room_id),
                                    senderId: String(userId),
                                  },
                                })
                              )
                            );
                          }
                        } catch (err) {
                          console.log(`Failed to fetch token for user ${userId}: ${err.message}`);
                        }


                       
            
            
            
                 let image_url = null;

                try {
                  const response = await axios.get(`https://plus10v2.alexondev.net/api/image/${user_id}`);
                  image_url = response.data?.data?.image || null;
                } catch (err) {
                  console.log(`Failed to fetch image for user ${userId}: ${err.message}`);
                }
        
                
            
            
            
           
            const response = {
              result: "success",
              code: 200,
              timestamp: moment().format("YYYY-MM-DD HH:mm:ss"), // Current time
              message: "success",
              data: {
                message: {
                  id: newMessage._id, // MongoDB document ID
                  message: newMessage.message, // Message content
                  status: "sent", // Update status as needed
                  file: newMessage.file,
                  message_type: newMessage.message_type, // Assuming this is a message with a file
                  contract_id: newMessage.room_id, // Contract ID from message
                  room_id: newMessage.room_id, // Room ID from message
                  sender: {
                    id: user_id, // Sender's ID
                    image_url : image_url,
                  },
                  time: {
                    timestamp: moment().unix(), // Unix timestamp
                    formatted: moment(newMessage.createdAt).format(
                      "MMM D, YYYY | h:mm A"
                    ), // Formatted time
                  },
                },
              },
            };

            io.to(room_id).emit("new-message", response);
          } catch (error) {
            console.log("Error in sendMessage controller: ", error.message);
          }finally{
              release()
          }
        }
      );

      socket.on("leave-room", () => {
        socket.leave(room_id);
        console.log("leaving room " + room_id);
      });
    }
  );

  const userId = socket.handshake.query.userId;
  if (userId != "undefined") userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on() is used to listen to the events. can be used both on client and server side
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };




