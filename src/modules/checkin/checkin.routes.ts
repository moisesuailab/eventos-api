import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import {
  listGuests,
  validateCode,
  checkinGuest,
  revertCheckin,
  checkinChild,
  revertCheckinChild,
  getStats,
} from './checkin.controller.js';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @swagger
 * /checkin/{slug}/stats:
 *   get:
 *     summary: Estatísticas do evento
 *     description: Retorna contadores de convidados e crianças
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: aniversario-do-levi
 *     responses:
 *       200:
 *         description: Estatísticas do evento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 event:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     date:
 *                       type: string
 *                     time:
 *                       type: string
 *                     location:
 *                       type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalGuests:
 *                       type: integer
 *                     confirmed:
 *                       type: integer
 *                     present:
 *                       type: integer
 *                     declined:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     totalChildren:
 *                       type: integer
 *                     childrenCheckedIn:
 *                       type: integer
 *       403:
 *         description: Sem permissão para acessar este evento
 */
router.get('/:slug/stats', getStats);

/**
 * @swagger
 * /checkin/{slug}/guests:
 *   get:
 *     summary: Listar todos os convidados do evento
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista completa de convidados
 *       403:
 *         description: Sem permissão
 */
router.get('/:slug/guests', listGuests);

/**
 * @swagger
 * /checkin/{slug}/validate:
 *   post:
 *     summary: Validar código QR
 *     description: Simula scan de QR Code e retorna dados do convidado
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: ABC123
 *     responses:
 *       200:
 *         description: Código válido - dados do convidado
 *       400:
 *         description: Convidado não confirmou presença
 *       404:
 *         description: Código inválido
 */
router.post('/:slug/validate', validateCode);

/**
 * @swagger
 * /checkin/{slug}/guest/checkin:
 *   post:
 *     summary: Marcar presença de convidado
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guestId
 *             properties:
 *               guestId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Check-in realizado
 *       400:
 *         description: Check-in já foi feito
 */
router.post('/:slug/guest/checkin', checkinGuest);

/**
 * @swagger
 * /checkin/{slug}/guest/revert:
 *   post:
 *     summary: Reverter check-in de convidado
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guestId
 *             properties:
 *               guestId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Check-in revertido
 */
router.post('/:slug/guest/revert', revertCheckin);

/**
 * @swagger
 * /checkin/{slug}/child/checkin:
 *   post:
 *     summary: Marcar presença de criança
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *             properties:
 *               childId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Check-in da criança realizado
 */
router.post('/:slug/child/checkin', checkinChild);

/**
 * @swagger
 * /checkin/{slug}/child/revert:
 *   post:
 *     summary: Reverter check-in de criança
 *     tags: [Checkin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - childId
 *             properties:
 *               childId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Check-in da criança revertido
 */
router.post('/:slug/child/revert', revertCheckinChild);

export default router;