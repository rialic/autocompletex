// eslint-disable-next-line no-unused-vars
const ModuleFactory = obj => {
  const object = { ...obj() }

  Object.setPrototypeOf(object, obj.prototype)

  return object
}