import { youtube } from "../configs/youtube.config";
import fs from "fs";
import path from "path";
const tempDirectory = path.resolve(__dirname, "../tmp/");

export const uploadVideo = async (videoPath: string): Promise<void> => {
  const req = youtube.videos.insert(
    {
      requestBody: {
        snippet: {
          title: "Testing YouTube API Node.js",
          description: "Test video upload via YouTube API",
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      part: ["snippet", "status"],
      media: {
        mimeType: "video/*",
        body: fs.createReadStream(path.resolve(tempDirectory, videoPath)),
      },
    },
    {
      // Additional request options here if needed
    }
  );
  const data = await req;
  console.log(
    `Done. Video URL: https://www.youtube.com/watch?v=${data.data.id}`
  );
};
