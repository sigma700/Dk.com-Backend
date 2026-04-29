import {User} from "../database/models/userSchema.js";

export const checkAuth = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
        data: null,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found. Please log in again.",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Authenticated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
