const B64 = require('base64-js');

export function strToUint8Array(str) {
  return new Uint8Array(Buffer.from(str, 'ascii'));
}

export function b64ToUint8Array (str){
  // B64.toByteArray might return a Uint8Array, an Array or an Object depending on the platform.
  // Wrap it in Object.values and new Uint8Array to make sure it's a Uint8Array.
  let arr = B64.toByteArray(str);
  arr = Object.values(arr);
  arr = new Uint8Array(arr);
  return arr;
}

export function uInt8ArrayToB64(array) {
  const b = Buffer.from(array);
  return b.toString('base64');
}

export function b64ToUrlSafeB64(s) {
  const alts = {
    '/': '_',
    '+': '-',
    '=': ''
  };
  return s.replace(/[/+=]/g, (c) => alts[c]);
}

export default {
  strToUint8Array,
  b64ToUint8Array,
  uInt8ArrayToB64,
  b64ToUrlSafeB64
}