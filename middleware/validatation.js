import deleteFile from "../utils/deleteFile.js";
import httpStatusText from "../utils/httpStatusText.js";

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body); //the schema will be passed from the route and the code is resuable

    if (!result.success) {
      deleteFile(req.file?.path);
      return res.status(400).json({
        status: httpStatusText.FAIL,
        message: result.error.issues.map((issue) => ({
          path: issue.path[0],
          message: issue.message,
          min: issue.minimum,
        })),
      });
    }

    req.body = result.data; // Update req.body with the validated data

    next();
  };
};

export default validate;
