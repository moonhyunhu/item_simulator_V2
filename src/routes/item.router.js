import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

//아이템 생성 API
router.post("/items", async (req, res, next) => {
  //아이템 생성을 위한 item_name item_price item_stat body로 전달
  const { item_name, item_price, item_stat } = req.body;

  //Items 테이블에 생성
  const newItem = await prisma.items.create({
    data: {
      item_name,
      item_price,
      item_stat,
    },
  });

  //반환
  return res.status(200).json({ data: newItem });
});

//아이템 수정 API
router.patch("/items/:item_code", async (req, res, next) => {
  //경로매개변수 전달
  const { item_code } = req.params;

  //변경할 아이템 정보 item_name item_stat body로 전달
  const { item_name, item_stat } = req.body;

  //해당 아이템 조회
  const item = await prisma.items.update({
    where: {
      item_code: +item_code,
    },
    data: {
      item_name,
      item_stat,
    },
  });

  //반환
  return res.status(200).json({ message: "수정완료", data: item });
});

//아이템 조회 API
router.get("/items", async (req, res, next) => {
  //Item 테이블 내 존재하는 아이템 전부 찾기
  const items = await prisma.items.findMany({
    select: {
      item_code: true,
      item_name: true,
      item_price: true,
    },
  });

  //반환
  return res.status(200).json({ data: items });
});

//아이템 상세조회 API
router.get("/items/:item_code", async (req, res, next) => {
  //경로 매개변수 받기
  const { item_code } = req.params;

  //아이템 테이블에서 해당하는 아이템 찾기
  const findOneItem = await prisma.items.findFirst({
    where: {
      item_code: +item_code,
    },
    select: {
      item_code: true,
      item_name: true,
      item_price: true,
      item_stat: true,
    },
  });

  //반환
  return res.status(200).json({ data: findOneItem });
});

export default router;
