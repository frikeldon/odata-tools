import OdataValue from './value.js'

export const defaultOptions = {
  formatify () {
    return this.text
  }
}

/** Encapsula un valor, con un texto descriptivo asociado. */
export default class OdataLookup extends OdataValue {
  /**
   * Reemplaza el valor de la propiedad 'key' del objeto 'data',
   * por una instancia de OdataLookup que contiene el valor existente en la propiedad.
   * @param {object} data Objeto que contiene la propiedad a reemplazar por OdataLookup.
   * @param {object} options Opciones del reemplazo.
   * @param {string} options.key Nombre de la propiedad a reemplazar por OdataLookup.
   * @param {string} options.expand Nombre de la propiedad que contiene el objeto que contiene el texto descriptivo.
   * @param {string} options.expandText Nombre de la propiedad que contiene el texto descriptivo.
   * @param {Array} options.options Si no se especifica expand se usa esta colección de objectos {value, text} para asignar el texto descriptivo a los valores.
   * @param {object} instanceOptions Opciones de la nueva instancia de OdataLookup. (opcional)
   * @returns {object} Referencia la objeto 'data'.
   */
  static replaceInData (data, { key, expand, expandText, options }, instanceOptions) {
    if (expand) {
      data[key] = new this(
        data[key],
        data[expand]?.[expandText],
        instanceOptions
      )
    } else if (Array.isArray(options)) {
      const value = data[key]
      const text = options.find(element => element?.value === value)?.text
      data[key] = new this(value, text, instanceOptions)
    } else {
      data[key] = new this(data[key], '', instanceOptions)
    }
    return data
  }

  /**
   * Crea una nueva instancia de OdataLookup.
   * @param {*} value Valor a encapsular.
   * @param {string} text Texto descriptivo asociado.
   * @param {object} options Opciones del campo. (opcional)
   * @param {string} options.type Tipo de dato.
   * @param {function} options.stringify Método para transformar un valor a texto.
   * @param {function} options.parse Método para interpretar un valor a partir de un texto.
   * @param {function} options.formatify Método para transformar un valor a texto formateado.
   * @param {function} options.htmlify Método para transformar un valor a HTML.
   */
  constructor (value, text, options) {
    const [realText, realOptions] = options === undefined && typeof text === 'object'
      ? [null, text]
      : [text, options]
    if (value instanceof OdataLookup) {
      super(value, realOptions)
      Object.defineProperty(this, 'text', {
        writable: true,
        value: realText === undefined ? value.text : realText
      })
    } else {
      const instanceOptions = Object.assign({}, defaultOptions, realOptions)
      super(value, instanceOptions)
      Object.defineProperty(this, 'text', {
        writable: true,
        value: realText
      })
    }
  }
}
