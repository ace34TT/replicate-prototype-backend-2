import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import path from "path";
import { ReplicateRoutes } from "./routes/replicate.routes";
import cors from "cors";
import { fetchImage, fetchSound } from "./helpers/file.helper";
import fs from "fs";
import upload from "./middlewares/multer.middleware";
import { mp3ToWave, wavToMp3 } from "./helpers/audio.helper";
import { VideoRoutes } from "./routes/video.routes";
import { ImageRoutes } from "./routes/image.routes";
import { VoicesRoutes } from "./routes/voices.routes";
import { model } from "./configs/gemini.config";
import { updateDocument } from "./services/firebase.service";
import { fb_tufVisualizerInstance } from "./configs/fb.turfVisualizer.config";
// import { OAuth2Client } from "./configs/youtube.config";
const app = express();
app.use(cors({ origin: true }));

app.use(bodyParser.json());
// !
app.get("/", (req: Request, res: Response) => {
  return res.json({
    message: "Hello world",
  });
});

app.use("/api", ReplicateRoutes);
app.use("/api/video", VideoRoutes);
app.use("/api/images", ImageRoutes);
app.use("/api/voices", VoicesRoutes);

// !

// app.get("/auth/google/callback", async (req, res) => {
//   try {
//     const { code } = req.query;
//     const { tokens } = await OAuth2Client.getToken(code as string);
//     OAuth2Client.setCredentials(tokens);
//     console.log(tokens);
//     res.send("Authentication successful");
//   } catch (error) {
//     console.error("Error during authentication", error);
//     res.status(500).send("Error during authentication");
//   }
// });

app.post(
  "/api/mp3_to_wav",
  upload.single("file"),
  async (req: Request, res: Response) => {
    const url = await mp3ToWave(req.file!.filename);
    console.log(url);
    return res.status(200).json({
      url: url,
    });
  }
);
app.post("/api/wav_to_mp3", async (req: Request, res: Response) => {
  try {
    const url = await wavToMp3(req.body.url);
    console.log(url);

    return res.status(200).json({ url });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error fetching image");
  }
});

app.post("/api/translate", async (req: Request, res: Response) => {
  try {
    const result = await model.generateContent(
      `detect the language of this text :"${req.body.prompt}" , it is not English , translate it in English , if it's not just give the sentence back `
    );
    const response = await result.response;
    const text = response.text();
    return res.status(200).json({ text });
  } catch (error) {
    console.log(error);

    res.status(500).send("Internal server error");
  }
});
app.get("/download", async (req: Request, res: Response) => {
  try {
    console.log("downloading");
    const url: string = req.query.url as string;
    const filePath = (await fetchImage("img_", url)) as string;
    console.log(filePath);
    // Ensure the file is fully written before sending it
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`File doesn't exist`);
        return res.status(500).send("Error downloading file");
      }

      res.download(filePath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error downloading file");
        } else {
          console.log("done");
          // deleteImage(filePath);
        }
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Error fetching image");
  }
});
//
app.use("/api/images", express.static(path.join(__dirname, "images")));
//
app.put("/api/turf-visualizer/prompt", (req: Request, res: Response) => {
  const [prompt, negative_prompt] = [req.body.prompt, req.body.negativePrompt];
  updateDocument(
    "prompts",
    "FHR3HO03svsLcrpHCfWv",
    {
      prompt,
      negative_prompt,
    },
    fb_tufVisualizerInstance
  );
  return res.status(200).send("process done");
});
export { app };
