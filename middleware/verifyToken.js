import httpStatusText from "../utils/httpStatusText.js";
import jwt from "jsonwebtoken";

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(401)
      .json({ status: httpStatusText.FAIL, msg: "unauthorized" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decode = jwt.verify(token, process.env.JWT_SECERT);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(400).json({ status: httpStatusText.FAIL, msg: error });
  }
}

export default verifyToken
