import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../../lib/dbConnect";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import User from "@/pages/models/User";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await dbConnect();

    const session =await getSession(req, res);
    if (!session || !session.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No session found" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortField = (req.query.sortField as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? 1 : -1;
    const email = req.query.email as string;
    const userType = req.query.userType as string;
    const roleType = req.query.roleType as string;
    const auth0Id = req.query.auth0Id as string;

    const filter: any = {};

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }

    if (userType) {
      filter.userType = userType;
    }

    if (roleType) {
      filter.role_type = roleType;
    }

    if (auth0Id) {
      filter.auth0Id = auth0Id;
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortField]: sortOrder };

    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("User list error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch users",
    });
  }
});
