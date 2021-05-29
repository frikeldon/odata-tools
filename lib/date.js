import OdataValue from './value.js'

export const defaultOptions = {
  stringify (date) {
    if (!(date instanceof Date)) {
      return ''
    }
    const padZero = (num, length = 2) => num.toString().padStart(length, '0')
    const day = padZero(date.getDate())
    const month = padZero(date.getMonth() + 1)
    const year = padZero(date.getFullYear(), 4)
    if (this.hasTime) {
      const hours = padZero(date.getHours())
      const minutes = padZero(date.getMinutes())
      return `${day}/${month}/${year} ${hours}:${minutes}`
    } else {
      return `${day}/${month}/${year}`
    }
  },
  parse (text) {
    const [, day, month, year, hours, minutes] = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/) || []
    if (this.hasTime) {
      return day && month && year && hours && minutes
        ? new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes))
        : null
    } else {
      return day && month && year
        ? new Date(Number(year), Number(month) - 1, Number(day))
        : null
    }
  }
}

/** Encapsula una fecha. */
export default class OdataDate extends OdataValue {
  /**
   * Crea una nueva instancia de OdataDate.
   * @param {Date, number, OdataDate} value Fecha a encapsular.
   * @param {object} options Opciones del campo. (opcional)
   * @param {function} options.hasTime Indica si los métodos stringify y parse por defecto tienen en cuenta la hora.
   * @param {function} options.stringify Metodo para transformar una fecha a texto.
   * @param {function} options.parse Metodo para interpretar una fecha a partir de un texto.
   * @param {function} options.formatify Método para transformar una fecha a texto formateado.
   * @param {function} options.htmlify Método para transformar un valor a HTML.
   */
  constructor (value, options = {}) {
    if (value instanceof OdataDate) {
      super(value, options)
      Object.defineProperty(this, 'hasTime', {
        writable: true,
        value: 'hasTime' in options ? options.hasTime : value?.hasTime
      })
    } else {
      const instanceOptions = Object.assign({}, defaultOptions, options)
      const instanceValue = value == null ? null : new Date(value)
      super(instanceValue, instanceOptions)
      Object.defineProperty(this, 'hasTime', {
        writable: true,
        value: Boolean(options?.hasTime)
      })
    }
  }

  /** Devuelve el número de milisegundos desde el 1 de enero de 1970 00:00:00 UTC correspondiente al valor de OdataDate. */
  valueOf () {
    return this.value?.getTime()
  }
}
