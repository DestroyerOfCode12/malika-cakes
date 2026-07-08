import crypto from 'crypto';
import https from 'https';

// PayFast retired anonymous sandbox testing — a free sandbox account
// (sandbox.payfast.co.za) with its own merchant_id/merchant_key/passphrase
// is required even for test transactions. No env vars = the app still
// runs, but payment initiation will fail signature verification until
// PAYFAST_MERCHANT_ID/KEY/PASSPHRASE are set.
const isLive = process.env.PAYFAST_MODE === 'live';

const MERCHANT_ID = process.env.PAYFAST_MERCHANT_ID || '';
const MERCHANT_KEY = process.env.PAYFAST_MERCHANT_KEY || '';
const PASSPHRASE = process.env.PAYFAST_PASSPHRASE || '';

const PROCESS_URL = isLive
  ? 'https://www.payfast.co.za/eng/process'
  : 'https://sandbox.payfast.co.za/eng/process';

const VALIDATE_HOST = isLive ? 'www.payfast.co.za' : 'sandbox.payfast.co.za';

/**
 * PayFast's backend verifies signatures using PHP's urlencode(), which
 * (unlike JS's encodeURIComponent) also escapes ! ' ( ) * — so those must
 * be manually re-escaped after encodeURIComponent, or any field
 * containing them (an apostrophe in a name, parens in an item name, a "+"
 * in an email) silently produces a signature mismatch.
 */
const phpUrlEncode = (str: string): string =>
  encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

/**
 * PayFast's required "generate a param string, MD5 it" signing scheme.
 * Field insertion order matters — it must match the order fields are
 * added to the form PayFast receives (per PayFast's own docs).
 */
const generateSignature = (data: Record<string, string>): string => {
  let paramString = '';
  for (const key of Object.keys(data)) {
    if (data[key] !== '' && data[key] !== undefined && data[key] !== null) {
      paramString += `${key}=${phpUrlEncode(String(data[key]).trim())}&`;
    }
  }
  paramString = paramString.slice(0, -1);

  if (PASSPHRASE) {
    paramString += `&passphrase=${phpUrlEncode(PASSPHRASE.trim())}`;
  }

  return crypto.createHash('md5').update(paramString).digest('hex');
};

interface BuildPaymentFieldsParams {
  orderNumber: string;
  amount: number;
  itemName: string;
  customerName: string;
  customerEmail: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
}

/**
 * Builds the signed field set for a PayFast "Pay Now" form submission.
 * Field order here is the order PayFast's docs specify for signing.
 */
export const buildPayfastPaymentFields = (params: BuildPaymentFieldsParams) => {
  const [nameFirst, ...rest] = params.customerName.trim().split(' ');
  const nameLast = rest.join(' ') || nameFirst;

  const fields: Record<string, string> = {
    merchant_id: MERCHANT_ID,
    merchant_key: MERCHANT_KEY,
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    notify_url: params.notifyUrl,
    name_first: nameFirst,
    name_last: nameLast,
    email_address: params.customerEmail,
    m_payment_id: params.orderNumber,
    amount: params.amount.toFixed(2),
    item_name: params.itemName,
  };

  const signature = generateSignature(fields);

  return {
    action: PROCESS_URL,
    fields: { ...fields, signature },
  };
};

/**
 * ITN (Instant Transaction Notification) verification. PayFast POSTs to
 * our /notify endpoint server-to-server after a payment attempt. Per
 * PayFast's security requirements, three checks: signature matches,
 * server-to-server validation call confirms the data with PayFast itself
 * (protects against spoofed requests), and the amount matches what we
 * expect (protects against tampering with the posted amount).
 */
export const verifyItnSignature = (data: Record<string, string>): boolean => {
  const { signature, ...rest } = data;
  return generateSignature(rest) === signature;
};

export const validateWithPayfast = (rawBody: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const req = https.request(
      {
        hostname: VALIDATE_HOST,
        path: '/eng/query/validate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(rawBody),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve(body.trim() === 'VALID'));
      }
    );
    req.on('error', () => resolve(false));
    req.write(rawBody);
    req.end();
  });
};

export const isPayfastConfigured = () => Boolean(MERCHANT_ID && MERCHANT_KEY);
