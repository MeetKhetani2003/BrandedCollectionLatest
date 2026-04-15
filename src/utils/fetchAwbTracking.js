import { getCourierToken } from "./tokenHelper";

export async function fetchAwbTracking(awbNumber) {
  const token = await getCourierToken();

  if (!token) {
    throw new Error("Failed to obtain a valid tracking token.");
  }

  const res = await fetch(
    `http://shreetirupaticourier.net/STCS_Tracking.aspx?Token=${token}&AWBNo=${awbNumber}`,
  );
  console.log("-->", res);

  return await res.json();
}
