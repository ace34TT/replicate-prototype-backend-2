import express from "express";
import {
  createRvcDataSetHandler,
  trainRvcModelHandler,
  voiceCloningHandler,
  voiceCloningWithExistingModelHandler,
} from "../controllers/voices.controller";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

router.get("/create-dataset", createRvcDataSetHandler);
router.get("/train-model", trainRvcModelHandler);
router.post("/voice-cloning", upload.single("speech"), voiceCloningHandler);
router.post("/voice-cloning/model", voiceCloningWithExistingModelHandler);
export { router as VoicesRoutes };
