import dbConnect from "../../../lib/dbConnect";
import { NextApiRequest, NextApiResponse } from "next";
import User from "../../models/User";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // Get user session
  const session = await getSession(req, res);
  if (!session || !session.user || !session.user.email) {
    return res.status(401).json({ error: "Unauthorized: No valid session" });
  }
  const { id } = req.query;
  const user = await User.findOne({ auth0Id: id });

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ userType: user.userType });
});
