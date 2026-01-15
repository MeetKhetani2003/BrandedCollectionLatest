import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";
import { Readable } from "stream";

let bucket;
const BUCKET_NAME = "productImages";

/**
 * Ensures Mongo connection is fully established before creating GridFSBucket.
 */
async function getGridFSBucket() {
  // If Mongo isn't ready, wait for it.
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connection.asPromise();
  }

  // Create bucket only once (singleton)
  if (!bucket) {
    bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: BUCKET_NAME,
    });
  }

  return bucket;
}

/**
 * Uploads a buffer into GridFS safely.
 * Ensures metadata flushes and `_id` always exists.
 *
 * @param {Buffer} fileBuffer
 * @param {string} filename
 * @param {string} contentType
 * @returns {Promise<{ id: mongoose.Types.ObjectId, filename: string }>}
 */
export async function uploadToGridFs(fileBuffer, filename, contentType) {
  const bucket = await getGridFSBucket();

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error(`Upload aborted: ${filename} is empty (0 bytes).`);
  }

  const readableStream = Readable.from(fileBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      contentType,
      metadata: { originalName: filename },
    });

    readableStream.pipe(uploadStream);

    uploadStream.on("error", (err) => {
      reject(err);
    });

    uploadStream.on("finish", () => {
      if (!uploadStream.id) {
        return reject(
          new Error(
            `GridFS upload finished but NO file ID returned for ${filename}`
          )
        );
      }

      resolve({
        id: uploadStream.id,
        filename: filename,
      });
    });
  });
}

/**
 * Deletes a file from GridFS
 * @param {string | mongoose.Types.ObjectId} fileId
 * @returns {Promise<void>}
 */
export async function deleteFromGridFs(fileId) {
  if (!fileId) return;

  const bucket = await getGridFSBucket();
  let objectId;

  try {
    objectId = new mongoose.Types.ObjectId(fileId);
  } catch {
    console.warn(`⚠️ Invalid GridFS ID format: ${fileId}`);
    return;
  }

  try {
    await bucket.delete(objectId);
  } catch (error) {
    if (error.message.includes("File not found")) {
      console.warn(`⚠️ File not found in GridFS: ${fileId}`);
      return;
    }
    throw error;
  }
}

/**
 * Streams a file from GridFS (for API / GET image route)
 */
export async function readFromGridFs(fileId) {
  const bucket = await getGridFSBucket();
  const objectId = new mongoose.Types.ObjectId(fileId);
  return bucket.openDownloadStream(objectId);
}
