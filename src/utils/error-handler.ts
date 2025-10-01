import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { HTTPResponseError } from "hono/types";

export const errorHandler = (err: HTTPResponseError | Error, c: Context) => {
  // set status
  c.status(500);

  if (err instanceof HTTPException) {
    return c.json(
      {
        message: err.message,
        errors: err.cause,
      },
      err.status
    );
  }

  return c.json(err.message);
};
