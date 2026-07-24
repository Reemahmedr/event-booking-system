import jwt from "jsonwebtoken";

function JWT(payload) {
  return jwt.sign(payload, process.env.JWT_SECERT, {
    expiresIn: "1h",
  });
}

export default JWT;
