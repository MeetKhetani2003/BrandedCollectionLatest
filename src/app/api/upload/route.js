// // app/api/upload/route.js
// import { NextResponse } from "next/server";
// import { getDriveClient, PRODUCT_FOLDER_ID } from "@/lib/gridFsClient"; // Import the client and folder ID

// // Set config for Next.js to parse the request body as a stream (for large files)
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

// // Utility function to convert stream to buffer
// async function streamToBuffer(stream) {
//   return new Promise((resolve, reject) => {
//     const chunks = [];
//     stream.on("data", (chunk) => chunks.push(chunk));
//     stream.on("error", reject);
//     stream.on("end", () => resolve(Buffer.concat(chunks)));
//   });
// }

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("productImage"); // Assuming the client sends the file with key 'productImage'

//     if (!file) {
//       return NextResponse.json(
//         { message: "No file uploaded" },
//         { status: 400 }
//       );
//     }

//     const drive = getDriveClient();
//     const fileBuffer = await streamToBuffer(file.stream());

//     const fileMetadata = {
//       name: file.name,
//       parents: [PRODUCT_FOLDER_ID], // Use the folder ID from the environment
//     };

//     const media = {
//       mimeType: file.type,
//       body: fileBuffer,
//     };

//     // --- UPLOAD TO GOOGLE DRIVE ---
//     const uploadedFile = await drive.files.create({
//       requestBody: fileMetadata,
//       media: media,
//       fields: "id, name", // We only need the ID to store in the database
//     });

//     // The image link to be stored in MongoDB for retrieval:
//     const driveFileId = uploadedFile.data.id;
//     const directImageUrl = `https://drive.google.com/uc?export=view&id=${driveFileId}`;

//     return NextResponse.json(
//       {
//         status: "success",
//         fileId: driveFileId,
//         imageUrl: directImageUrl,
//       },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Image Upload Error:", error);
//     return NextResponse.json(
//       {
//         status: "error",
//         message: "Failed to upload image to Google Drive",
//         details: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
