import express from "express";
import {
  lucataco_sdxl_handler,
  turf_visualizer_handler,
} from "../controllers/images.controllers";
import upload from "../middlewares/multer.middleware";

const router = express.Router();

router.post("/lucataco_sdxl", lucataco_sdxl_handler);
router.post("/turf-visualizer", upload.single("file"), turf_visualizer_handler);
export { router as ImageRoutes };
