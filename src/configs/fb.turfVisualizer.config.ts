import * as admin from "firebase-admin";
require("dotenv").config();

const { privateKey } = JSON.parse(
  process.env.FIREBASE_TURF_VISUALIZER_PRIVATE_KEY || ""
);

const fb_tufVisualizerInstance = admin.initializeApp(
  {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_TURF_VISUALIZER_PROJECT_ID,
      clientEmail: process.env.FIREBASE_TURF_VISUALIZER_CLIENT_EMAIL,
      privateKey,
    }),
    storageBucket: process.env.FIREBSE_TURF_VISUALIZER_STORAGE_BACKET,
  },
  "turf-visualizer"
);

export { fb_tufVisualizerInstance };
