import axios from "axios";
import fs from "fs";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../tmp/");
import ffmpeg from "fluent-ffmpeg";
import { deleteImage, fetchSound, generateRandomString } from "./file.helper";
import { uploadFileToFirebase } from "../services/firebase.service";
export const mp3ToWave = async (file: string) => {
  const track = path.resolve(tempDirectory, file); // your path to source file
  const outputName = generateRandomString(10) + ".wav";
  await convertToWav(track, outputName);
  const url = await uploadFileToFirebase(outputName);
  console.log(url);
  deleteImage(outputName);
  deleteImage(file);
  return url;
};
async function convertToWav(track: any, outputName: any) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(track)
      .toFormat("wav")
      .on("error", (err) => {
        console.log("An error occurred: " + err.message);
        reject(err);
      })
      .on("progress", (progress) => {
        console.log("Processing: " + progress.targetSize + " KB converted");
      })
      .on("end", () => {
        console.log("Processing finished !");
        resolve();
      })
      .save(path.resolve(tempDirectory, outputName));
  });
}
export const wavToMp3 = async (url: string) => {
  // download the file ,
  const file = (await fetchSound("sound_to_convert", url)) as string;
  // convert the file
  const outputName = generateRandomString(10) + ".mp3";
  await convertAudio(file, outputName);
  // upload the file
  const _url = await uploadFileToFirebase(outputName);
  console.log(url);
  deleteImage(outputName);
  deleteImage(file);
  return _url;
  // return the url
};
const convertAudio = async (track: any, outputName: string) => {
  return new Promise((resolve, reject) => {
    ffmpeg(track)
      .toFormat("mp3")
      .on("error", (err) => {
        console.log("An error occurred: " + err.message);
        reject(err);
      })
      .on("progress", (progress) => {
        console.log("Processing: " + progress.targetSize + " KB converted");
      })
      .on("end", () => {
        console.log("Processing finished !");
        resolve(true);
      })
      .save(path.resolve(tempDirectory, outputName));
  });
};
export const mp3WavToMp4 = async (inputFile: string, outputFile: string) => {
  return new Promise((resolve, reject) => {
    ffmpeg(path.resolve(tempDirectory, inputFile))
      .output(path.resolve(tempDirectory, outputFile))
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
};
