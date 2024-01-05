import Express from "express";

import { signup, update_user } from "../handlers/user";
import connect from "../database/connect";
import { create_advocate, update_advocate } from "../handlers/advocate";

const app = Express();
app.use(Express.json());

app.post(
  "/api/user/signup",
  async (req: Express.Request, res: Express.Response) => {
    signup(req, res);
  }
);

app.get("/api/user/signup", (req, res) => {
  res.status(200).json({ message: "Api is up and running" });
});

app.patch(
  "/api/user/update",
  async (req: Express.Request, res: Express.Response) => {
    update_user(req, res);
  }
);

app.get("/api/user/update", (req, res) => {
  res.status(200).json({ message: "Api is up and running" });
});

app.post(
  "/api/advocate/create",
  (req: Express.Request, res: Express.Response) => {
    create_advocate(req, res);
  }
);

app.get(
  "/api/advocate/create",
  (req: Express.Request, res: Express.Response) => {
    res.status(200).json({ message: "Api is up and running" });
  }
);

app.post(
  "/api/advocate/update",
  (req: Express.Request, res: Express.Response) => {
    update_advocate(req, res);
  }
);

app.get(
  "/api/advocate/update",
  (req: Express.Request, res: Express.Response) => {
    res.status(200).json({ message: "Api is up and running" });
  }
);

const port = 8666;
app.listen(port, () => {
  console.log("Api is running on PORT:", port);
});
