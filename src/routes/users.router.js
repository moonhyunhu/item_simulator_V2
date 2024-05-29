import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";
import dotEnv from 'dotenv';

dotEnv.config();

const router = express.Router();

//회원가입 API
router.post("/sign-up", async (req, res, next) => {
  try {
    //1. id password body로 전달
    const { id, password } = req.body;

    //2. 동일한 id가 있는지 확인
    const sameId = await prisma.users.findFirst({
      where: { id },
    });
    if (sameId) {
      return res.status(400).json({ errorMessage: "동일한 ID가 있습니다" });
    }

    //3. Users테이블에 id,password 이용해 아이디 생성
    //비밀번호 hash
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: {
        id,
        password: hashedPassword,
      },
    });

    //4. 클라이언트 반환
    return res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});

//로그인 API
router.post("/sign-in", async (req, res, next) => {
  //1. id, password body로 전달
  const { id, password } = req.body;

  //2. 해당하는 계정이 있는지 확인
  const user = await prisma.users.findFirst({
    where: { id },
  });
  if (!user) {
    return res.status(400).json({ errorMessage: "아이디가 존재하지 않습니다" });
  }

  //3. 전달받은 password와 저장된 password가 동일한지 확인
  const result = await bcrypt.compare(password, user.password);
  if (!result) {
    return res
      .status(400)
      .json({ errorMessage: "비밀번호가 일치하지 않습니다" });
  }

  //4. 로그인 성공 시 사용자에게 jwt 발급
  const token = jwt.sign(
    {
      userId: user.userId,
    },
    process.env.SESSION_SECRET_KEY
  );

  res.cookie("authorization", `Bearer ${token}`);

  //5. 반환
  return res.status(200).json({ message: "로그인 성공" });
});

export default router;
