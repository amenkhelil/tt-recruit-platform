function sendResponse(res, statusCode, data = null, message = 'Success', meta = null) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}

module.exports = sendResponse;