import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import {
  expect,
  describe,
  it,
  beforeEach,
  afterEach,
  jest,
} from '@jest/globals';

// mock experience and experience dto
const mockExperience1 = (overrides = {}) => ({
  id: 'exp1',
  user_id: 'userA',
  anchor_fragment_id: null,
  ...overrides,
});

const mockExperience2 = (overrides = {}) => ({
  id: 'exp2',
  user_id: 'userA',
  anchor_fragment_id: null,
  ...overrides,
});

const mockCreateExperienceDto = (overrides = {}): CreateExperienceDto => ({
  title: 'exp1',
  ...overrides,
});

const mockUpdateExperienceDto = (overrides = {}): UpdateExperienceDto => ({
  ...overrides,
});

const mockFragment = (overrides = {}) => ({
  id: 'frag1',
  experience_id: 'exp1',
  storage_path: 'userA/exp1/frag1.png',
  type: 'photo',
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
  remove: jest
    .fn<() => Promise<{ error: any }>>()
    .mockResolvedValue({ error: null }),
  ...overrides,
});

describe('ExperiencesService Testing', () => {
  let service: ExperiencesService;
  let getClient: jest.Mock;

  beforeEach(async () => {
    getClient = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperiencesService,
        { provide: SupabaseService, useValue: { getClient } },
      ],
    }).compile();

    service = module.get<ExperiencesService>(ExperiencesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // testing for happy path and errors for create POST
  describe('create testing', () => {
    it('experience successfully created', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience1(), error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
      });

      const res = await service.create('userA', mockCreateExperienceDto());
      expect(res).toHaveProperty('id', 'exp1');
      expect(res).toHaveProperty('user_id', 'userA');
    });

    it('throw InternalServerErrorException if error inserting experience into db', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: mockExperience1(),
            error: { message: 'error inserting into table' },
          }),
      });

      getClient.mockReturnValue({
        from: commands.from,
      });

      await expect(
        service.create('userA', mockCreateExperienceDto()),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // findall function GET
  describe('findAll testing', () => {
    it('experiences successfully returned', async () => {
      const commands = mockDb({
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: [mockExperience1(), mockExperience2()],
            error: null,
          }),
      });

      getClient.mockReturnValue({
        from: commands.from,
      });

      const res = await service.findAll('userA');
      expect(res).toHaveLength(2);
    });

    it('throw InternalServerErrorException if error receiving experience from db', async () => {
      const commands = mockDb({
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: [mockExperience1()],
            error: { message: 'error reading from table' },
          }),
      });

      getClient.mockReturnValue({
        from: commands.from,
      });

      await expect(service.findAll('userA')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  // update an experience PATCH
  describe('update testing', () => {
    it('successfully update an existing experience', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: mockExperience1({ anchor_fragment_id: 'frag1' }),
            error: null,
          }),
      });

      getClient.mockReturnValue({
        from: commands.from,
      });

      const res = await service.update(
        'userA',
        'exp1',
        mockUpdateExperienceDto(),
      );
      expect(res).toHaveProperty('id', 'exp1');
      expect(res).toHaveProperty('user_id', 'userA');
      expect(res).toHaveProperty('anchor_fragment_id', 'frag1');
    });

    it('throw BadRequestException if dto draft is false and experience anchor is null', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience1(), error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
      });

      await expect(
        service.update(
          'userA',
          'exp1',
          mockUpdateExperienceDto({ is_draft: false }),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('throw InternalServerErrorException if error updating experience in db table', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValueOnce({ data: mockExperience1(), error: null })
          .mockResolvedValueOnce({
            data: mockExperience1(),
            error: { message: 'error updating entry in supabase' },
          }),
      });

      getClient.mockReturnValue({
        from: commands.from,
      });

      await expect(
        service.update('userA', 'exp1', mockUpdateExperienceDto()),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  // remove an experience from the user library DELETE
  describe('remove testing', () => {
    it('successfully remove an experience from user library', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience1(), error: null }),
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: [mockFragment()], error: null }),
      });

      const storage = mockBucket({
        remove: jest
          .fn<() => Promise<{ error: any }>>()
          .mockResolvedValue({ error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnValue(storage) },
      });

      const res = await service.remove('userA', 'exp1');
      expect(res).toHaveProperty('message', 'Experience deleted successfully');
      expect(storage.remove).toHaveBeenCalledTimes(1);
    });

    it('throw InternalServerErrorException if error getting fragment storage path', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience1(), error: null }),
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: [mockFragment()],
            error: { message: 'error retrieving path' },
          }),
      });

      const storage = mockBucket({
        remove: jest
          .fn<() => Promise<{ error: any }>>()
          .mockResolvedValue({ error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnValue(storage) },
      });

      await expect(service.remove('userA', 'exp1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('empty experience should not call supabase to remove fragments', async () => {
      const commands = mockDb({
        single: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({ data: mockExperience1(), error: null }),
        returns: jest
          .fn<() => Promise<{ data: any; error: any }>>()
          .mockResolvedValue({
            data: [],
            error: null,
          }),
      });

      const storage = mockBucket({
        remove: jest
          .fn<() => Promise<{ error: any }>>()
          .mockResolvedValue({ error: null }),
      });

      getClient.mockReturnValue({
        from: commands.from,
        storage: { from: jest.fn().mockReturnValue(storage) },
      });

      const res = await service.remove('userA', 'exp1');
      expect(res).toHaveProperty('message', 'Experience deleted successfully');
      expect(storage.remove).not.toHaveBeenCalled();
    });
  });
});
