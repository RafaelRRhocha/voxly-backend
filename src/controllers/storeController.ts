import { Request, Response } from "express";

import { UserRole } from "../enums/user";
import * as storeService from "../services/storeService";
import { StoreCreate, StoreUpdate } from "../types/store";

interface RequestWithUser extends Request {
  user?: {
    id: number;
    entityId: number;
    role: UserRole;
  };
}

export const createStore = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, entity_id } = req.body;

    if (!name || !entity_id) {
      res.status(400).json({ error: "Required fields: name, entity_id" });
      return;
    }

    const entityIdNumber = Number(entity_id);
    if (isNaN(entityIdNumber)) {
      res.status(400).json({ error: "entity_id must be a valid number" });
      return;
    }

    const storeData: StoreCreate = {
      name,
      entity_id: entityIdNumber,
    };

    const store = await storeService.createStore(storeData);
    res.status(201).json(store);
  } catch (err) {
    const errorMessage = (err as Error).message;

    if (errorMessage.includes("unique")) {
      res
        .status(400)
        .json({ error: "Store name must be unique within the entity" });
    } else if (errorMessage.includes("Entity not found")) {
      res.status(400).json({ error: "Entity not found" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const getStoreById = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.storeId);
    const store = await storeService.getStoreById(id);

    if (!store) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    if (
      req.user &&
      !(await storeService.validateStoreAccess(id, req.user.entityId))
    ) {
      res.status(403).json({ error: "Access denied to this store" });
      return;
    }

    res.json(store);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getStoresByEntity = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const entityId = Number(req.params.entityId);

    if (req.user && req.user.entityId !== entityId) {
      res.status(403).json({ error: "Access denied to this entity's stores" });
      return;
    }

    const stores = await storeService.getStoresByEntityId(entityId);
    res.json(stores);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateStore = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.storeId);
    const data = req.body as StoreUpdate;

    if (
      req.user &&
      !(await storeService.validateStoreAccess(id, req.user.entityId))
    ) {
      res.status(403).json({ error: "Access denied to this store" });
      return;
    }

    const store = await storeService.updateStore(id, data);
    res.json(store);
  } catch (err) {
    const errorMessage = (err as Error).message;

    if (errorMessage.includes("not found")) {
      res.status(404).json({ error: "Store not found" });
    } else if (errorMessage.includes("unique")) {
      res
        .status(400)
        .json({ error: "Store name must be unique within the entity" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};

export const deleteStore = async (
  req: RequestWithUser,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.storeId);

    if (
      req.user &&
      !(await storeService.validateStoreAccess(id, req.user.entityId))
    ) {
      res.status(403).json({ error: "Access denied to this store" });
      return;
    }

    await storeService.deleteStore(id);
    res.status(204).send();
  } catch (err) {
    const errorMessage = (err as Error).message;

    if (errorMessage.includes("not found")) {
      res.status(404).json({ error: "Store not found" });
    } else {
      res.status(500).json({ error: errorMessage });
    }
  }
};
