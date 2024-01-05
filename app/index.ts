import Express from "express";

const app = Express();
app.use(Express.json());

const port = 8666;
app.listen(port, () => {
  console.log("Api is running on PORT:", port);
});
