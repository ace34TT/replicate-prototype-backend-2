import { Request, Response } from "express";
import { replicate } from "../configs/replicate.config";
import { deleteImage, generateRandomString } from "../helpers/file.helper";
import { deleteFile, uploadFileToFirebase } from "../services/firebase.service";
import { mp3WavToMp4 } from "../helpers/audio.helper";

export const createRvcDataSetHandler = async (req: Request, res: Response) => {
  try {
    console.log("create dataset");
    const output: any = await replicate.run(
      "zsxkib/create-rvc-dataset:c445e27ff34574e92781c15c67db41835cedcdc27a19f527a7dcf37bd0ffe1ff",
      {
        input: {
          audio_name: "sarah_kays",
          youtube_url: "https://www.youtube.com/watch?v=lOpWZb_z93Q",
        },
      }
    );
    console.log(output);
    // const filename = (await fetchFile("ds", output, "zip")) as string;
    return res.status(200).json({ url: output });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const trainRvcModelHandler = async (req: Request, res: Response) => {
  try {
    console.log("processing");
    const output = await replicate.run(
      "replicate/train-rvc-model:0397d5e28c9b54665e1e5d29d5cf4f722a7b89ec20e9dbf31487235305b1a101",
      {
        input: {
          epoch: 80,
          version: "v2",
          f0method: "rmvpe_gpu",
          batch_size: "7",
          dataset_zip:
            "https://replicate.delivery/pbxt/zTUVodxJvYIZHZtBOVbh4fdodidEJ8JoibgWTWW1AOH6NMDJA/dataset_fireship_io.zip",
          sample_rate: "48k",
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
export const voiceCloningHandler = async (req: Request, res: Response) => {
  try {
    const [song_input, speech] = [req.body.song_input, req.file];
    if (!speech) return;
    console.log(song_input, speech);
    const mp4Filename = generateRandomString(10) + ".mp4";
    await mp3WavToMp4(speech.filename, mp4Filename);
    const mp4Url = await uploadFileToFirebase(mp4Filename);
    console.log(mp4Url);
    console.log("processing dataset");
    const dataset_url: any = await replicate.run(
      "zsxkib/create-rvc-dataset:c445e27ff34574e92781c15c67db41835cedcdc27a19f527a7dcf37bd0ffe1ff",
      {
        input: {
          audio_name: generateRandomString(10),
          youtube_url: mp4Url,
        },
      }
    );
    console.log("dataset url : ", dataset_url);
    const model_url = await replicate.run(
      "replicate/train-rvc-model:0397d5e28c9b54665e1e5d29d5cf4f722a7b89ec20e9dbf31487235305b1a101",
      {
        input: {
          epoch: 80,
          version: "v2",
          f0method: "rmvpe_gpu",
          batch_size: "7",
          dataset_zip: dataset_url,
          sample_rate: "48k",
        },
      }
    );
    console.log("model url : ", model_url);
    const output = await replicate.run(
      "zsxkib/realistic-voice-cloning:0a9c7c558af4c0f20667c1bd1260ce32a2879944a0b9e44e1398660c077b1550",
      {
        input: {
          protect: 0.33,
          rvc_model: "CUSTOM",
          index_rate: 0.5,
          reverb_size: 0.15,
          pitch_change: "no-change",
          rms_mix_rate: 0.25,
          filter_radius: 3,
          output_format: "mp3",
          reverb_damping: 0.7,
          reverb_dryness: 0.8,
          reverb_wetness: 0.2,
          crepe_hop_length: 128,
          pitch_change_all: 0,
          main_vocals_volume_change: 10,
          pitch_detection_algorithm: "rmvpe",
          instrumental_volume_change: 0,
          backup_vocals_volume_change: 0,
          song_input: song_input,
          custom_rvc_model_download_url: model_url,
        },
      }
    );
    console.log(output);
    deleteImage(speech.filename);
    deleteImage(mp4Filename);
    deleteFile(mp4Filename);
    return res.status(200).json({
      url: mp4Url,
      model_url,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
export const voiceCloningWithExistingModelHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const [song_input, model_url] = [req.body.song_input, req.body.model];
    console.log(song_input, model_url);
    console.log("starting process");
    const output = await replicate.run(
      "zsxkib/realistic-voice-cloning:0a9c7c558af4c0f20667c1bd1260ce32a2879944a0b9e44e1398660c077b1550",
      {
        input: {
          protect: 0.33,
          rvc_model: "CUSTOM",
          index_rate: 0.5,
          reverb_size: 0.15,
          pitch_change: "no-change",
          rms_mix_rate: 0.25,
          filter_radius: 3,
          output_format: "mp3",
          reverb_damping: 0.7,
          reverb_dryness: 0.8,
          reverb_wetness: 0.2,
          crepe_hop_length: 128,
          pitch_change_all: 0,
          main_vocals_volume_change: 10,
          pitch_detection_algorithm: "rmvpe",
          instrumental_volume_change: 0,
          backup_vocals_volume_change: 0,
          song_input: song_input,
          custom_rvc_model_download_url: model_url,
        },
      }
    );
    console.log("done", output);
    return res.status(200).json({
      url: output,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
};
