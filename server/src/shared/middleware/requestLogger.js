export const requestLogger = (req, _res, next) => {
  console.log(`[INCOMING REQUEST]: ${req.method} ${req.originalUrl}`);
  next();
};
