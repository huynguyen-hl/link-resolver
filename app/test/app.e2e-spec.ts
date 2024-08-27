import { HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

const baseUrl = process.env.RESOLVER_DOMAIN;

describe('AppController (e2e)', () => {
  it('/ (GET)', async () => {
    const res = await request(baseUrl).get('/').expect(HttpStatus.OK);
    expect(res.text).toEqual('Hello World!');
  });
});
