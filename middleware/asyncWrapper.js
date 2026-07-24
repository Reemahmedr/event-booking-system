const asyncWrapper = (asyncFunction) => {
  return (req, res, next) => {
    return asyncFunction(req, res, next).catch((err) => {
      next(err);
    });
  };
};

export default asyncWrapper;
