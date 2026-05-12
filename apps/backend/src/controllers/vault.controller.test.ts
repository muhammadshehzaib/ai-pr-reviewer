import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockVaultFind, mockVaultUpsert, mockVaultDelete, mockEncrypt } = vi.hoisted(() => ({
  mockVaultFind: vi.fn(),
  mockVaultUpsert: vi.fn(),
  mockVaultDelete: vi.fn(),
  mockEncrypt: vi.fn(),
}));

vi.mock('../config/prisma', () => ({
  default: {
    vault: {
      findUnique: mockVaultFind,
      upsert: mockVaultUpsert,
      deleteMany: mockVaultDelete,
    },
  },
}));

vi.mock('../services/encryption.service', () => ({
  EncryptionService: { encrypt: mockEncrypt },
}));

import { VaultController } from './vault.controller';
import { mockReq, mockRes } from '../test-utils/express-mocks';

const authedReq = (overrides = {}) => {
  const req = mockReq(overrides);
  (req as any).auth = { userId: 'u-1', githubId: 'gh' };
  return req;
};

beforeEach(() => {
  vi.clearAllMocks();
  mockEncrypt.mockReturnValue({
    encryptedData: 'ENC',
    iv: 'IV',
    authTag: 'TAG',
  });
});

describe('VaultController.getVault', () => {
  it('returns the vault metadata when one exists', async () => {
    mockVaultFind.mockResolvedValueOnce({ provider: 'CLAUDE', updatedAt: new Date('2025-01-01') });
    const req = authedReq();
    const res = mockRes();

    await VaultController.getVault(req, res);

    expect(mockVaultFind).toHaveBeenCalledWith({
      where: { userId: 'u-1' },
      select: { provider: true, updatedAt: true },
    });
    expect(res.json).toHaveBeenCalledWith({
      vault: { provider: 'CLAUDE', updatedAt: expect.any(Date) },
    });
  });

  it('returns { vault: null } when no vault exists', async () => {
    mockVaultFind.mockResolvedValueOnce(null);
    const req = authedReq();
    const res = mockRes();

    await VaultController.getVault(req, res);

    expect(res.json).toHaveBeenCalledWith({ vault: null });
  });
});

describe('VaultController.upsertVault — happy path', () => {
  it('encrypts the key and upserts the vault', async () => {
    mockVaultUpsert.mockResolvedValueOnce({ provider: 'CLAUDE', updatedAt: new Date() });
    const req = authedReq({ body: { provider: 'CLAUDE', apiKey: 'sk-ant-secret' } });
    const res = mockRes();

    await VaultController.upsertVault(req, res);

    expect(mockEncrypt).toHaveBeenCalledWith('sk-ant-secret');
    expect(mockVaultUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u-1' },
        create: expect.objectContaining({
          userId: 'u-1',
          provider: 'CLAUDE',
          encryptedGeminiKey: 'ENC',
          iv: 'IV',
          authTag: 'TAG',
        }),
      }),
    );
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ vault: expect.any(Object) }),
    );
    expect(res.status).not.toHaveBeenCalled();
  });

  it.each(['GEMINI', 'OPENAI', 'CLAUDE', 'GROK'])(
    'accepts provider %s',
    async (provider) => {
      mockVaultUpsert.mockResolvedValueOnce({ provider, updatedAt: new Date() });
      const req = authedReq({ body: { provider, apiKey: 'k' } });
      const res = mockRes();

      await VaultController.upsertVault(req, res);

      expect(res.status).not.toHaveBeenCalledWith(400);
      expect(mockVaultUpsert).toHaveBeenCalled();
    },
  );
});

describe('VaultController.upsertVault — breaking path', () => {
  it('returns 400 when apiKey is missing', async () => {
    const req = authedReq({ body: { provider: 'CLAUDE' } });
    const res = mockRes();

    await VaultController.upsertVault(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'apiKey is required' });
    expect(mockVaultUpsert).not.toHaveBeenCalled();
  });

  it('returns 400 when apiKey is not a string', async () => {
    const req = authedReq({ body: { provider: 'CLAUDE', apiKey: 12345 } });
    const res = mockRes();

    await VaultController.upsertVault(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockVaultUpsert).not.toHaveBeenCalled();
  });

  it('returns 400 when provider is unsupported', async () => {
    const req = authedReq({ body: { provider: 'PALANTIR', apiKey: 'x' } });
    const res = mockRes();

    await VaultController.upsertVault(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'provider must be one of GEMINI, OPENAI, CLAUDE, GROK',
    });
  });

  it('returns 400 when provider is missing', async () => {
    const req = authedReq({ body: { apiKey: 'x' } });
    const res = mockRes();

    await VaultController.upsertVault(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('does not encrypt the api key if validation fails', async () => {
    const req = authedReq({ body: { provider: 'WRONG', apiKey: 'x' } });
    const res = mockRes();

    await VaultController.upsertVault(req, res);

    expect(mockEncrypt).not.toHaveBeenCalled();
  });

  it('handles missing body gracefully (no crash on req.body undefined)', async () => {
    const req = authedReq();
    const res = mockRes();

    await VaultController.upsertVault(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('VaultController.deleteVault', () => {
  it('deletes the vault for the current user and returns OK', async () => {
    mockVaultDelete.mockResolvedValueOnce({ count: 1 });
    const req = authedReq();
    const res = mockRes();

    await VaultController.deleteVault(req, res);

    expect(mockVaultDelete).toHaveBeenCalledWith({ where: { userId: 'u-1' } });
    expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
  });

  it('returns OK even when no vault existed (count 0) — idempotent', async () => {
    mockVaultDelete.mockResolvedValueOnce({ count: 0 });
    const req = authedReq();
    const res = mockRes();

    await VaultController.deleteVault(req, res);

    expect(res.json).toHaveBeenCalledWith({ status: 'OK' });
  });
});
