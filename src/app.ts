import express from "express";
import { prisma } from "../prisma/prisma-instance";
import {
  errorHandleMiddleware,
  validateRequestId,
} from "./error-handler";
import HttpStatusCode from "./status-codes";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

const { OK, BAD_REQUEST } = HttpStatusCode;

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(OK); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.get("/dogs", async (_req, res) => {
  const dogs = await prisma.dog.findMany();
  return res.send(dogs);
});

app.get(
  "/dogs/:id",
  validateRequestId,
  async (req, res) => {
    const dog = await prisma.dog.findUnique({
      where: { id: +req.params.id },
    });
    return !dog ? res.status(204).send() : res.send(dog);
  }
);

app.delete("/dogs/:id", validateRequestId, (req, res) =>
  prisma.dog
    .delete({
      where: { id: +req.params.id },
    })
    .then((deletedDogData) =>
      res.status(200).send(deletedDogData)
    )
    .catch(() => res.status(204).send())
);

app.post("/dogs", async (req, res) => {
  const { age, name, description, breed, ...invalidKeys } =
    req.body;

  const errors: string[] = [];

  const requiredTypes = [
    { name: "name", value: name, type: "string" },
    {
      name: "description",
      value: description,
      type: "string",
    },
    { name: "breed", value: breed, type: "string" },
    { name: "age", value: age, type: "number" },
  ];

  for (const keys of requiredTypes) {
    if (typeof keys.value !== keys.type) {
      errors.push(`${keys.name} should be a ${keys.type}`);
    }
  }

  for (const key of Object.keys(invalidKeys)) {
    errors.push(`'${key}' is not a valid key`);
  }

  if (errors.length) {
    return res.status(BAD_REQUEST).json({ errors });
  }
  return prisma.dog
    .create({ data: { age, name, description, breed } })
    .then((newDog) => res.status(201).send(newDog))
    .catch(() => res.status(500).send());
});

app.patch(
  "/dogs/:id",
  validateRequestId,
  async (req, res) => {
    const {
      age,
      name,
      description,
      breed,
      ...invalidKeys
    } = req.body;
    const dogToUpdate = {} as Record<string, unknown>;
    const errors: string[] = [];
    const requiredTypes = [
      { name: "name", value: name, type: "string" },
      {
        name: "description",
        value: description,
        type: "string",
      },
      { name: "breed", value: breed, type: "string" },
      { name: "age", value: age, type: "number" },
    ];

    for (const keys of requiredTypes) {
      if (keys.value !== undefined) {
        if (typeof keys.value !== keys.type) {
          errors.push(
            `${keys.name} should be a ${keys.type}`
          );
        } else {
          dogToUpdate[keys.name] = keys.value;
        }
      }
    }

    for (const key of Object.keys(invalidKeys)) {
      errors.push(`'${key}' is not a valid key`);
    }

    if (errors.length) {
      return res.status(BAD_REQUEST).json({ errors });
    }
    return prisma.dog
      .update({
        where: { id: +req.params.id },
        data: { ...dogToUpdate },
      })
      .then((updatedDog) =>
        res.status(201).json(updatedDog)
      )
      .catch(() =>
        res.status(500).json({
          error: "An error occurred while updating the dog",
        })
      );
  }
);

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
