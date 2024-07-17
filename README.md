# Pyx Llink Resolver

This software enables users to resolve identifiers
and retrieve relevant information
associated with those identifiers.

The core functionality includes link resolution,
identifier management, and basic link registration.

This software complies with:

* complies with ISO 18975 for link resolution
* supports the GS1 Digital Link standard for resolving GS1 identifiers.

It allows anonymous users to access the service
and retrieve link information without authentication.

Authorised users have the ability to register and manage links
associated with identifiers through an authenticated API endpoint.

More detailed documentation is in the [document folder](docs/index.md)


## Developers

The system can be run locally using docker-compose
(see `docker-compose.yml`, or run `docker-compose up`)

Notes:
* Use [Semantic Line Breaks](https://sembr.org/) for text markup