import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { UserCreate, UserUpdate } from '../types/user';

interface RequestWithUser extends Request {
  user?: {
    id: number;
    entityId: number;
    role: string;
  };
}

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const userData = req.body as UserCreate;

    if (!userData.email || !userData.password || !userData.entity_id || !userData.name) {
      res.status(400).json({ error: 'Required fields: name, email, password, entity_id' });
      return;
    }

    const user = await userService.createUser(userData);
    res.status(201).json(user);
  } catch (err) {
    if ((err as Error).message.includes('Unique constraint')) {
      res.status(409).json({ error: 'Email already in use' });
    } else {
      res.status(400).json({ error: (err as Error).message });
    }
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const user = await userService.getUserById(id);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const listUsersByEntity = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    let entityId: number;
    
    if (req.query.entity_id) {
      entityId = Number(req.query.entity_id);
    } else if (req.user?.entityId) {
      entityId = req.user.entityId;
    } else {
      res.status(400).json({ error: 'entity_id is required' });
      return;
    }

    const users = await userService.getUsersByEntityId(entityId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const getAllUsersByEntity = async (req: Request, res: Response): Promise<void> => {
  try {
    const entityId = Number(req.params.entityId);
    
    const users = await userService.getUsersByEntityId(entityId);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const data = req.body as UserUpdate;
    
    if (data.entity_id) {
      res.status(400).json({ error: 'It is not allowed to change the user\'s entity' });
      return;
    }
    
    const user = await userService.updateUser(id, data);
    res.json(user);
  } catch (err) {
    if ((err as Error).message.includes('Record to update not found')) {
      res.status(404).json({ error: 'User not found' });
    } else if ((err as Error).message.includes('Unique constraint')) {
      res.status(409).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: (err as Error).message });
    }
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (err) {
    if ((err as Error).message.includes('Record to update not found')) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.status(500).json({ error: (err as Error).message });
    }
  }
};
