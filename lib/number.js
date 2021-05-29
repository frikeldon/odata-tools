import OdataValue from './value.js'

export const defaultOptions = {
  stringify (number) {
    return isNaN(number)
      ? ''
      : String(number).replace('.', ',')
  },
  parse (text) {
    const number = Number(text?.replace(/\./g, '').replace(',', '.'))
    if (!isNaN(number) && typeof this.fractionDigits === 'number') {
      const fractional = 10 ** this.fractionDigits
      return Math.trunc(number * fractional) / fractional
    } else {
      return number
    }
  },
  formatify (number) {
    return isNaN(number)
      ? ''
      : Number(number).toLocaleString('ca-ES', {
        useGrouping: this.useGrouping,
        minimumIntegerDigits: typeof this.minimumIntegerDigits === 'number' ? this.minimumIntegerDigits : 1,
        minimumFractionDigits: typeof this.fractionDigits === 'number' ? this.fractionDigits : 0,
        maximumFractionDigits: typeof this.fractionDigits === 'number' ? this.fractionDigits : 20
      })
  }
}

/** Encapsula un numero, con un metodo de formateo asociado. */
export default class OdataNumber extends OdataValue {
  /**
   * Crea una nueva instancia de OdataNumber.
   * @param {number} value Valor a encapsular.
   * @param {object} options Opciones del campo.
   * @param {boolean} options.useGrouping Indica si el número debe formatearse con separadores de millar.
   * @param {number} options.fractionDigits Número de dígitos decimales al interpretar y formatear el numero.
   * @param {number} options.minimumIntegerDigits Número de dígitos enteros al formatear el numero.
   * @param {function} options.formatify Metodo para formatear un numero para su lectura como texto.
   * @param {function} options.stringify Metodo para transformar un numero a texto.
   * @param {function} options.parse Metodo para interpretar un numero a partir de un texto.
   * @param {function} options.htmlify Método para transformar un valor a HTML.
   */
  constructor (value, options = {}) {
    if (value instanceof OdataNumber) {
      super(value, options)
      Object.defineProperties(this, {
        useGrouping: {
          writable: true,
          value: 'useGrouping' in options ? Boolean(options.useGrouping) : value.useGrouping
        },
        fractionDigits: {
          writable: true,
          value: 'fractionDigits' in options ? options.fractionDigits : value.fractionDigits
        },
        minimumIntegerDigits: {
          writable: true,
          value: 'minimumIntegerDigits' in options ? options.minimumIntegerDigits : value.minimumIntegerDigits
        }
      })
    } else {
      const instanceOptions = Object.assign({}, defaultOptions, options)
      const instanceValue = typeof value === 'number' ? value : instanceOptions.parse(value)
      super(instanceValue, instanceOptions)
      Object.defineProperties(this, {
        useGrouping: {
          writable: true,
          value: Boolean(options.useGrouping)
        },
        fractionDigits: {
          writable: true,
          value: options.fractionDigits
        },
        minimumIntegerDigits: {
          writable: true,
          value: options.minimumIntegerDigits
        }
      })
    }
  }
}
