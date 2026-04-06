import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { FragmentsService, fragmentType } from './fragments.service';
import { SupabaseService } from '../supabase/supabase.service';
import { AttachFragmentDto } from './dto/attach-fragment.dto';
import {
  expect,
  describe,
  it,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

// mock data
const mockFile = (overrides = {}): Express.Multer.File =>
  ({
    originalname: 'photo.png',
    mimetype: 'image/png',
    buffer: Buffer.from('randomfilestuff'),
    ...overrides,
  }) as Express.Multer.File;

const mockExperience = (overrides = {}) => ({
  id: 'exp1',
  user_id: 'userA',
  anchor_fragment_id: null,
  ...overrides,
});

const mockFragment = (overrides = {}) => ({
  id: 'frag1',
  experience_id: 'exp1',
  storage_path: 'userA/exp1/frag1.png',
  type: 'photo',
  ...overrides,
});

const mockAttachFragmentDto = (overrides = {}): AttachFragmentDto => ({
  ...overrides,
});

// mock supabase database and command(s) sequence
const mockDb = (overrides = {}) => {
  const sequence = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest
      .fn<() => Promise<{ data: any; error: any }>>()
      .mockResolvedValue({ data: null, error: null }),
    returns: jest
      .fn<() => Promise<{ data: any; error: any }>>()
      .mockResolvedValue({ data: [], error: null }),
    ...overrides,
  };
  return { from: jest.fn().mockReturnValue(sequence) };
};

// mock supabase storage buckets
const mockBucket = (overrides = {}) => ({
  upload: jest
    .fn<() => Promise<{ error: any }>>()
    .mockResolvedValue({ error: null }),
  remove: jest
    .fn<() => Promise<{ error: any }>>()
    .mockResolvedValue({ error: null }),
  getPublicUrl: jest.fn().mockReturnValue({
    data: { publicUrl: 'https://public.url.com/photo.png' },
  }),
  createSignedUrl: jest
    .fn<() => Promise<{ data: any; error: any }>>()
    .mockResolvedValue({
      data: { signedUrl: 'https://signed.url.com/photo.png' },
      error: null,
    }),
  ...overrides,
});

describe('FragmentsService Testing', () => {
  let service: FragmentsService;
  let getClient: jest.Mock;
  beforeEach(async () => {
    getClient = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FragmentsService,
        { provide: SupabaseService, useValue: { getClient } },
      ],
    }).compile();

    service = module.get<FragmentsService>(FragmentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // fragment type helper function returns type of media being uploaded (photo | video | audio | text)
  describe('fragmentType helper function', () => {
    it('should return photo for image mimetype', () => {
      expect(fragmentType(mockFile({ mimetype: 'image/png' }))).toBe('photo');
    });

    it('should return video for video mimetype', () => {
      expect(fragmentType(mockFile({ mimetype: 'video/mp4' }))).toBe('video');
    });

    it('should return audio for audio mimetype', () => {
      expect(fragmentType(mockFile({ mimetype: 'audio/mpeg' }))).toBe('audio');
    });

    it('should return text as fallback for unknown mimetype', () => {
      expect(fragmentType(mockFile({ mimetype: 'application/pdf' }))).toBe(
        'text',
      );
    });
  });

  // findOne helper function to confirm experience belongs to user
  describe('findOne helper function', () => {
    it('experience belonging to user is returned successfully ', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnThis() },
      });

      const res = await service.findOne('userA', 'exp1');
      expect(res).toHaveProperty('id', 'exp1');
    });

    it('throw ForbiddenException when access is denied ', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: mockExperience(),
            error: { message: 'access denied' },
          }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnThis() },
      });

      await expect(service.findOne('userA', 'exp1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throw NotFoundException if experience is not found ', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: null, error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnThis() },
      });

      await expect(service.findOne('userA', 'exp1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // attach fragment to an experience POST
  describe('attachFragment testing', () => {
    it('successfully upload file and returns {storagePath, publicUrl}', async () => {
      const storage = mockBucket();
      // getting mock experience and insert succeeds without errors
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
        insert: jest
          .fn<() => Promise<{ error: any }>>()
          .mockResolvedValue({ error: null }),
      });

      // use mocked values for supabase client
      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnValue(storage) },
      });

      // Params: userId, experienceId, file, dto
      const res = await service.attachFragment(
        'userA',
        'exp1',
        mockFile(),
        mockAttachFragmentDto(),
      );

      // response has {storagePath: ..., publicUrl: ...}
      expect(res).toHaveProperty('storagePath');
      expect(res).toHaveProperty('publicUrl');

      // upload to bucket and getting public url once
      expect(storage.upload).toHaveBeenCalledTimes(1);
      expect(storage.getPublicUrl).toHaveBeenCalledTimes(1);
    });

    it('throw BadRequestException with no file in req', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnThis() },
      });

      // null file being sent
      await expect(
        service.attachFragment(
          'userA',
          'exp1',
          null as any,
          mockAttachFragmentDto(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throw InternalServerErrorException if storage upload fails', async () => {
      const storage = mockBucket({
        upload: jest.fn<() => Promise<{ error: any }>>().mockResolvedValue({
          error: { message: 'file failed to upload to storage bucket' },
        }),
      });

      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnValue(storage) },
      });

      // internal server error as storage upload is unsuccessful
      await expect(
        service.attachFragment(
          'user-1',
          'exp-1',
          mockFile(),
          mockAttachFragmentDto(),
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('remove from storage bucket if database insert error', async () => {
      const storage = mockBucket({
        remove: jest
          .fn<() => Promise<{ error: any }>>()
          .mockResolvedValue({ error: null }),
      });

      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
        insert: jest.fn<() => Promise<{ error: any }>>().mockResolvedValue({
          error: {
            message: 'error from trying to insert into database tables',
          },
        }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnValue(storage) },
      });

      // failed to insert into db table
      await expect(
        service.attachFragment(
          'userA',
          'exp1',
          mockFile(),
          mockAttachFragmentDto(),
        ),
      ).rejects.toThrow(InternalServerErrorException);

      // verify fragment was removed from bucket as well
      expect(storage.remove).toHaveBeenCalledTimes(1);
    });
  });

  // get the list of fragments for an experience GET
  describe('getFragmentsList testing', () => {
    it('successfully return list of fragments for the experience', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockFragment(), error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnThis() },
      });

      const res = await service.getFragmentsList('userA', 'exp1');
      expect(res).toHaveProperty('id', 'frag1');
    });

    it('successfull return an empt list of fragments', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: null, error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnThis() },
      });

      const res = await service.getFragmentsList('userA', 'exp1');
      expect(res).toEqual([]);
    });

    it('throw Internal Server Exception if there is an error grabbing the fragments', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience(), error: null }),
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: mockFragment(),
            error: { message: 'server error' },
          }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnThis() },
      });

      await expect(service.getFragmentsList('userA', 'exp1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
