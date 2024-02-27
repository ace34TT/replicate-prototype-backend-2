import { resizeImage } from "./../helpers/image.helper";
import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";
import { deleteFile, uploadFileToFirebase } from "../services/firebase.service";
import { SDXLPayload } from "../models/input.model";
import { deleteImage, getFileName } from "../helpers/file.helper";
import io from "../index";

export const promptToVideoHandler = async (req: Request, res: Response) => {
  type Model = `${string}/${string}:${string}`;
  try {
    const userModel = req.params.model;
    // const socketId = req.query.socketId as string;
    // console.log(socketId);
    // if (!socketId && !io.sockets.sockets.has(socketId))
    //   throw new Error("could not extract data from this file");
    // const socket = io.sockets.sockets.get(socketId);
    let model: Model = `_/_:_`,
      data;
    switch (userModel) {
      case "deforum_stable_diffusion":
        console.log("deforum_stable_diffusion");
        model =
          "deforum/deforum_stable_diffusion:e22e77495f2fb83c34d5fae2ad8ab63c0a87b6b573b6208e1535b23b89ea66d6";
        data = {
          animation_prompts: req.body.prompt,
        };
        break;
      case "stable-diffusion-animation":
        model =
          "andreasjansson/stable-diffusion-animation:ca1f5e306e5721e19c473e0d094e6603f0456fe759c10715fcd6c1b79242d4a5";
        data = {
          prompt_start: req.body.start_prompt,
          prompt_end: req.body.end_prompt,
          output_format: "mp4",
        };
        console.log("stable-diffusion-animation", data);
        break;
      case "stable-diffusion-dance":
        console.log("stable-diffusion-dance");
        model =
          "pollinations/stable-diffusion-dance:dfb636aa9c04fe5b7d9897e6159ef88e3ecb3e1eb274c3f072dca7b495823280";
        data = {
          prompts: req.body.prompts,
        };
        break;
      case "i2vgen-xl":
        console.log("i2vgen-xl");
        console.log(req.body.file_url);
        model =
          "cjwbw/i2vgen-xl:92fc2f3e3db369db6065bcd3295dac2afbfd612a7cc4abcb45bd4707ccb55b7a";
        data = {
          task: "image-to-video",
          input_file: req.body.file_url,
          text: req.body.prompt,
          high_resolution: false,
        };
        break;
      default:
        break;
    }
    const output: any = await replicate.run(model, {
      input: { ...data },
    });
    console.log(output);
    // socket!.emit("job_done", { url: output });
    return res.status(200).json({ url: output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const imageToImageHandler = async (req: Request, res: Response) => {
  try {
    const [prompt, image, width, height] = [
      req.body.prompt,
      req.body.image,
      req.body.width,
      req.body.height,
    ];
    console.log("making image 2 image request");
    const output = await replicate.run(
      "stability-ai/sdxl:8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f",
      {
        input: {
          prompt: prompt,
          image: image,
          height: width,
          width: height,
          num_outputs: req.body.outputs || 2,
        },
      }
    );
    console.log(output);
    return res.status(200).json({ ...output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const anyToImageHandler = async (req: Request, res: Response) => {
  console.log("calling any to image");
  const [prompt, image, image_url, width, height, numInferenceSteps] = [
    req.body.prompt,
    req.file,
    req.body.image,
    req.body.width,
    req.body.height,
    req.body.num_inference_steps,
  ];

  try {
    const input: SDXLPayload = {
      prompt: prompt,
      width: Number(width),
      height: Number(height),
      num_outputs: Number(req.body.num_outputs) || 1,
    };
    let resizedFile;
    console.log(width, height);

    // let model: any =
    //   "luosiallen/latent-consistency-model:553803fd018b3cf875a8bc774c99da9b33f36647badfd88a6eec90d61c5f62fc";
    let model: any =
      "stability-ai/sdxl:8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f";
    if (image || image_url)
      model =
        "stability-ai/sdxl:8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f";
    if (image) {
      resizedFile = await resizeImage(
        image.filename,
        Number(width),
        Number(height)
      );
      input.image = await uploadFileToFirebase(resizedFile!);
      input.prompt_strength = Number(req.body.prompt_strength) || 0.8;
      input.num_inference_steps = Number(numInferenceSteps) || 30;
    }
    if (image_url) {
      input.image = image_url;
      input.prompt_strength = Number(req.body.prompt_strength) || 0.8;
      input.num_inference_steps = Number(numInferenceSteps) || 30;
    }
    console.log(model);
    const output = await replicate.run(model, { input });
    image && deleteImage(image?.filename);
    resizedFile && deleteImage(resizedFile);
    image && input.image && deleteFile(getFileName(input.image));
    console.log(output);
    console.log("job done");
    return res.status(200).json({ ...output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const essd_1b_img2imgHandler = async (req: Request, res: Response) => {
  const [
    prompt,
    image,
    image_url,
    width,
    height,
    numInferenceSteps,
    promptStrength,
  ] = [
    req.body.prompt,
    req.file,
    req.body.image,
    req.body.width,
    req.body.height,
    req.body.num_inference_steps,
    req.body.prompt_strength,
  ];
  try {
    const input = {
      image: "",
      prompt: prompt,
      strength: Number(promptStrength) || 0.65,
      scheduler: "K_EULER",
      guidance_scale: 8,
      num_inference_steps: Number(numInferenceSteps) || 30,
    };
    let resizedFile, generated_url;
    if (image) {
      resizedFile = await resizeImage(
        image!.filename,
        Number(width),
        Number(height)
      );
      generated_url = await uploadFileToFirebase(resizedFile!);
      input.image = generated_url;
    }
    if (image_url) {
      input.image = image_url;
    }
    console.log("making the request ");

    const output = await replicate.run(
      "lucataco/ssd-1b-img2img:8d758408398a909fb7696c2a04ea044158de351b6b87cf0934d1f11bc3e4ad39",
      {
        input,
      }
    );
    console.log("request done ");
    image && deleteImage(image?.filename);
    resizedFile && deleteImage(resizedFile);
    image && input.image && deleteFile(getFileName(input.image));
    console.log(output);

    return res.status(200).json({ url: output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const promptToMusicHandler = async (req: Request, res: Response) => {
  try {
    const [prompt] = [req.body.prompt];
    console.log("making music : " + prompt);
    const output = await replicate.run(
      "meta/musicgen:7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906",
      {
        input: {
          prompt: prompt,
          temperature: 1,
          model_version: "large",
          duration: 15,
          output_format: "mp3",
          normalization_strategy: "peak",
        },
      }
    );
    console.log(output);
    return res.status(200).json(output);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const coverMakerHandler = async (req: Request, res: Response) => {
  try {
    const [song_input, rvc_model] = [req.body.song_input, req.body.rvc_model];
    console.log("making cover ");
    const output = await replicate.run(
      "zsxkib/realistic-voice-cloning:0a9c7c558af4c0f20667c1bd1260ce32a2879944a0b9e44e1398660c077b1550",
      {
        input: {
          song_input,
          rvc_model,
        },
      }
    );
    console.log(output);
    return res.status(200).json(output);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const promptToVoiceHandler = async (req: Request, res: Response) => {
  const [text, language, speaker_wav] = [
    req.body.text,
    req.body.language,
    req.body.speaker_wav,
  ];
  console.log({
    text: text,
    language: language,
    speaker_wav: speaker_wav,
  });
  try {
    const output = await replicate.run(
      "lucataco/xtts-v2:e876df565d4d629da440ce5820d1d2c8c2adb963f52e526efc064911f841f85e",
      {
        input: {
          text: text,
          language: language,
          speaker_wav: speaker_wav,
        },
      }
    );
    console.log(output);
    return res.status(200).json(output);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const realisticBackgroundHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const [prompt, image] = [req.body.prompt, req.body.image];
    console.log(prompt, image);
    const output = await replicate.run(
      "wolverinn/realistic-background:f77210f166f419c82faf53e313a8b18b24c2695d58116b4a77a900b2715f595a",
      {
        input: {
          prompt: prompt,
          image: image,
          negative_prompt: "human",
        },
      }
    );
    console.log(output);
    return res.status(200).json({ ...output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const removeBackgroundHandler = async (req: Request, res: Response) => {
  try {
    console.log("remove background");
    const [image] = [req.body.image];
    const output = await replicate.run(
      "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
      {
        input: {
          image: image,
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
export const upscaleHandler = async (req: Request, res: Response) => {
  try {
    console.log("processing");
    const [image] = [req.body.image];
    const output = await replicate.run(
      "daanelson/some-upscalers:3078c9717f1b83d4fa86890b769f047695daff189028b96dcf517747853a48b0",
      {
        input: {
          image: image,
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
export const realEsrganHandler = async (req: Request, res: Response) => {
  try {
    console.log("processing");
    const [image, scale] = [req.body.image, req.body.scale];
    const output = await replicate.run(
      "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      {
        input: {
          image: image,
          scale: scale,
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
export const image2videoHandler = async (req: Request, res: Response) => {
  try {
    const [startPrompt, endPrompt, image] = [
      req.body.startPrompt,
      req.body.endPrompt,
      req.body.image,
    ];
    const socketId = req.query.socketId as string;
    console.log(socketId);
    if (!socketId && !io.sockets.sockets.has(socketId))
      throw new Error("could not extract data from this file");
    const socket = io.sockets.sockets.get(socketId);

    const output = await replicate.run(
      "fofr/lcm-animation:643766d26270d14a9a2232d8cc4ac503f367b867e9d6e9f8d6949c7d2ed5d52f",
      {
        input: {
          start_prompt: startPrompt,
          end_prompt: endPrompt,
          image: image,
        },
      }
    );
    console.log(output);
    socket!.emit("job_done", { url: output });
    return res.status(200).json({ url: output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const video2VideoHandler = async (req: Request, res: Response) => {
  try {
    const [prompt, fps, video] = [
      req.body.prompt,
      req.body.fps,
      req.body.video,
    ];
    console.log("making video to video rq");
    console.log(prompt);

    const output = await replicate.run(
      "fofr/lcm-video2video:4a9c4bf075ec55d1194c12c26b837724cb7181fcf13cfb83ce92e7b4b6c283e7",
      {
        input: {
          prompt: prompt,
          video: video,
          fps: Number(fps),
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
