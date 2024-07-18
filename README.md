# Building a REST API

It's time to learn about the elusive backend. You've hopefully used something like json-server up to this point, so you know what it feels like to use a backend, but how do we actually build one?

## What you already know

- Prisma

We know how to interact with a database, get rows of data etc.. In this repository we will be using prisma to manage dogs!

- TypeScript

We now have a rough idea how to write Typescript, fortunately we can leverage that to get some help in how we write our express code. It helps to know what methods are available on our requests / responses etc... This way we should be able to code more and read less, because the documentation will come right from TS.

- HTTP Methods

We've already done some work with `json-server`, but you've likely been told time and time again that `json-server` isn't really a great way to make an app and it's actually more for prototyping and educational purposes more than anything. One way to think about what a REST API for right now is that it's supposed to behave exactly like `json-server` except we now hook it up ourselves to make it legit!

That means we're going to have GET, PATCH, DELETE, and POST endpoints. And this time you are going to hook all that up manually.

## The Assignment

We are building a REAL backend to PUP-E-Picker! If we can think way back, PUP-E-Picker should allow us to take a dog which looks roughly like

```ts
type Dog = {
  id: number;
  name: string;
  description: string;
  isFavorite: boolean;
};
```

and allow us to

- Create a dog (Create Endpoint)
- See All Dogs (Read Endpoint)
- Favorite a dog (Update Endpoint)
- Delete a dog (Destroy Endpoint)

In order to do that we're going to create at least four endpoints, but we're going to throw a couple of extra in here in case we want to add more features later on. These are pretty standard for rest API's.

## Endpoints:

For all these endpoints let's assume our database was seeded according to the script located in [The Seed File](./prisma/seed.ts)

Make sure you test if your endpoints work in Postman, as well as checking them using the provided testing-suites as well. If you are able to pass the test but unable to do the same actions in Postman, you are likely hurting your progress more than helping, as when you make an app you will likely need a way to make sure that the endpoint you are trying to create actually works before trying to write code that hooks up to it.

### Get (/dogs)

If we send a get request to `/dogs` we should get an array of all of the dogs. By REST convention we can call this an **INDEX** endpoint. Index endpoints will sometimes have less information per entity (per dog in this case) than the next one coming up (A Show Endpoint), but they list some quantity of entities (dogs). I For example, if we have an array of Dogs, it might only contain a few fields from a Dog rather than every little detail about every Dog (Check out the Poke api if you want a good example of this)

In other cases you may see paginated data, 20-50 items per page, then you have to move through pages. You may see the full objects or you may see partial objects. Typically here is where you would be able to pass in things like query params for things like sorting, searching, filtering etc...

In our case we just want an array of every single full dog object, we will likely expand on this in future assignments. Here is an example output of what json we would expect from a dog index endpoint (use the tests as your source of truth for what is expected from the tests not this Readme). Along with this data we should be returning a status code of 200 if successful.

```json
[
  {
    "id": 1,
    "name": "Doomslayer",
    "description": "Doomslayer is the best doggy ever",
    "breed": "Cowboy Corgi"
  },
  {
    "id": 2,
    "name": "Zoey",
    "description": "Zoey is a cute lil doggie and loves cuddles and attention",
    "breed": "Cowboy Corgi"
  }
]
```

### Get (/dogs/:id)

Let's say that Doomslayer the dog has an id of `1` because he is the number 1 doggie after all. In a REST backend, I would expect that
if I send a `get` request to '/dogs/1' that I would get the full doomslayer object along with a status code of 200 if successful.

```json
{
  "id": 1,
  "name": "Doomslayer",
  "description": "Doomslayer is the best doggy ever",
  "breed": "Cowboy Corgi"
}
```

By REST convention this is called a **SHOW** endpoint. When setting this up you will need to use the `req.params` object in order to find the id.

### Post (/dogs)

By rest convention, if we send a `post` request to "/dogs" we should be able to create a dog. Shockingly, REST Convention would call this a **CREATE** endpoint. These function a little bit differently than get endpoints. Before the only thing we really needed to specify was the url that we were sending to. But we can't really create a Dog with just a url, in reality we need a bit more information:

- What is the new dog's name?
- What is the new dog's description?
- What is the new dog's breed

Typically we do this by passing in a json body to the request. From a client side, to create a new dog the request might look like this:

```ts
fetch(baseUrl + "/dogs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  // This is the BODY of the request, which we do not have access to in GET requests
  body: JSON.stringify({
    name: "Air Bud",
    breed: "Golden Retriever",
    description; "Air bud can definitely beat you in basketball"
  })
})
```

Now on the backend, we should be able to access the body that we send using `req.body`, and use that data to create a new dog in prisma. After creating the dog we should return a status code of `201`

### Patch (/dogs/:id)

According to REST convention if we send a patch request to "/dogs/:id" then we should be able to update that dog with the information from the body.

**The Request**

```ts
// doomslayer's id is 1
fetch(baseUrl + "/dogs/" + 1, {
  method: "patch",
  headers: {
    "Content-Type": "application/json",
  },
  body: {
    description: "Isn't he handsome",
  },
});
```

Then our server should respond by

- updating Doomslayer's description to "Isn't he handsome" without changing any other fields
- responding with the resource altered
- sending a status code of 201 if successfully altered

### DELETE (/dogs/:id)

According to REST convention if we send a delete request to this entity it should delete the entity

**The Request**

```ts
// doomslayer's id is 1
fetch(baseUrl + "/dogs/" + 1, {
  method: "delete",
});
```

Then our server should respond by

- deleting DOOMSLAYER from the database
- return some message that the dog was deleted
- sending a status code of 204 if successfully deleted

## Example Problem

Just to get you started let's work through an example problem. We want the first feature of this api to be that if we visit "/", then we get the object `{message: "Hello World!"}` and the status `200` also known as an OK response which is actually the default if we don't specify.

copy and paste this into `index.ts`, this code registers the built in json middleware which will allow us to use express to render json to the user

```ts
app.use(express.json());
```

copy and paste this into `index.ts`, here we set up our express app to listen at `localhost:3000/` and return the json `{ "message": "Hello World!" }`

```ts
app.get("/", (_req, res) => {
  res.json({ message: "Hello World!" }).status(200); // the 'status' is unnecessary but wanted to show you how to define a status
});
```

now run `npm run test-example` to see if you passed 😃

For the rest of the problems you can run one of the following commands:

- `npm run test-create`
- `npm run test-index`
- `npm run test-show`
- `npm run test-update`
- `npm run test-destroy`

you can also run `npx vitest` to just run all of them at once

There is some more information in [This Loom Video](https://www.loom.com/share/fd1381bfd5d64ac5950f975a9f29fc7e) about how our testing setup works.
Note: You will need to run `npm run dev:test` in order for your tests to work, sometimes your server may crash, and you may need to manually restart it.
#   E x p r e s s J S  
 