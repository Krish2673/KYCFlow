import { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        tenantId: string;
        role: string;
      };

      file?: Express.Multer.File;
    }
  }
}

export {};