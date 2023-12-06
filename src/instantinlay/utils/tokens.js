const tokens = {
  YYYY: (date) => date.getFullYear(),
  YY: (date) => (date.getFullYear() % 100).toString().padStart(2, '0'),
  yyyy: (date) => date.getFullYear(),
  yy: (date) => (date.getFullYear() % 100).toString().padStart(2, '0'),
  MM: (date) => (date.getMonth() + 1).toString().padStart(2, '0'),
  M: (date) => date.getMonth() + 1,
  dd: (date) => date.getDate().toString().padStart(2, '0'),
  d: (date) => date.getDate(),
  DD: (date) => date.getDate().toString().padStart(2, '0'),
  D: (date) => date.getDate(),
  HH: (date) => date.getHours().toString().padStart(2, '0'),
  H: (date) => date.getHours(),
  hh: (date) => date.getHours().toString().padStart(2, '0'),
  h: (date) => date.getHours(),
  mm: (date) => date.getMinutes().toString().padStart(2, '0'),
  m: (date) => date.getMinutes(),
  ss: (date) => date.getSeconds().toString().padStart(2, '0'),
  s: (date) => date.getSeconds(),
  SSS: (date) => date.getMilliseconds().toString().padStart(3, '0'),
  a: (date) => date.getHours() < 12 ? 'a.m.' : 'p.m.',
  A: (date) => date.getHours() < 12 ? 'A.M.' : 'P.M.'
}

module.exports = tokens
