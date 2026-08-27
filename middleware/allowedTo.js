import httpStatusText from "../utils/httpStatusText.js";

const allowedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: httpStatusText.FAIL,
        message: "You don't have access to this action",
      });
    }
    next();
  };
};

export default allowedTo;
