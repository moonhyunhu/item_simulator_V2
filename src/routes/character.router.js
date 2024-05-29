import express from "express";
import authMiddlewares from "../middlewares/auth.middlewares.js";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

//캐릭터 생성 API
router.post("/chars", authMiddlewares, async (req, res, next) => {
  //1.캐릭터를 생성하는 클라이언트가 로그인 된 사용자인지 검증
  const { userId } = req.user;

  //2. 캐릭터 생성을 위한 name body로 전달
  const { name } = req.body;

  const sameName = await prisma.character.findFirst({
    where: { name },
  });
  if (sameName) {
    return res.status(400).json({ errorMessage: "동일한 닉네임이 있습니다" });
  }

  //3.기본스탯 hp:500 power:100 money:10000설정
  let health = 500;
  let power = 100;
  let money = 10000;

  //4. Character테이블에 캐릭터 생성
  const newChar = await prisma.character.create({
    data: {
      UserId: userId,
      name,
      health,
      power,
      money,
    },
  });

  //5. 반환
  return res.status(200).json({ data: newChar });
});

//캐릭터 삭제 API
router.delete("/chars/:charId", authMiddlewares, async (req, res, next) => {
  //0. 삭제하려는 클라이언트가 로그인된 사용자인지 검증
  const { userId } = req.user;

  //1. 경로 매개변수전달
  const { charId } = req.params;

  //2.해당 캐릭터 삭제
  const deletaChar = await prisma.character.delete({
    where: {
      charId: +charId,
      UserId: +userId,
    },
  });
  //반환
  return res.status(200).json({ message: "정상적으로 삭제 완료" });
});

//캐릭터 조회 API
router.get("/chars", async (req, res, next) => {
  //캐릭터 테이블 내 존재하는 캐릭터 전부 찾기
  const chars = await prisma.character.findMany({
    select: {
      charId: true,
      name: true,
    },
  });

  //반환
  return res.status(200).json({ data: chars });
});

//캐릭터 상세조회 API
router.get("/chars/:charId", authMiddlewares, async (req, res, next) => {
  //0. 조회하는 클라이언트가 로그인 된 사용자인지
  const { userId } = req.user;

  //1. 경로 매개변수 전달
  const { charId } = req.params;

  //2. 해당 캐릭터 조회
  const findChar = await prisma.character.findFirst({
    where: {
      charId: +charId,
    },
    select: {
      name: true,
      health: true,
      power: true,
      money: true,
    },
  });

  //반환
  return res.status(200).json({ data: findChar });
});

export default router;
