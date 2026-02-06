import { getCourierToken } from "./tokenHelper";

async function fetchAwbTracking(awbNumber) {
  const token = await getCourierToken();

  const res = await fetch(
    `http://shreetirupaticourier.net/STCS_Tracking.aspx?Token=${token}&AWBNo=${awbNumber}`,
  );

  return await res.json();
}

export { fetchAwbTracking };
