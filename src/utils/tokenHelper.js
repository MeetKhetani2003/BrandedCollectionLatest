let cachedToken = null;
let tokenExpiry = null;

export async function getCourierToken() {
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }

  const res = await fetch(
    `http://shreetirupaticourier.net/STCS_Token.aspx?UID=${process.env.STC_UID}&PWD=${process.env.STC_PWD}`,
  );

  const token = await res.text();

  cachedToken = token;
  tokenExpiry = Date.now() + 3 * 60 * 60 * 1000; // 3 hours

  return token;
}
