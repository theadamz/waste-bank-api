import { Context } from "hono";

type error = {
  expected: string;
  code: string;
  path: string[];
  message: string;
};

type errors = {
  [key: string]: string[];
};

export const validatorHandler = (result: any, c: Context) => {
  if (!result.success) {
    const errors: error[] = JSON.parse(result.error.message);

    // refactor errors
    const refactorErrors: errors = errors.reduce((acc, item) => {
      // get key
      const key = item.path[0];

      // create blank array
      if (key in acc === false) {
        acc[key] = [];
      }

      // push it
      if (Array.isArray(item.message)) {
        acc[key] = item.message;
      } else {
        acc[key].push(item.message);
      }

      return acc;
    }, {} as errors);

    return c.json(
      {
        message: "Bad Request",
        errors: refactorErrors,
      },
      400
    );
  }
};
