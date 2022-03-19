export const isType = (val, type) => {
  const [first, res] = Object.prototype.toString.call(val).match(/\[object\s(\w+)\]/);
  return res.toLowerCase() === type
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}