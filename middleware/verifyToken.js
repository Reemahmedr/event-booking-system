import httpStatusText from "../utils/httpStatusText.js";
import jwt from "jsonwebtoken";

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  // if (!authHeader) {
  //   return res
  //     .status(401)
  //     .json({ status: httpStatusText.FAIL, msg: "unauthorized" });
  // }
  // const token = authHeader.split(" ")[1];
  let token;

  if (authHeader) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      status: httpStatusText.FAIL,
      msg: "unauthorized",
    });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECERT);
    req.user = decode;
    next();
  } catch (error) {
    return res.status(400).json({ status: httpStatusText.FAIL, msg: error });
  }
}

export default verifyToken;
