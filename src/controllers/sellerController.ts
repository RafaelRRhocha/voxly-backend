import { Request, Response } from "express";

import { UserRole } from "../enums/user";
import * as sellerService from "../services/sellerService";
import { SellerCreate, SellerUpdate } from "../types/seller";

interface RequestWithUser extends Request {
  user?: {
    id: number;
    entityId: number;
    role: UserRole;
  };
}

export const createSeller = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, store_id } = req.body;

    if (!name || !email || !store_id) {
      res.status(400).json({ error: "Required fields: name, email, store_id" });
      return;
    }

    const storeIdNumber = Number(store_id);
    if (isNaN(storeIdNumber)) {
      res.status(400).json({ error: "store_id must be a valid number" });
      return;
    }

    if (
      req.user &&
      !(await sellerService.validateStoreAccess(
        storeIdNumber,
        req.user.entityId,
      ))
    ) {
      res.status(403).json({ error: "Access denied to this store" });
      return;
    }

    const sellerData: SellerCreate = {
      name,
      email,
      store_id: storeIdNumber,
    };

    const seller = await sellerService.createSeller(sellerData);
    res.status(201).json(seller);
  } catch (err) {
    const errorMessage = (err as Error).message;

    if (errorMessage.includes("unique")) {
      res.status(400).json({ error: "Seller email must be unique" });
    } else if (errorMessage.includes("Store not found")) {
      res.status(400).json({ error: "Store not found" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const getSellerById = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.sellerId);
    const seller = await sellerService.getSellerById(id);

    if (!seller) {
      res.status(404).json({ error: "Seller not found" });
      return;
    }

    if (
      req.user &&
      !(await sellerService.validateSellerAccess(id, req.user.entityId))
    ) {
      res.status(403).json({ error: "Access denied to this seller" });
      return;
    }

    res.json(seller);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getSellersByStore = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const storeId = Number(req.params.storeId);

    if (
      req.user &&
      !(await sellerService.validateStoreAccess(storeId, req.user.entityId))
    ) {
      res.status(403).json({ error: "Access denied to this store" });
      return;
    }

    const sellers = await sellerService.getSellersByStoreId(storeId);
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateSeller = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.sellerId);
    const data = req.body as SellerUpdate;

    if (
      req.user &&
      !(await sellerService.validateSellerAccess(id, req.user.entityId))
    ) {
      res.status(403).json({ error: "Access denied to this seller" });
      return;
    }

    const seller = await sellerService.updateSeller(id, data);
    res.json(seller);
  } catch (err) {
    const errorMessage = (err as Error).message;

    if (errorMessage.includes("not found")) {
      res.status(404).json({ error: "Seller not found" });
    } else if (errorMessage.includes("unique")) {
      res.status(400).json({ error: "Seller email must be unique" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const deleteSeller = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.sellerId);

    if (
      req.user &&
      !(await sellerService.validateSellerAccess(id, req.user.entityId))
    ) {
      res.status(403).json({ error: "Access denied to this seller" });
      return;
    }

    await sellerService.deleteSeller(id);
    res.status(204).send();
  } catch (err) {
    const errorMessage = (err as Error).message;

    if (errorMessage.includes("not found")) {
      res.status(404).json({ error: "Seller not found" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};
