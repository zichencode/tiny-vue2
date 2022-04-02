export const isType = (val, type) => {
  const [first, res] = Object.prototype.toString.call(val).match(/\[object\s(\w+)\]/);
  return res.toLowerCase() === type
}

export function isObject (obj) {
  return obj !== null && typeof obj === 'object'
}

function makeMap(str) {
  let tagList = str.split(',');
  return (tagName) => tagList.includes(tagName)
}

export const isReservedTag = makeMap(`template,script,style,slot,link,span,div,input,button,a,img,image,select,meta,svg,canvas,header,footer`)