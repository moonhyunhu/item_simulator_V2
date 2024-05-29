import express from "express";
import cookieParser from "cookie-parser";
import UsersRouter from "./routes/users.router.js";
import CharsRouter from "./routes/character.router.js";
import ItemsRouter from "./routes/item.router.js";
import logMiddlewares from "./middlewares/log.middlewares.js";
import errorHandlingMiddelwares from "./middlewares/error-handling.middlewares.js";
import dotEnv from "dotenv";

//.env에 있는 여러 값들을 process.env 객체 안에 추가하게 된다.
dotEnv.config();

const app = express();
const PORT = 3333;

app.use(logMiddlewares);
app.use(express.json());
app.use(cookieParser());
app.use("/main", [UsersRouter, CharsRouter, ItemsRouter]);
app.use(errorHandlingMiddelwares);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
