import { google, youtube_v3 } from "googleapis";
import dotenv from "dotenv";
dotenv.config();
const oauth2Client = new google.auth.OAuth2(
  process.env.YOUTUBE_CLIENT_ID,
  process.env.YOUTUBE_SECRET,
  "https://bb2c-197-158-81-123.ngrok-free.app/auth/google/callback"
);

oauth2Client.setCredentials({
  access_token: process.env.YOUTUBE_ACCESS_TOKEN,
  refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  // scope: process.env.YOUTUBE_SCOPE,
  // token_type: "Bearer",
  // expiry_date: Number(process.env.YOUTUBE_EXPIRY_DATE),
});

// const authUrl = oauth2Client.generateAuthUrl({
//   access_type: "offline",
//   scope: "https://www.googleapis.com/auth/youtube.upload",
// });
// console.log("Authorize this app by visiting this URL:", authUrl);

const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

export { oauth2Client as OAuth2Client, youtube };
