import {
  BaseKeystoneTypeInfo,
} from "@keystone-6/core/types";
import { uploadImages } from "./imageUploads";
import multer from "multer";

const storage = multer.diskStorage({
  destination: function (_req, __file, cb) {
    cb(null, "public/images");
  },
  filename: async function (_req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

export const router = (
  app: any,
  commonContext
) => {
  app.use("/api/rest", async (req: any, res: any, next: any) => {
    req.context = await commonContext.withRequest(req, res);
    next();
  });

  app.post("/api/rest/image-upload", upload.any(), uploadImages);
};