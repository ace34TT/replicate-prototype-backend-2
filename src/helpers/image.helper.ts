import { folderGuard, generateRandomString } from "./file.helper";
import sharp from "sharp";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../tmp/");
export const resizeImage = async (
  image: string,
  width: number,
  height: number
) => {
  try {
    folderGuard();
    const resizedFile = "resized _" + generateRandomString(10) + ".jpg";
    await sharp(path.resolve(tempDirectory, image))
      .resize(width, height, { fit: "cover" })
      .toFile(path.resolve(tempDirectory, resizedFile));
    return resizedFile;
  } catch (err) {
    console.error(err);
    // handle the error appropriately
  }
};
