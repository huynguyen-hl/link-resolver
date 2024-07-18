# Account management

The account management is simple management that allows the account use the api key to access the identity resolver API when registering the identity resolver.

```jsonc
// The account management JSON file
[
  {
    "apiKey": "1234567890",
    "name": "John Doe"
  }
]
```

![alt text](./assets/IDR-simple-architecture.png 'component diagram')

The anonymous user can access only the resolver API to query the identity resolver. The authorized user can configure the identifiers, register the identity resolver, ect.
