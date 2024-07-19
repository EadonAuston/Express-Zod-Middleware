import { NextFunction, Request, Response } from "express";
import HttpStatusCode from "./status-codes";

const { BAD_REQUEST } = HttpStatusCode;

export const errorHandleMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
};

export const validateRequestId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.params.id || !Number(req.params.id)) {
    return res.status(BAD_REQUEST).send({
      message: "id should be a number",
    });
  }
  next();
};
