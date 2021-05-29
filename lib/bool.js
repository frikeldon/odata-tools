import OdataValue from './value.js'

export const defaultOptions = {
  stringify (value) {
    return value === null
      ? ''
      : value ? 'Sí' : 'No'
  },
  parse (text) {
    const normalized = String.prototype.trim.call(text ?? '').toLowerCase()
    switch (normalized) {
      case 'true':
      case '1':
      case 'si':
      case 'sí':
        return true
      case 'false':
      case '0':
      case 'no':
        return false
      default:
        return null
    }
  }
}

/** Encapsula un booleano. */
export default class OdataBool extends OdataValue {
  /**
   * Crea una nueva instancia de OdataBool.
   * @param {boolean} value Fecha a encapsular.
   * @param {object} options Opciones del campo.
   * @param {function} options.toJsonAsInt Indica si se transforma a JSON como entero en vez de como booleano.
   * @param {function} options.stringify Método para transformar un valor a texto.
   * @param {function} options.parse Método para interpretar un valor a partir de un texto.
   * @param {function} options.formatify Método para transformar un valor a texto formateado.
   * @param {function} options.htmlify Método para transformar un valor a HTML.
   */
  constructor (value, options = {}) {
    if (value instanceof OdataBool) {
      super(value, options)
      Object.defineProperty(this, 'toJsonAsInt', {
        writable: true,
        value: 'toJsonAsInt' in options ? options.toJsonAsInt : value.toJsonAsInt
      })
    } else {
      const boolValue = value == null ? value : Boolean(value)
      const instanceOptions = Object.assign({}, defaultOptions, options)
      super(boolValue, instanceOptions)
      Object.defineProperty(this, 'toJsonAsInt', {
        writable: true,
        value: Boolean(options.toJsonAsInt)
      })
    }
  }

  /**
   * Devuelve el valor de OdataValue representado como JSON.
   * @returns {*} El valor de OdataValue representado como JSON.
   */
  toJSON () {
    return this.value == null
      ? null
      : this.toJsonAsInt
        ? this.value ? 1 : 0
        : this.value
  }

  /**
   * Devuelve el valor de OdataValue representado como valor de filtro OData.
   * @returns {string} El valor de OdataValue representado como valor de filtro OData.
   */
  toFilter () {
    return this.value == null
      ? 'null'
      : this.toJsonAsInt
        ? this.value ? '1' : '0'
        : String(this.value)
  }
}
