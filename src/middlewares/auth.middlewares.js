import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma/index.js";

export default async function (req, res, next) {
  try {
    //1. 클라이언트로부터 쿠키를 전달
    const { authorization } = req.cookies;

    //2. 쿠키가 Bearer형식인지 확인
    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer") {
      throw new Error("토큰 타입이 일치하지 않습니다");
    }

    //3. 서버에서 발급한 jwt가 맞는지 확인
    //인증 실패하면 에러 발생 후 서버가 다운되기때문에 try 사용
    const decodedToken = jwt.verify(token, "my_secret_key");
    const userId = decodedToken.userId;

    //4. jwt의 userId를 이용해 사용자를 조회
    const user = await prisma.users.findFirst({
      where: {
        userId: +userId,
      },
    });
    if (!user) {
      res.clearCookie("authorrization");
      throw new Error("토큰 사용자가 존재하지 않습니다");
    }

    //5. req,user에 조회된 사용자 정보를 할당
    req.user = user;
    
    //6. 다음 미들웨어 실행
    next();

  } catch (error) {
    res.clearCookie("authorizationn"); // 특정 쿠키 삭제

    switch (error.name) {
      case "TokenExpiredError": // 토큰이 만료된 경우
        return res.status(401).json({ message: "토큰이 만료되었습니다" });

      case "JsonWebTokenError": // 토큰 검증이 실패했을 경우
        return res.status(401).json({ message: "검증에 실패했습니다" });

      default:
        return res
          .status(401)
          .json({ message: error.message ?? "비 정상적인 요청입니다" }); // else에러가 존재하면 출력
    }
  }
}
