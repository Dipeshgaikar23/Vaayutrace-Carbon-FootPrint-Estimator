const errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  
  res.status(500).json({
    message: "Server Error",
    error: err.message,
  });
};

export default errorHandler;
