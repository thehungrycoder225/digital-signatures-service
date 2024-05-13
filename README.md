# Digital Signature Service API

This project is an Express.js application that provides a digital signature service API. It uses Node.js built-in `crypto` module to generate RSA key pairs, hash content, and sign it.

## Description

The service has two main endpoints under the `/api/v1/ds` route:

1. `/generateKeys`: This endpoint generates a new RSA key pair and returns it in the response. The keys are returned in 'pem' format.

2. `/sign`: This endpoint takes a section, content, and a private key as input, hashes the content, and then signs it using the provided private key.

The API is CORS-enabled and supports JSON payloads.

## Installation

To install the project, follow these steps:

```bash
git clone <repo>
cd <project>
npm install
```
