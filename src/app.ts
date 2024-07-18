import express from "express";
import { prisma } from "../prisma/prisma-instance";
import { errorHandleMiddleware } from "./error-handler";
import "express-async-errors";

const app = express();
app.use(express.json());
// All code should go below this line

app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});

app.get("/dogs", async (_req, res) => {
  const dogs = await prisma.dog.findMany();
  res.send(dogs);
});

app.get("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(+req.params.id)) {
    return res.status(400).send({
      message: "id should be a number",
    });
  }

  const dog = await prisma.dog.findUnique({
    where: { id },
  });

  if (!dog) return res.status(204).send();

  return res.send(dog);
});

app.delete("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  if (isNaN(+req.params.id)) {
    return res
      .status(400)
      .send({ message: "id should be a number" });
  }
  try {
    const dog = await prisma.dog.delete({
      where: { id },
    });
    return res.status(200).send(dog);
  } catch (e) {
    console.error(e);
    return res.status(204).send();
  }
});

app.post("/dogs", async (req, res) => {
  const { age, name, description, breed, ...invalidKeys } =
    req.body;
  const errors: string[] = [];

  if (typeof name !== "string") {
    errors.push("name should be a string");
  }
  if (typeof description !== "string") {
    errors.push("description should be a string");
  }
  if (typeof breed !== "string") {
    errors.push("breed should be a string");
  }
  if (typeof age !== "number") {
    errors.push("age should be a number");
  }

  for (const key of Object.keys(invalidKeys)) {
    errors.push(`'${key}' is not a valid key`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const newDog = await prisma.dog.create({
      data: { age, name, description, breed },
    });
    res.status(201).send(newDog);
  } catch (e) {
    console.error(e);
    res.status(500).send({
      error: "An error occurred while creating the dog",
    });
  }
});

app.patch("/dogs/:id", async (req, res) => {
  const id = +req.params.id;
  const { age, name, description, breed, ...invalidKeys } =
    req.body;
  let dogToUpdate: {
    age?: number;
    name?: string;
    description?: string;
    breed?: string;
  } = {};

  app.get(`/dogs/${id}`, async (_req, res) => {
    if (isNaN(id)) {
      return res.status(400).send({
        message: "id should be a number",
      });
    }

    const dog = await prisma.dog.findUnique({
      where: { id },
    });

    if (!dog) return res.status(204).send();

    dogToUpdate = dog;
  });
  const errors: string[] = [];

  if (age !== undefined) {
    if (typeof age !== "number") {
      errors.push("age should be a number");
    } else {
      dogToUpdate.age = age;
    }
  }
  if (name !== undefined) {
    if (typeof name !== "string") {
      errors.push("name should be a string");
    } else {
      dogToUpdate.name = name;
    }
  }
  if (description !== undefined) {
    if (typeof description !== "string") {
      errors.push("description should be a string");
    } else {
      dogToUpdate.description = description;
    }
  }
  if (breed !== undefined) {
    if (typeof breed !== "string") {
      errors.push("breed should be a string");
    } else {
      dogToUpdate.breed = breed;
    }
  }

  for (const key of Object.keys(invalidKeys)) {
    errors.push(`'${key}' is not a valid key`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const data = {
    ...dogToUpdate,
    ...invalidKeys,
  };

  try {
    const updatedDog = await prisma.dog.update({
      where: { id },
      data: {
        age: data.age,
        name: data.name,
        description: data.description,
        breed: data.breed,
      },
    });
    res.status(201).json(updatedDog);
  } catch (e) {
    console.error(e);
    res.status(500).json({
      error: "An error occurred while updating the dog",
    });
  }
});

// all your code should go above this line
app.use(errorHandleMiddleware);

const port = process.env.NODE_ENV === "test" ? 3001 : 3000;
app.listen(port, () =>
  console.log(`
🚀 Server ready at: http://localhost:${port}
`)
);
