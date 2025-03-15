import { SessionOptions } from "iron-session";

export interface SessionData{
  fileUrl?: string;
}

export const sessionOptions: SessionOptions = {
  cookieName: "myapp_session",
  password: process.env.SESSION_SECRET as string,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};
