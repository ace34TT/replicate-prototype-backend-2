import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";
import {
  compressImage,
  convertDataToImage,
  deleteImage,
  fetchImage,
  getFilePath,
} from "../helpers/file.helper";
import fs from "fs";
import lodash from "lodash";
import {
  getDocument,
  uploadFileToFirebase,
} from "../services/firebase.service";
import { firebaseProcess } from "../services/turfVisualizer.service";
import sharp from "sharp";
import { fb_tufVisualizerInstance } from "../configs/fb.turfVisualizer.config";
import { ProcessTimer } from "../helpers/process.helper";
export const lucataco_sdxl_handler = async (req: Request, res: Response) => {
  try {
    console.log("processing");
    const [prompt, image] = [req.body.prompt, req.body.image];
    const output = await replicate.run(
      "lucataco/sdxl:c86579ac5193bf45422f1c8b92742135aa859b1850a8e4c531bff222fc75273d",
      {
        input: {
          prompt,
          image,
        },
      }
    );
    console.log(output);
    return res.status(200).json({ url: output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const turf_visualizer_handler = async (req: Request, res: Response) => {
  try {
    const taskTracker = new ProcessTimer();
    console.log("processing turf visualizer");
    const [image] = [req.file];
    if (!image) {
      console.log("Invalid data , image is required");
      return res.status(400).send("Invalid data , image is required");
    }
    let filepath = {
      filename: image.originalname,
      filepath: image.path,
    };
    if (image?.size > 1 * 1024 * 1024) {
      taskTracker.start();
      filepath = await compressImage(image.filename);
      taskTracker.stop();
      console.log(`1.1-Compressing file took : ${taskTracker.getTime()}`);
    }
    taskTracker.start();
    const data = fs.readFileSync(filepath.filepath);
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/maskformer-swin-base-coco",
      {
        headers: {
          Authorization: "Bearer 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",
        },
        method: "POST",
        body: data,
      }
    );
    const result = await response.json();
    taskTracker.stop();
    console.log(`2-Generating mask/json :${taskTracker.getTime()}`);
    taskTracker.start();
    const maskName = await convertDataToImage(result);
    taskTracker.stop();
    console.log(`3-Creating mask from json :${taskTracker.getTime()}`);
    taskTracker.start();
    const maskUrl = await uploadFileToFirebase(maskName, "data");
    const imageUrl = await uploadFileToFirebase(
      image.filename,
      "data"
      // fb_tufVisualizerInstance
    );
    taskTracker.stop();
    console.log(`4-Upload image to firebase :${taskTracker.getTime()}`);
    taskTracker.start();
    const prompts = await getDocument(
      "prompts",
      "FHR3HO03svsLcrpHCfWv",
      fb_tufVisualizerInstance
    );
    taskTracker.stop();
    console.log(
      `5-Getting image properties from firebase :${taskTracker.getTime()}`
    );
    taskTracker.start();
    let randomNumber = Math.round(Math.random());
    const output_1: any = await replicate.run(
      "fofr/realvisxl-v3:33279060bbbb8858700eb2146350a98d96ef334fcf817f37eb05915e1534aa1c",
      {
        input: {
          mask: maskUrl,
          seed:
            (randomNumber === 0 ? prompts.seed_1 : prompts._seed_2) || 34078,
          image: imageUrl,
          width: 1024,
          height: 1024,
          prompt: prompts.prompt || "Dark green turf",
          refine: "no_refiner",
          scheduler: "K_EULER",
          lora_scale: 0.6,
          num_outputs: 1,
          guidance_scale: 7.5,
          apply_watermark: false,
          high_noise_frac: 0.8,
          negative_prompt:
            prompts.negative_prompt ||
            " , worst quality, low quality, illustration, 3d, 2d, painting, cartoons, sketch",
          prompt_strength: 0.8,
          num_inference_steps: 20, // 20
        },
      }
    );
    taskTracker.stop();
    console.log(output_1[0]);
    console.log(`6-Generating images :${taskTracker.getTime()}`);
    deleteImage(filepath.filename);
    deleteImage(maskName);
    firebaseProcess(output_1[0], req.body.userId);
    return res.status(200).json({ url: [output_1[0]] });
  } catch (error: any) {
    console.log(error.message);
    // console.trace(error);
    return res.status(500).json({ message: error.message });
  }
};
