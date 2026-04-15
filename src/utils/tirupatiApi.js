const BASE_URL = "http://shreetirupaticourier.net";

/**
 * Step 1: Get Access Token [cite: 4, 8]
 * The token is valid for 3 hours. [cite: 19]
 */
export async function getTirupatiToken() {
  const uid = process.env.TIRUPATI_UID; // 118F834C9F from your image
  const pwd = process.env.TIRUPATI_PWD; // E0305ED86A from your image

  if (!uid || !pwd) {
    throw new Error(
      "TIRUPATI_UID and TIRUPATI_PWD environment variables are required",
    );
  }

  const res = await fetch(`${BASE_URL}/STCS_Token.aspx?UID=${uid}&PWD=${pwd}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch token: ${res.statusText}`);
  }

  const token = await res.text(); // The response is a plain string token [cite: 22]
  console.log("Tirupati Token Generated:", token.trim());
  return token.trim();
}

/**
 * Step 2: Get Tracking Data [cite: 5, 24]
 */
export async function getTrackingData(awbNo) {
  const token = await getTirupatiToken();

  if (!token) {
    throw new Error("Failed to obtain a valid tracking token.");
  }

  const res = await fetch(
    `${BASE_URL}/STCS_Tracking.aspx?Token=${token}&AWBNo=${awbNo}`,
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch tracking data: ${res.statusText}`);
  }

  const data = await res.json();
  console.log("Tracking API Response:", JSON.stringify(data, null, 2));
  return data;
}
