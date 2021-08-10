import OdataValue from './value.js'

export default function odataEquals (...values) {
  if (values.length > 1) {
    const value = values[0] instanceof OdataValue
      ? values[0].value
      : values[0]
    const isDate = value instanceof Date

    for (let index = 1; index < values.length; index += 1) {
      const current = values[index] instanceof OdataValue
        ? values[index].value
        : values[index]
      if (isDate) {
        if (!(current instanceof Date) || current.getTime() !== value.getTime()) {
          return false
        }
      } else if (current !== value) {
        return false
      }
    }
  }

  return true
}
