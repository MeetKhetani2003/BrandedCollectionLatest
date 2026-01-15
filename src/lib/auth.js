import { getCookie } from "cookies-next";
import { cookies } from "next/headers";
import { States } from "./states";

export function getAuthServer() {
  const token = getCookie("auth", { cookies });

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
export const isLoggedIn = () => {
  return Boolean(getCookie("auth"));
};

export async function isAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth")?.value;

  if (!token) {
    return redirect("/auth");
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    States().setAuth(true);
  } catch (err) {
    return redirect("/auth");
  }
  return { auth };
}
