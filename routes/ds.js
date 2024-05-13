const express = require('express');
const crypto = require('crypto');

const router = express.Router();

let section = 'section1';
let content = 'This is the content of section 1';
let report = {
  section1: {
    content: 'This is the content of section 1',
    signature:
      '7a7f50426e2abf3fd20f721692cef82bfae2cd0d8ff3e1a279f7dcdb9686d3e5d9fd6d5ff738ea0ded11a0e869cb1604d7367601e8129d0be04584b3d11a5b434e320f3dc7779ab2e16c3795ed5b65730e3fe121144b524a95d3948252a8f981f711ba49a99abc3d1ff310011deeb5fdb430a528602c82347618945975a97d43ea513313a15eda39ecd82502b3cad70341386d2dcc2a7f8d1c5e4dd7e4b1af2bb0b1d2d739fbc07e178210a0d77e398dc0212219f79349c39c0474f9d5ec674ce76abe679db8dd5a93f16521796a4c1315b7c9eeb33d1a88d2c64fdd09876bddf0a9edc3bfad6bed690290011ab8ebd93adc26136e2cd89ccb8dacb49ec2f700',
  },
};

// Function to hash content
function hashContent(content) {
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
}

// Generate a new RSA key pair
router.get('/generateKeys', (req, res) => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  res.send({
    privateKey: privateKey.export({
      type: 'pkcs1',
      format: 'pem',
    }),
    publicKey: publicKey.export({
      type: 'spki',
      format: 'pem',
    }),
  });
});
// Sign a section of the report
//
// POST /api/v1/ds/sign
// {
//   "section": "section1",
//   "content": "This is the content of section 1",
//   "privateKey": "-----BEGIN RSA PRIVATE
// KEY-----
// MIIEowIBAAKCAQEAq8p0Zm7g6zZf3zN4kQ8tQJ2G7q1T1QWg5Bz3gFpT1mXQ4s2b
//

router.post('/sign', (req, res) => {
  try {
    const { privateKey } = req.body;

    if (!section || !content || !privateKey) {
      return res
        .status(400)
        .send('Missing required fields: section, content, privateKey');
    }

    const hashedData = hashContent(content);

    const signer = crypto.createSign('SHA256');
    signer.update(hashedData);

    // Convert the privateKey from 'pkcs1' format to a KeyObject
    const privateKeyObject = crypto.createPrivateKey({
      key: privateKey,
      format: 'pem',
      type: 'pkcs1',
    });

    const signature = signer.sign(privateKeyObject, 'hex');

    report[section] = { content, signature };

    res.send({
      report,
    });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

// Verify the signature of a section in the report
//
// GET /api/v1/ds/verify?section=section1&publicKey=-----BEGIN
// PUBLIC KEY-----
// MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq8p0Zm7g6zZf3zN4kQ8t
//

router.get('/verify', (req, res) => {
  try {
    const { publicKey } = req.body;

    if (!section || !publicKey) {
      return res
        .status(400)
        .send('Missing required query parameter: section or publicKey');
    }

    // Check if the section exists in the report
    if (!report[section]) {
      return res.status(404).send(`Section ${section} not found`);
    }

    // Retrieve the content and signature from the report object
    const { content, signature } = report[section];

    const hashedData = hashContent(content);

    const verifier = crypto.createVerify('SHA256');
    verifier.update(hashedData);

    // Convert the publicKey from 'spki' format to a KeyObject
    const publicKeyObject = crypto.createPublicKey({
      key: publicKey,
      format: 'pem',
      type: 'spki',
    });

    const isValid = verifier.verify(publicKeyObject, signature, 'hex');

    if (isValid) {
      res.send(`The signature for section ${section} is valid.`);
    } else {
      res
        .status(400)
        .send(`The signature for section ${section} is not valid.`);
    }
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});
// Get the content of a section in the report
//
// GET /api/v1/ds/content?section=section1
//

router.get('/content', (req, res) => {
  try {
    if (!section) {
      return res.status(400).send('Missing required query parameter: section');
    }

    if (!report[section]) {
      return res.status(404).send(`Section ${section} not found`);
    }

    const { content } = report[section];

    res.send({ content });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

// Get the signature of a section in the report
//
// GET /api/v1/ds/signature?section=section1
//

router.get('/signature', (req, res) => {
  try {
    if (!section) {
      return res.status(400).send('Missing required query parameter: section');
    }

    if (!report[section]) {
      return res.status(404).send(`Section ${section} not found`);
    }

    const { signature } = report[section];

    res.send({ signature });
  } catch (error) {
    res.status(500).send({ error: error.toString() });
  }
});

module.exports = router;
