import { HttpStatus } from '@nestjs/common';
import { IdentifierDto } from '../src/modules/identifier-management/dto/identifier.dto';
import * as request from 'supertest';

const baseUrl = process.env.RESOLVER_DOMAIN;
const environment = process.env.ENVIRONMENT;
const apiKey = process.env.API_KEY;

// Define namespaces for e2e testing to avoid data pollution
const gs1 = `e2e-${environment}-mock-gs1`;
const nlisid = `e2e-${environment}-mock-nlisid`;

describe('Full flow (e2e)', () => {
  it('should create many namespaces', async () => {
    const identifierGtinDto: IdentifierDto = {
      namespace: gs1,
      namespaceProfile: '',
      namespaceURI: '',
      applicationIdentifiers: [
        {
          ai: '01',
          shortcode: 'gtin',
          type: 'I',
          title: 'Global Trade Item Number (GTIN)',
          label: 'GTIN',
          regex: '(\\d{12,14}|\\d{8})',
          qualifiers: ['22', '10', '21'],
        },
        {
          ai: '10',
          shortcode: 'lot',
          type: 'Q',
          title: 'Batch or lot number',
          label: 'BATCH/LOT',
          regex:
            '([\\x21-\\x22\\x25-\\x2F\\x30-\\x39\\x41-\\x5A\\x5F\\x61-\\x7A]{0,20})',
        },
        {
          ai: '21',
          shortcode: 'ser',
          type: 'Q',
          title: 'Serial number',
          label: 'SERIAL',
          regex:
            '([\\x21-\\x22\\x25-\\x2F\\x30-\\x39\\x41-\\x5A\\x5F\\x61-\\x7A]{0,20})',
        },
        {
          ai: '22',
          shortcode: 'cpv',
          type: 'Q',
          title: 'Consumer product variant',
          label: 'CPV',
          regex:
            '([\\x21-\\x22\\x25-\\x2F\\x30-\\x39\\x41-\\x5A\\x5F\\x61-\\x7A]{0,20})',
        },
      ],
    };

    const res = await request(baseUrl)
      .post('/api/identifiers')
      .set('Authorization', `Bearer ${apiKey}`)
      .send(identifierGtinDto)
      .expect(HttpStatus.OK);

    expect(res.body).not.toBeNull();

    const identifierNlisidDto2: IdentifierDto = {
      namespace: nlisid,
      namespaceProfile: 'http://localhost:3000/voc/?show=linktypes',
      namespaceURI: 'http://localhost:3000/voc/?show=linktypes',
      applicationIdentifiers: [
        {
          title: 'National Livestock Identification System ID (NLISID)',
          label: 'NLISID',
          shortcode: 'nlisid',
          ai: '03',
          type: 'I',
          qualifiers: ['21'],
          regex: '^[A-Za-z0-9]{16}$',
        },
        {
          ai: '21',
          shortcode: 'ser',
          type: 'Q',
          title: 'Serial number',
          label: 'SERIAL',
          regex:
            '([\\x21-\\x22\\x25-\\x2F\\x30-\\x39\\x41-\\x5A\\x5F\\x61-\\x7A]{0,20})',
        },
      ],
    };

    const res2 = await request(baseUrl)
      .post('/api/identifiers')
      .set('Authorization', `Bearer ${apiKey}`)
      .send(identifierNlisidDto2)
      .expect(HttpStatus.OK);

    expect(res2.body).not.toBeNull();
  });

  describe('e2e-test-mock-gs1 namespace ', () => {
    it('should register a link with gtin, lot and serial number in qualifierPath', async () => {
      const linkRegistrationDto = {
        namespace: gs1,
        identificationKeyType: 'gtin',
        identificationKey: '12345678901234',
        itemDescription: 'Product description',
        qualifierPath: '/10/LOT1234/21/SER5678',
        active: true,
        responses: [
          {
            defaultLinkType: true,
            defaultMimeType: true,
            defaultIanaLanguage: true,
            defaultContext: true,
            fwqs: false,
            active: true,
            linkType: gs1 + ':certificationInfo',
            ianaLanguage: 'en',
            context: 'au',
            title: 'Certification Information',
            targetUrl: 'https://example-json.com',
            mimeType: 'application/json',
          },
          {
            defaultLinkType: true,
            defaultMimeType: true,
            defaultIanaLanguage: true,
            defaultContext: true,
            fwqs: false,
            active: true,
            linkType: gs1 + ':certificationInfo',
            ianaLanguage: 'en',
            context: 'au',
            title: 'Certification Information',
            targetUrl: 'https://example-html.com',
            mimeType: 'text/html',
          },
        ],
      };

      await request(baseUrl)
        .post('/api/resolver')
        .set('Authorization', `Bearer ${apiKey}`) // Use the API key
        .send(linkRegistrationDto)
        .expect(HttpStatus.CREATED);
    });

    it('should get link resolution with gtin, lot, and serial number in qualifierPath, language is en, context is US, and mimeType is application/json', async () => {
      const gs1 = 'e2e-test-mock-gs1';
      const gtin = '01/12345678901234';
      const lot = '10/LOT1234';
      const serial = '21/SER5678';
      const linkType = gs1 + ':certificationInfo';
      const expectedLocation = 'https://example-json.com';
      const expectedLinkHeader = `<${expectedLocation}>; rel="${linkType}"; type="application/json"; hreflang="en"; title="Certification Information", <https://example-html.com>; rel="${linkType}"; type="text/html"; hreflang="en"; title="Certification Information", <http://localhost:3000/${gs1}/${gtin}/${lot}/${serial}>; rel="owl:sameAs"`;

      await request(baseUrl)
        .get(
          `/${gs1}/${gtin}/${lot}/${serial}?linkType=${encodeURIComponent(linkType)}`,
        )
        .set('Accept', 'application/json')
        .set('Accept-Language', 'en-AU')
        .expect(302)
        .expect('Location', expectedLocation)
        .expect('Link', expectedLinkHeader);
    });

    it('should get link resolution with gtin, lot, and serial number in qualifierPath, language is en, context is US, and mimeType is text/html', async () => {
      const gs1 = 'e2e-test-mock-gs1';
      const gtin = '01/12345678901234';
      const lot = '10/LOT1234';
      const serial = '21/SER5678';
      const linkType = gs1 + ':certificationInfo';
      const expectedLocation = 'https://example-html.com';
      const expectedLinkHeader = `<https://example-json.com>; rel="${linkType}"; type="application/json"; hreflang="en"; title="Certification Information", <${expectedLocation}>; rel="${linkType}"; type="text/html"; hreflang="en"; title="Certification Information", <http://localhost:3000/${gs1}/${gtin}/${lot}/${serial}>; rel="owl:sameAs"`;

      await request(baseUrl)
        .get(
          `/${gs1}/${gtin}/${lot}/${serial}?linkType=${encodeURIComponent(linkType)}`,
        )
        .set('Accept', 'text/html')
        .set('Accept-Language', 'en-AU')
        .expect(302)
        .expect('Location', expectedLocation)
        .expect('Link', expectedLinkHeader);
    });

    it('should register a link with gtin and lot in qualifierPath', async () => {
      const linkRegistrationDto = {
        namespace: gs1,
        identificationKeyType: 'gtin',
        identificationKey: '12345678901234',
        itemDescription: 'Product description',
        qualifierPath: '/10/LOT1234',
        active: true,
        responses: [
          {
            defaultLinkType: true,
            defaultMimeType: true,
            defaultIanaLanguage: true,
            defaultContext: true,
            fwqs: false,
            active: true,
            linkType: gs1 + ':certificationInfo',
            ianaLanguage: 'en',
            context: 'us',
            title: 'Certification Information',
            targetUrl: 'https://example-html.com',
            mimeType: 'text/html',
          },
        ],
      };

      await request(baseUrl)
        .post('/api/resolver')
        .set('Authorization', `Bearer ${apiKey}`) // Use the API key
        .send(linkRegistrationDto)
        .expect(HttpStatus.CREATED);
    });

    it('should get link resolution with gtin and lot', async () => {
      const gs1 = 'e2e-test-mock-gs1';
      const gtin = '01/12345678901234';
      const lot = '10/LOT1234';
      const expectedLocation = 'https://example-html.com';
      const expectedLinkHeader = `<${expectedLocation}>; rel="${gs1}:certificationInfo"; type="text/html"; hreflang="en"; title="Certification Information", <http://localhost:3000/${gs1}/${gtin}/${lot}>; rel="owl:sameAs"`;

      await request(baseUrl)
        .get(`/${gs1}/${gtin}/${lot}`)
        .set('Accept', 'text/html')
        .set('Accept-Language', 'en-US')
        .expect(302)
        .expect('Location', expectedLocation)
        .expect('Link', expectedLinkHeader);
    });

    it('should register a link with only gtin', async () => {
      const linkRegistrationDto = {
        namespace: gs1,
        identificationKeyType: 'gtin',
        identificationKey: '12345678901234',
        itemDescription: 'Product description',
        qualifierPath: '/',
        active: true,
        responses: [
          {
            defaultLinkType: true,
            defaultMimeType: true,
            defaultIanaLanguage: true,
            defaultContext: true,
            fwqs: false,
            active: true,
            linkType: gs1 + ':certificationInfo',
            ianaLanguage: 'en',
            context: 'au',
            title: 'Certification Information',
            targetUrl: 'https://example-html.com',
            mimeType: 'text/html',
          },
        ],
      };

      await request(baseUrl)
        .post('/api/resolver')
        .set('Authorization', `Bearer ${apiKey}`) // Use the API key
        .send(linkRegistrationDto)
        .expect(HttpStatus.CREATED);
    });

    it('should get link resolution with only gtin', async () => {
      const gs1 = 'e2e-test-mock-gs1';
      const gtin = '01/12345678901234';
      const expectedLocation = 'https://example-html.com';
      const expectedLinkHeader = `<${expectedLocation}>; rel="${gs1}:certificationInfo"; type="text/html"; hreflang="en"; title="Certification Information", <http://localhost:3000/${gs1}/${gtin}>; rel="owl:sameAs"`;

      await request(baseUrl)
        .get(`/${gs1}/${gtin}`)
        .set('Accept', 'text/html')
        .set('Accept-Language', 'en-AU')
        .expect(302)
        .expect('Location', expectedLocation)
        .expect('Link', expectedLinkHeader);
    });
  });

  describe('e2e-test-mock-nlisid namespace ', () => {
    it('should register a link with nlisid and serial number in qualifierPath', async () => {
      const linkRegistrationDto = {
        namespace: nlisid,
        identificationKeyType: 'nlisid',
        identificationKey: '1234567890123456',
        itemDescription: 'Product description',
        qualifierPath: '/21/SER1234',
        active: true,
        responses: [
          {
            defaultLinkType: true,
            defaultMimeType: true,
            defaultIanaLanguage: true,
            defaultContext: true,
            fwqs: false,
            active: true,
            linkType: nlisid + ':epcis',
            ianaLanguage: 'en',
            context: 'au',
            title: 'Certification Information',
            targetUrl: 'https://example-html.com',
            mimeType: 'text/html',
          },
        ],
      };

      await request(baseUrl)
        .post('/api/resolver')
        .set('Authorization', `Bearer ${apiKey}`) // Use the API key
        .send(linkRegistrationDto)
        .expect(HttpStatus.CREATED);
    });

    it('should get link resolution with nlisid and serial number', async () => {
      const nlisid = 'e2e-test-mock-nlisid';
      const identificationKey = '03/1234567890123456/21/SER1234';
      const linkType = nlisid + ':epcis';
      const expectedLocation = 'https://example-html.com';
      const expectedLinkHeader = `<${expectedLocation}>; rel="${linkType}"; type="text/html"; hreflang="en"; title="Certification Information", <http://localhost:3000/${nlisid}/${identificationKey}>; rel="owl:sameAs"`;

      await request(baseUrl)
        .get(
          `/${nlisid}/${identificationKey}?linkType=${encodeURIComponent(linkType)}`,
        )
        .set('Accept', 'text/html')
        .set('Accept-Language', 'en-AU')
        .expect(302)
        .expect('Location', expectedLocation)
        .expect('Link', expectedLinkHeader);
    });
  });

  it('delete all namespaces', async () => {
    await request(baseUrl)
      .delete('/api/identifiers')
      .set('Authorization', `Bearer ${process.env.API_KEY}`)
      .query({ namespace: gs1 })
      .expect(HttpStatus.OK);

    await request(baseUrl)
      .delete('/api/identifiers')
      .set('Authorization', `Bearer ${process.env.API_KEY}`)
      .query({ namespace: nlisid })
      .expect(HttpStatus.OK);
  });
});
