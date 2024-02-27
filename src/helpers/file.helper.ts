import axios from "axios";
import fs from "fs";
import path from "path";
import sharp from "sharp";
const tempDirectory = path.resolve(__dirname, "../tmp/");

export const generateRandomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
export const fetchImage = async (prefix: string, url: string) => {
  folderGuard();
  const response = await axios.get(url, { responseType: "stream" });
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }
  const fileName = prefix + "_" + generateRandomString(10) + ".png";
  const filePath = path.resolve(tempDirectory, fileName);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
};
export const fetchSound = async (prefix: string, url: string) => {
  folderGuard();
  const response = await axios.get(url, { responseType: "stream" });
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }
  const fileName = prefix + "_" + generateRandomString(10) + ".wav";
  const filePath = path.resolve(tempDirectory, fileName);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
};
export const deleteImage = async (filename: string) => {
  console.log("deleting : " + path.resolve(tempDirectory, filename));
  fs.unlinkSync(path.resolve(tempDirectory, filename));
};
export const folderGuard = () => {
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
  }
};
export const getFileName = (url: string) => {
  const parts = url.split("/");
  const fileName = parts[parts.length - 1];
  return fileName;
};
export const getFilePath = async (fileName: string) => {
  return path.resolve(tempDirectory, fileName);
};
export const convertDataToImage = async (data: any): Promise<string> => {
  let result = data.filter((item: any) => item.label === "grass-merged");
  if (!result) throw new Error("Could not convert");
  const base64Data = result[0].mask.replace(/^data:image\/\w+;base64,/, "");
  const filename = generateRandomString(10);
  const dataBuffer = Buffer.from(base64Data, "base64");
  await fs.promises.writeFile(
    path.resolve(tempDirectory, `${filename}.png`),
    dataBuffer
  );
  return filename + ".png";
};
export const fetchFile = async (
  prefix: string,
  url: string,
  extension: string
) => {
  folderGuard();
  const response = await axios.get(url, { responseType: "stream" });
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }
  const fileName = prefix + "_" + generateRandomString(10) + "." + extension;
  const filePath = path.resolve(tempDirectory, fileName);
  const writer = fs.createWriteStream(filePath);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(filePath));
    writer.on("error", reject);
  });
};
export const compressImage = async (image: string) => {
  const outputName = generateRandomString(10) + ".jpg";
  await new Promise((resolve, reject) => {
    sharp(path.resolve(tempDirectory, image))
      .withMetadata()
      .jpeg({ quality: 50 })
      .toFile(path.resolve(tempDirectory, outputName), (err, info) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Image compressed successfully");
          resolve(info);
        }
      });
  });
  return {
    filename: outputName,
    filepath: path.resolve(tempDirectory, outputName),
  };
};
