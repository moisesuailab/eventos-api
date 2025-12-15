import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.middleware.js';
import {
  createEvent,
  listEvents,
  getEvent,
  getEventBySlug,
  updateEvent,
  cancelEvent,
  deleteEvent,
  addReceptionist,
  removeReceptionist,
  listEventsAsReceptionist,
} from './events.controller.js';

const router = Router();

/**
 * @swagger
 * /events/receptionist:
 *   get:
 *     summary: Listar eventos onde sou recepcionista
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos
 */
router.get('/receptionist', authenticate, listEventsAsReceptionist);

/**
 * @swagger
 * /events/slug/{slug}:
 *   get:
 *     summary: Buscar evento por slug (público)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug do evento
 *         example: aniversario-do-levi
 *     responses:
 *       200:
 *         description: Dados do evento
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/slug/:slug', getEventBySlug);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Criar novo evento
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - date
 *               - time
 *               - location
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: Aniversário do Levi
 *               description:
 *                 type: string
 *                 example: Festa de 1 ano
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: '2026-12-20T14:00:00Z'
 *               time:
 *                 type: string
 *                 example: '14:00'
 *               location:
 *                 type: string
 *                 example: Salão de Festas ABC
 *               slug:
 *                 type: string
 *                 example: aniversario-do-levi
 *               confirmationDeadline:
 *                 type: string
 *                 format: date-time
 *               maxChildrenAge:
 *                 type: integer
 *                 default: 12
 *                 minimum: 1
 *                 maximum: 12
 *               maxChildrenPerGuest:
 *                 type: integer
 *                 minimum: 0
 *               maxCompanionsPerGuest:
 *                 type: integer
 *                 minimum: 0
 *               defaultMessage:
 *                 type: string
 *                 example: 'Você está convidado! Use o código: {CODE}'
 *     responses:
 *       201:
 *         description: Evento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 */
router.post('/', authenticate, createEvent);

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Listar eventos do usuário autenticado
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       401:
 *         description: Não autenticado
 */
router.get('/', authenticate, listEvents);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Buscar evento por ID
 *     tags: [Events]
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
 *         description: Dados do evento
 *       404:
 *         description: Evento não encontrado
 *       401:
 *         description: Não autenticado
 */
router.get('/:id', authenticate, getEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Editar evento
 *     tags: [Events]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               slug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evento atualizado
 *       404:
 *         description: Evento não encontrado
 */
router.put('/:id', authenticate, updateEvent);

/**
 * @swagger
 * /events/{id}/cancel:
 *   patch:
 *     summary: Cancelar evento
 *     tags: [Events]
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
 *         description: Evento cancelado
 *       404:
 *         description: Evento não encontrado
 */
router.patch('/:id/cancel', authenticate, cancelEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Excluir evento
 *     tags: [Events]
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
 *         description: Evento removido
 *       404:
 *         description: Evento não encontrado
 */
router.delete('/:id', authenticate, deleteEvent);

/**
 * @swagger
 * /events/{id}/receptionists:
 *   post:
 *     summary: Adicionar recepcionista ao evento
 *     tags: [Events]
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: recepcionista@example.com
 *     responses:
 *       201:
 *         description: Recepcionista adicionado
 *       400:
 *         description: Email já cadastrado
 */
router.post('/:id/receptionists', authenticate, addReceptionist);

/**
 * @swagger
 * /events/receptionists/{receptionistId}:
 *   delete:
 *     summary: Remover recepcionista
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: receptionistId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Recepcionista removido
 *       404:
 *         description: Recepcionista não encontrado
 */
router.delete('/receptionists/:receptionistId', authenticate, removeReceptionist);

export default router;