import { cookies } from "next/headers";

export const tokenData = async () => {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth");
  return authCookie;
};
