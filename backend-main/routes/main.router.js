const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const gitRouter = require("./git.router");
const prRouter = require("./pr.router");

const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(gitRouter);
mainRouter.use(prRouter);

mainRouter.get("/", (req, res) => {
  res.json({ message: "ORBIT API", version: "2.0" });
});

module.exports = mainRouter;
