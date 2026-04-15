export async function getCourierToken() {
  try {
    const uid = process.env.STC_UID || "118F834C9F";
    const pwd = process.env.STC_PWD || "E0305ED86A";

    if (!uid || !pwd) {
      throw new Error("STC_UID and STC_PWD environment variables are required");
    }

    console.log("Fetching token from courier API...");

    const res = await fetch(
      `http://shreetirupaticourier.net/STCS_Token.aspx?UID=${uid}&PWD=${pwd}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      throw new Error(`Token fetch failed: ${res.statusText}`);
    }

    const rawText = await res.text();

    const token = rawText.replace(/<[^>]*>?/gm, "").trim();
    console.log(token);

    if (!token) {
      throw new Error("Empty token received from API");
    }

    console.log("Fresh Token Generated:", token);

    return token;
  } catch (error) {
    console.error("getCourierToken Error:", error.message);
    return null;
  }
}
