import type { Request, Response } from "express";
import type { KeystoneContext } from "@keystone-6/core/types";
import path from "path";

export async function uploadImages(req: Request, res: Response) {
  try {
    const context = (req as any).context.sudo() as KeystoneContext;

    const data = {} as any;
    // @ts-ignore
    req.files?.forEach((file) => {
      const fn = file.fieldname;
      data[`${fn}_id`] = path.parse(file?.filename || "").name;
      data[`${fn}_mode`] = "local";
      data[`${fn}_width`] = 200;
      data[`${fn}_height`] = 250;
      data[`${fn}_filesize`] = file?.size;
      data[`${fn}_extension`] = file?.filename.split(".").pop();
    });

    await context.prisma.user.update({
      where: { id: req.body?.id },
      data: data,
    });

    res.status(201).json({ status: "Success" }).end();
  } catch (e) {
    console.log({ e });
    res.status(500).json({ status: "Something went wrong" }).end();
  }
}
