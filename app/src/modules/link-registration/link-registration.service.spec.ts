import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { LinkRegistrationService } from './link-registration.service';
import { IRepositoryProvider } from 'src/repository/providers/provider.repository.interface';
import { IdentifierManagementService } from '../identifier-management/identifier-management.service';
import { ConfigModule } from '@nestjs/config';

describe('LinkRegistrationService', () => {
  let service: LinkRegistrationService;
  let repositoryProvider: IRepositoryProvider;
  let identifierManagementService: IdentifierManagementService;

  beforeEach(async () => {
    // Creates a testing module for the LinkRegistrationService.
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        LinkRegistrationService,
        {
          provide: 'RepositoryProvider',
          useValue: {
            one: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: I18nService,
          useValue: {
            translate: jest.fn().mockImplementation((key) => key),
          },
        },
        {
          provide: IdentifierManagementService,
          useValue: {
            getIdentifier: jest.fn().mockResolvedValue({
              namespace: 'testNamespace',
              namespaceURI: 'https://namespace.uri/voc',
              namespaceProfile: 'https://namespace.uri/voc/?show=linktypes',
              applicationIdentifiers: [
                {
                  ai: '01',
                  regex: '^.*$',
                  type: 'I',
                  qualifiers: ['10'],
                },
                {
                  ai: '10',
                  regex: '^.*$',
                  type: 'Q',
                },
              ],
            }),
          },
        },
      ],
    }).compile();

    // Get the LinkRegistrationService and the RepositoryProvider instance from the testing module.
    service = module.get<LinkRegistrationService>(LinkRegistrationService);
    repositoryProvider = module.get<IRepositoryProvider>('RepositoryProvider');
    identifierManagementService = module.get<IdentifierManagementService>(
      IdentifierManagementService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should save the registration and return success message', async () => {
      const payload = {
        namespace: 'testNamespace',
        identificationKeyType: '01',
        identificationKey: 'testKey',
        itemDescription: 'testDescription',
        qualifierPath: '',
        active: true,
        responses: [],
      };

      jest
        .spyOn(service['configService'], 'get')
        .mockReturnValue('testResolverDomain');

      const result = await service.create(payload);

      expect(result).toEqual({
        message: 'successes.register_link_resolver_successfully',
      });
    });

    it("should throw an exception if the repositoryProvider's save method throws an error", async () => {
      const payload = {
        namespace: 'testNamespace',
        identificationKeyType: '01',
        identificationKey: 'testKey',
        itemDescription: 'testDescription',
        qualifierPath: '10/12345678901234567890',
        active: true,
        responses: [],
      };

      jest
        .spyOn(service['configService'], 'get')
        .mockReturnValue('testResolverDomain');

      jest
        .spyOn(repositoryProvider, 'save')
        .mockRejectedValue(new Error('Test error'));

      await expect(service.create(payload)).rejects.toThrow();
    });

    it('should throw an exception if the resolverDomain configuration is missing', async () => {
      const payload = {
        namespace: 'testNamespace',
        identificationKeyType: '01',
        identificationKey: 'testKey',
        itemDescription: 'testDescription',
        qualifierPath: '10/12345678901234567890',
        active: true,
        responses: [],
      };

      await expect(service.create(payload)).rejects.toThrow(
        'Missing configuration for RESOLVER_DOMAIN',
      );
    });

    it('should throw an exception if the linkTypeVocDomain configuration is missing', async () => {
      const payload = {
        namespace: 'testNamespace',
        identificationKeyType: '01',
        identificationKey: 'testKey',
        itemDescription: 'testDescription',
        qualifierPath: '10/12345678901234567890',
        active: true,
        responses: [],
      };
      jest.spyOn(service['configService'], 'get').mockImplementation((key) => {
        if (key === 'RESOLVER_DOMAIN') {
          return 'testResolverDomain';
        }
        return undefined;
      });

      jest
        .spyOn(identifierManagementService, 'getIdentifier')
        .mockResolvedValue({
          namespace: 'validNamespace',
          namespaceProfile: '',
          namespaceURI: '',
          applicationIdentifiers: [
            {
              title: 'Global Trade Item Number (GTIN)',
              label: 'GTIN',
              shortcode: 'gtin',
              ai: '01',
              type: 'I',
              qualifiers: ['10'],
              regex: '(\\d{12,14}|\\d{8})',
            },
            {
              title: 'Batch or Lot Number',
              label: 'BATCH/LOT',
              shortcode: 'lot',
              ai: '10',
              type: 'Q',
              regex:
                '([\\x21-\\x22\\x25-\\x2F\\x30-\\x39\\x41-\\x5A\\x5F\\x61-\\x7A]{0,20})',
            },
          ],
        });

      await expect(service.create(payload)).rejects.toThrow(
        'Missing configuration for LINK_TYPE_VOC_DOMAIN',
      );
    });
  });
});
