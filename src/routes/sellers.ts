import { Router } from "express";

import {
  createSeller,
  deleteSeller,
  getSellerById,
  getSellersByStore,
  updateSeller,
} from "../controllers/sellerController";
import { authenticate } from "../middlewares/authMiddleware";
import {
  validateSellerCreate,
  validateSellerUpdate,
} from "../middlewares/validationMiddleware";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Seller:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Seller ID
 *         name:
 *           type: string
 *           description: Seller name
 *         email:
 *           type: string
 *           format: email
 *           description: Seller email
 *         storeId:
 *           type: integer
 *           description: Store ID that seller belongs to
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Seller creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Seller last update timestamp
 *     SellerCreate:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - store_id
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Seller name
 *         email:
 *           type: string
 *           format: email
 *           description: Seller email
 *         store_id:
 *           type: integer
 *           description: Store ID
 *     SellerUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Seller name
 *         email:
 *           type: string
 *           format: email
 *           description: Seller email
 */

/**
 * @swagger
 * /api/sellers/store/{storeId}:
 *   get:
 *     summary: Get all sellers by store
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Store ID
 *     responses:
 *       200:
 *         description: List of sellers by store
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Seller'
 *       403:
 *         description: Access denied to this store
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/store/:storeId", authenticate, getSellersByStore);

/**
 * @swagger
 * /api/sellers/{sellerId}:
 *   get:
 *     summary: Get seller by ID
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       403:
 *         description: Access denied to this seller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Seller not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Update seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerUpdate'
 *     responses:
 *       200:
 *         description: Seller updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       400:
 *         description: Invalid data or seller email must be unique
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied to this seller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Seller not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Delete seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID
 *     responses:
 *       204:
 *         description: Seller deleted successfully
 *       403:
 *         description: Access denied to this seller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Seller not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:sellerId", authenticate, getSellerById);
router.put("/:sellerId", authenticate, validateSellerUpdate, updateSeller);
router.delete("/:sellerId", authenticate, deleteSeller);

/**
 * @swagger
 * /api/sellers/register:
 *   post:
 *     summary: Create a new seller
 *     tags: [Sellers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SellerCreate'
 *     responses:
 *       201:
 *         description: Seller created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Seller'
 *       400:
 *         description: Invalid data, store not found, or seller email must be unique
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied to this store
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/register", authenticate, validateSellerCreate, createSeller);

export default router;
