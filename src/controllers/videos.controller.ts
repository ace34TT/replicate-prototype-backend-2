import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";

export const videoDescription = async (req: Request, res: Response) => {
  try {
    const [prompt, video] = [req.body.prompt, req.body.video];
    console.log("ask video");
    console.log(prompt);
    const output = await replicate.run(
      "nateraw/video-llava:a494250c04691c458f57f2f8ef5785f25bc851e0c91fd349995081d4362322dd",
      {
        input: {
          text_prompt: prompt,
          vide_path: video,
        },
      }
    );
    console.log(output);
    return res.status(200).json({ result: output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
