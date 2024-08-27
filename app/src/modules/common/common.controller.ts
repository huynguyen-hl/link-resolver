import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CommonService } from './common.service';

@Controller()
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('.well-known/resolver')
  @Public()
  async getResolver() {
    const data = await this.commonService.transformResolverData();
    return data;
  }

  @Get('voc')
  @Public()
  getVoc(@Query('show') show: string, @Res() res: Response) {
    if (show && show.toLowerCase() === 'linktypes') {
      return res.json(this.commonService.getLinkTypes());
    } else {
      return res.redirect('/voc/?show=linktypes');
    }
  }
}
