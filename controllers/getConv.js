import Conversation from "../models/conversation.model.js";

async function getConversationByContractId(contract_id, page) {
  try {
          const all = await Conversation.findOne({ contract_id }).select("messages");

    // Find the conversation by contract_id and populate the messages
    const conversation = await Conversation.findOne({ contract_id })
      .select("messages")
      .populate({
        path: "messages",
        options: {
          sort: { "time.timestamp": -1 }, // Sort by timestamp in descending order
          limit: 20, // Limit the results to 25 messages per page
          skip: (page - 1) * 20, // Corrected skip formula for pagination
        },
      })
      .lean()
      .exec();
    console.log(
      "🚀 ~ getConversationByContractId ~ conversation:",
      conversation
    );

    if (!conversation) {
      throw new Error("Conversation not found");
    }



    return { conversation, count: all?.messages?.length };
  } catch (error) {
    console.error("Error fetching conversation:", error.message);
    throw error; // or handle the error as needed
  }
}

export default getConversationByContractId;


