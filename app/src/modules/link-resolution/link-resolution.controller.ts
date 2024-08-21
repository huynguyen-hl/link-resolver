import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { LinkResolutionService } from './link-resolution.service';
import { IdentifierParams } from './decorators/identifier-params.decorator';
import { LinkResolutionDto } from './dto/link-resolution.dto';
import { responseResolvedLink } from './utils/response-link.utils';
import {
  ApiBadRequestResponse,
  ApiFoundResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FieldErrorsResponse } from '../../common/dto/errors.dto';
import { IdentifierSetValidationPipe } from '../identifier-management/pipes/identifier-set-validation.pipe';
import { Public } from '../../common/decorators/public.decorator';

@Controller()
export class LinkResolutionController {
  constructor(private readonly linkResolutionService: LinkResolutionService) {}

  @Get([
    ':namespace/:identifierKeyType/:identifierKey',
    ':namespace/:identifierKeyType/:identifierKey/:secondaryIdentifiersPath',
  ])
  @ApiOperation({ summary: 'Resolve a link resolver for an identifier' })
  @Public()
  @ApiTags('Link Resolution')
  @ApiParam({ type: String, name: 'namespace' })
  @ApiParam({ type: String, name: 'identifierKeyType' })
  @ApiParam({ type: String, name: 'identifierKey' })
  @ApiParam({
    type: String,
    name: 'secondaryIdentifiersPath',
    required: false,
    description: 'Secondary identifiers path',
    example: '10/123456',
  })
  @ApiQuery({
    name: 'linkType',
    type: String,
    required: false,
    description: 'Link type',
    example: 'all',
  })
  @ApiFoundResponse({
    description: 'Redirect to the resolved link',
  })
  @ApiNotFoundResponse({
    description: 'Link could not be resolved',
  })
  @ApiBadRequestResponse({
    description: 'Invalid request parameters',
    type: FieldErrorsResponse,
  })
  async resolve(
    @IdentifierParams('identifierParams', IdentifierSetValidationPipe)
    identifierParams: LinkResolutionDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const resolvedLink =
        await this.linkResolutionService.resolve(identifierParams);

      responseResolvedLink(res, req, resolvedLink);
    } catch (error) {
      console.error(error);
    }
  }
}
