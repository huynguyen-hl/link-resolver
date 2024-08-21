import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { CreateLinkRegistrationDto } from './dto/link-registration.dto';
import { IRepositoryProvider } from '../../repository/providers/provider.repository.interface';
import {
  constructHTTPLink,
  constructLinkSetJson,
} from './utils/link-set.utils';
import { IdentifierManagementService } from '../identifier-management/identifier-management.service';
import { convertAICode } from '../shared/utils/uri.utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
/**
 * Service responsible for creating new registrations and validating registration payloads.
 */
export class LinkRegistrationService {
  constructor(
    @Inject('RepositoryProvider')
    private readonly repositoryProvider: IRepositoryProvider,
    @Inject()
    private readonly identifierManagementService: IdentifierManagementService,
    private configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Creates a new registration using the provided payload.
   * @param payload - The registration data.
   * @returns A message indicating the success of the operation.
   */
  async create(
    payload: CreateLinkRegistrationDto,
  ): Promise<{ message: string }> {
    const applicationIdentifiers = (
      await this.identifierManagementService.getIdentifier(payload.namespace)
    ).applicationIdentifiers;

    const resolverDomain = this.configService.get<string>('RESOLVER_DOMAIN');
    const linkTypeVocDomain = this.configService.get<string>(
      'LINK_TYPE_VOC_DOMAIN',
    );

    if (!resolverDomain) {
      throw new Error('Missing configuration for RESOLVER_DOMAIN');
    }
    if (!linkTypeVocDomain) {
      throw new Error('Missing configuration for LINK_TYPE_VOC_DOMAIN');
    }

    const aiCode = convertAICode(
      payload.identificationKeyType,
      applicationIdentifiers,
    );

    const objectName = this.getObjectName(payload, aiCode);

    const linkset = constructLinkSetJson(payload, aiCode, {
      resolverDomain,
      linkTypeVocDomain,
    });

    const linkHeaderText = constructHTTPLink(payload, aiCode, {
      resolverDomain,
      linkTypeVocDomain,
    });

    await this.repositoryProvider.save({
      id: objectName,
      createdAt: new Date().toISOString(),
      linkset,
      linkHeaderText,
      ...payload,
    });

    const translatedMessage = this.i18n.translate(
      'successes.register_link_resolver_successfully',
    );
    return { message: translatedMessage };
  }

  /**
   * Generates the object name based on the registration payload.
   * @param payload - The registration payload.
   * @returns The object name.
   */
  private getObjectName(
    payload: CreateLinkRegistrationDto,
    aiCode: string,
  ): string {
    const path =
      payload.qualifierPath && payload.qualifierPath !== '/'
        ? `/${payload.namespace}/${aiCode}/${payload.identificationKey}${payload.qualifierPath}.json`
        : `/${payload.namespace}/${aiCode}/${payload.identificationKey}.json`;

    return path;
  }
}
