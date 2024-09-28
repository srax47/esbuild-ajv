const isObject = (x: unknown) =>
  Object.prototype.toString.call(x) === '[object Object]'

export const mergeDeepLeft = (left: object = {}, right: object = {}): object =>
  Object.entries(right).reduce(
    (acc, [k, v]) =>
      isObject(v) && isObject(left[k as keyof typeof left])
        ? { ...acc, [k]: mergeDeepLeft(left[k as keyof typeof left], v) }
        : { ...acc, [k]: v },
    left,
  )
