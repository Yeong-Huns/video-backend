import { Test, TestingModule } from '@nestjs/testing';
import { RoleService } from './role.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { UserRole } from './enum/user-role';

describe('RoleService', () => {
  let service: RoleService;
  let repository: any;

  const mockRoleRepository = {
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        {
          provide: getRepositoryToken(Role),
          useValue: mockRoleRepository,
        },
      ],
    }).compile();

    service = module.get<RoleService>(RoleService);
    repository = module.get(getRepositoryToken(Role));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should successfully create a role', async () => {
      const createRoleDto = { name: UserRole.USER };
      const savedRole = { id: 1, ...createRoleDto };

      mockRoleRepository.save.mockResolvedValue(savedRole);

      const result = await service.createRole(createRoleDto);

      expect(repository.save).toHaveBeenCalledWith(createRoleDto);
      expect(result).toEqual(savedRole);
    });
  });
});
