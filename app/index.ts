import Express from "express";

import { signup, update_user } from "../handlers/user";
import connect from "../database/connect";
import {
  approve_advocate,
  create_advocate,
  update_advocate,
} from "../handlers/advocate";
import { create_case, show_case, update_case } from "../handlers/case";
import {
  create_procedure,
  list_procedure,
  update_procedure,
} from "../handlers/procedure";

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

app.patch(
  "/api/advocate/update",
  (req: Express.Request, res: Express.Response) => {
    update_advocate(req, res);
  }
);

app.post(
  "/api/advocate/approve",
  (req: Express.Request, res: Express.Response) => {
    approve_advocate(req, res);
  }
);

app.get(
  "/api/advocate/update",
  (req: Express.Request, res: Express.Response) => {
    res.status(200).json({ message: "Api is up and running" });
  }
);

app.post("/api/case/create", (req: Express.Request, res: Express.Response) => {
  create_case(req, res);
});

app.get("/api/case/create", (req: Express.Request, res: Express.Response) => {
  res.status(200).json({ message: "Api is up and running" });
});

app.patch("/api/case/update", (req: Express.Request, res: Express.Response) => {
  update_case(req, res);
});

app.get("/api/case/update", (req: Express.Request, res: Express.Response) => {
  res.status(200).json({ message: "Api is up and running" });
});

app.post("/api/case/show", (req: Express.Request, res: Express.Response) => {
  show_case(req, res);
});

app.get("/api/case/show", (req: Express.Request, res: Express.Response) => {
  res.status(200).json({ message: "Api is up and running" });
});

app.post(
  "/api/procedure/create",
  (req: Express.Request, res: Express.Response) => {
    create_procedure(req, res);
  }
);

app.get(
  "/api/procedure/create",
  (req: Express.Request, res: Express.Response) => {
    res.status(200).json({ message: "Api is up and running" });
  }
);

app.patch(
  "/api/procedure/update",
  (req: Express.Request, res: Express.Response) => {
    update_procedure(req, res);
  }
);

app.get(
  "/api/procedure/update",
  (req: Express.Request, res: Express.Response) => {
    res.status(200).json({ message: "Api is up and running" });
  }
);

app.post(
  "/api/procedure/list",
  (req: Express.Request, res: Express.Response) => {
    list_procedure(req, res);
  }
);

app.get("/api/case/show", (req: Express.Request, res: Express.Response) => {
  res.status(200).json({ message: "Api is up and running" });
});

const port = 8666;
app.listen(port, () => {
  console.log("Api is running on PORT:", port);
});
