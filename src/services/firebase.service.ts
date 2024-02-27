import fs from "fs";
import path from "path";
import { fb_fileServerInstance as admin } from "./../configs/fb.fileServer.config";
const tempDirectory = path.resolve(__dirname, "../tmp/");

export const uploadFileToFirebase = async (
  filename: string,
  folder: string = "files",
  firebaseInstance = admin
) => {
  const bucket = firebaseInstance.storage().bucket();
  await bucket.upload(path.resolve(tempDirectory, filename), {
    destination: folder + "/" + filename,
  });
  const fileRef = bucket.file(folder + "/" + filename);
  await fileRef.makePublic();
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileRef.name}`;
  return publicUrl;
};
export const saveFileFromFirebase = async (
  filename: string,
  folder: string = "files"
) => {
  if (!fs.existsSync(tempDirectory)) {
    fs.mkdirSync(tempDirectory, { recursive: true });
  }
  const bucket = admin.storage().bucket();
  const file = bucket.file(folder + filename);
  const destination = path.resolve(tempDirectory + "/" + filename);
  await file.download({ destination });
};
export const deleteFile = async (
  filename: string,
  folder: string = "files"
) => {
  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(folder + filename);
    await file.delete();
  } catch (error: any) {
    console.log(error.message);
    throw new Error(error.message);
  }
};
export const getDocument = async (
  collectionName: any,
  documentId: any,
  firebaseInstance: any
) => {
  const firestore = firebaseInstance.firestore();
  const docRef = firestore.collection(collectionName).doc(documentId);
  // Get the document
  const doc = await docRef.get();

  if (doc.exists) {
    return {
      ...doc.data(),
    };
  } else {
    return {};
  }
};

export const updateDocument = async (
  collectionName: any,
  documentId: any,
  data: any,
  firebaseInstance: any
) => {
  const firestore = firebaseInstance.firestore();
  const docRef = firestore.collection(collectionName).doc(documentId);
  // Update the document
  await docRef.update(data);
};
