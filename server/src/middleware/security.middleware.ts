import { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { unifiedResponse } from 'uni-response';

import { ERROR } from '../constants/messages';

/* The `const rateLimiter` declaration is creating a rate-limiting middleware using the
`express-rate-limit` package. It is configuring the rate limiter to allow a maximum of 100 requests
per IP address within a 15-minute window. Additionally, it is specifying to return rate limit
information in the `RateLimit-*` headers and disable the `X-RateLimit-*` headers. This middleware
will help prevent abuse or excessive requests from a single IP address by enforcing the specified
rate limit. */
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Limit each IP to 1000 requests per minute (generous for dev)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: 'Too many requests, please try again later.' },
});

// Middleware to check host whitelist
/**
 * The function `hostWhitelist` checks if the request origin is in the allowed URLs whitelist and
 * either allows or denies access accordingly.
 * @param {string[]} allowedUrls - The `allowedUrls` parameter in the `hostWhitelist` function is an
 * array of strings that contains the URLs that are allowed to access the server. The function checks
 * if the `origin` header of the incoming request matches any of the URLs in the `allowedUrls` array to
 * determine if the
 * @returns A function that acts as a middleware to check if the request origin is whitelisted in the
 * provided `allowedUrls` array. If the origin is allowed, the middleware calls the `next()` function
 * to continue processing the request. If the origin is not allowed, it returns a 403 status with an
 * error message and stops further processing.
 */
const hostWhitelist = (allowedUrls: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { origin } = req.headers;

    if (!origin) {
      res.status(400).json(unifiedResponse(false, ERROR.ORIGIN_HEADER_IS_MISSING));
      return; // Exit to ensure no further middleware runs
    }

    if (allowedUrls.includes(origin as string)) {
      next(); // Host is whitelisted, continue processing the request
    } else {
      res.status(403).json(unifiedResponse(false, ERROR.ACCESS_FORBIDDEN));
      return; // Exit to stop further processing
    }
  };
};

export { hostWhitelist, rateLimiter };
