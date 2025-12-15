import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import {
  createGuest,
  listGuestsByEvent,
  getGuestBySlugAndCode,
  updateGuest,
  deleteGuest,
  confirmGuest,
} from './guests.controller.js';

const router = Router();

/**
 * @swagger
 * /guests/confirm:
 *   post:
 *     summary: Confirmar ou recusar convite (público)
 *     tags: [Guests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *               - code
 *               - action
 *             properties:
 *               slug:
 *                 type: string
 *                 example: aniversario-do-levi
 *               code:
 *                 type: string
 *                 example: ABC123
 *               action:
 *                 type: string
 *                 enum: [confirm, decline]
 *               companions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['DEF456', 'GHI789']
 *               children:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: Lucas Silva
 *                     age:
 *                       type: integer
 *                       example: 5
 *     responses:
 *       200:
 *         description: Convite confirmado/recusado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 *       400:
 *         description: Dados inválidos ou regra violada
 *       404:
 *         description: Código inválido
 */
router.post('/confirm', confirmGuest);

/**
 * @swagger
 * /guests:
 *   post:
 *     summary: Criar convidado
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - name
 *             properties:
 *               eventId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *                 example: João Silva
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *                 example: '+55 31 99999-9999'
 *     responses:
 *       201:
 *         description: Convidado criado (código gerado)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 */
router.post('/', authenticate, createGuest);

/**
 * @swagger
 * /guests/event/{eventId}:
 *   get:
 *     summary: Listar convidados do evento
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Lista de convidados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Guest'
 */
router.get('/event/:eventId', authenticate, listGuestsByEvent);

/**
 * @swagger
 * /guests/{id}:
 *   put:
 *     summary: Editar convidado
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Convidado atualizado
 */
router.put('/:id', authenticate, updateGuest);

/**
 * @swagger
 * /guests/{id}:
 *   delete:
 *     summary: Remover convidado (desfaz vínculos)
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Convidado removido
 */
router.delete('/:id', authenticate, deleteGuest);

/**
 * @swagger
 * /guests/{slug}/{code}:
 *   get:
 *     summary: Buscar convidado por slug e código (público)
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: aniversario-do-levi
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         example: ABC123
 *     responses:
 *       200:
 *         description: Dados do convidado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Código inválido
 */
router.get('/:slug/:code', getGuestBySlugAndCode);

export default router;