import request from 'supertest';
import app from '../server';
import prisma from '../config/database';
import { generateTokens } from '../services/auth.service';

describe('Card API', () => {
  let authToken: string;
  let userId: string;
  let boardId: string;
  let columnId: string;

  beforeAll(async () => {
    // Create a test user
    const user = await prisma.user.create({
      data: {
        email: 'cardtest@example.com',
        password: 'hashedpassword',
        name: 'Card Test User',
      },
    });
    userId = user.id;

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);
    authToken = tokens.accessToken;

    // Create board with columns
    const board = await prisma.board.create({
      data: {
        name: 'Test Board',
        userId: user.id,
        columns: {
          create: [
            { name: 'To Do', position: 0 },
            { name: 'In Progress', position: 1 },
            { name: 'Completed', position: 2 },
          ],
        },
      },
      include: { columns: true },
    });
    boardId = board.id;
    columnId = board.columns[0].id;
  });

  afterAll(async () => {
    await prisma.card.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/columns/:columnId/cards', () => {
    it('should create a new card', async () => {
      const response = await request(app)
        .post(`/api/columns/${columnId}/cards`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Card',
          description: 'Test Description',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Card');
      expect(response.body.columnId).toBe(columnId);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post(`/api/columns/${columnId}/cards`)
        .send({
          title: 'Test Card',
        })
        .expect(401);
    });
  });

  describe('PUT /api/cards/:id', () => {
    it('should update a card', async () => {
      const card = await prisma.card.create({
        data: {
          title: 'Original Title',
          columnId,
          position: 0,
        },
      });

      const response = await request(app)
        .put(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
          description: 'Updated Description',
        })
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
    });
  });

  describe('DELETE /api/cards/:id', () => {
    it('should delete a card', async () => {
      const card = await prisma.card.create({
        data: {
          title: 'Card to Delete',
          columnId,
          position: 0,
        },
      });

      await request(app)
        .delete(`/api/cards/${card.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

