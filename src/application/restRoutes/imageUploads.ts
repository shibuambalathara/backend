import type { Request, Response } from "express";
import sizeOf from 'image-size'
import type { KeystoneContext } from "@keystone-6/core/types";
import path from "path";

export async function uploadImages(req: Request, res: Response) {
  try {
    const context = (req as any).context.sudo() as KeystoneContext;

    const data = {} as any;
    // @ts-ignore
    req.files?.forEach((file) => {
      const dimensions = sizeOf(file.path)
      const fn = file.fieldname;
      data[`${fn}_id`] = path.parse(file?.filename || "").name;
      // data[`${fn}_mode`] = "local";
      data[`${fn}_width`] = dimensions.width||200;
      data[`${fn}_height`] = dimensions.height||250;
      data[`${fn}_filesize`] = file?.size;
      data[`${fn}_extension`] = file?.filename.split(".").pop();
    });
    const { schema, id } = req.body;
    await context.prisma[schema].update({
      where: { id: id },
      data: data,
    });

    res.status(201).json({ status: "Success" }).end();
  } catch (e) {
    res.status(500).json({ status: "Something went wrong" }).end();
  }
}
