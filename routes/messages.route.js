import express from "express";
import { getMessages } from "../controllers/message.controllers.js";

const router = express.Router();

router.get("/message", getMessages);

export default router;
