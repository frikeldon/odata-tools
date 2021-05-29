/** Encapsula un valor. */
export default class OdataValue {
  /**
   * Reemplaza el valor de la propiedad 'key' del objeto 'data',
   * por una instancia de OdataValue que contiene el valor existente en la propiedad.
   * @param {object} data Objeto que contiene la propiedad a reemplazar por OdataValue.
   * @param {object} options Opciones del reemplazo.
   * @param {string} options.key Nombre de la propiedad a reemplazar por OdataValue.
   * @param {object} instanceOptions Opciones de la nueva instancia de OdataValue. (opcional)
   * @returns {object} Referencia al objeto 'data'.
   */
  static replaceInData (data, { key }, instanceOptions) {
    data[key] = new this(data[key], instanceOptions)
    return data
  }

  /**
   * Crea una nueva instancia de OdataValue a partir de un valor de filtro OData.
   * @param {string} value Valor de filtro OData.
   * @param {OdataValue} instanceOptions Opciones de la nueva instancia de OdataValue. (opcional)
   * @returns Nueva instancia de OdataValue.
   */
  static fromFilter (value, instanceOptions) {
    if (typeof value === 'string') {
      const matchDate = value.match(/^date\((\d+-\d+-\d+T\d+:\d+:\d+\.\d+Z)\)$/i)
      if (matchDate) {
        const date = new Date(matchDate[1])
        if (!isNaN(date)) {
          return new this(date, instanceOptions)
        }
      }

      if (value.length > 1 && value.startsWith("'") && value.endsWith("'")) {
        const stringValue = value.substring(1, value.length - 1).replace(/''/g, "'")
        return new this(stringValue, instanceOptions)
      }

      if (value.length > 1 && value.startsWith("'") && value.endsWith("'")) {
        const stringValue = value.substring(1, value.length - 1).replace(/''/g, "'")
        return new this(stringValue, instanceOptions)
      }

      if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
        const stringValue = value.substring(1, value.length - 1).replace(/""/g, '"')
        return new this(stringValue, instanceOptions)
      }

      if (value === 'true') {
        return new this(true, instanceOptions)
      }

      if (value === 'false') {
        return new this(false, instanceOptions)
      }

      const number = Number(value)
      if (!isNaN(number)) {
        return new this(number, instanceOptions)
      }
    }

    return new this(value, instanceOptions)
  }

  /**
   * Crea una nueva instancia de OdataValue.
   * @param {*} value Valor a encapsular. Si es una instancia de OdataValue se copiara el valor y los métodos de transformación.
   * @param {object} options Opciones del campo. (opcional)
   * @param {string} options.type Tipo de dato.
   * @param {function} options.stringify Método para transformar un valor a texto.
   * @param {function} options.parse Método para interpretar un valor a partir de un texto.
   * @param {function} options.formatify Método para transformar un valor a texto formateado.
   * @param {function} options.htmlify Método para transformar un valor a HTML.
   */
  constructor (value, options) {
    const valueOptions = value instanceof OdataValue
      ? {
          type: value.type,
          stringify: value.stringify,
          parse: value.parse,
          formatify: value.formatify,
          htmlify: value.htmlify
        }
      : {}
    const { type, stringify, parse, formatify, htmlify } = Object.assign(valueOptions, options)

    Object.defineProperties(this, {
      value: {
        enumerable: true,
        writable: true,
        value: value instanceof OdataValue ? value.value : value
      },
      type: {
        writable: true,
        value: type
      },
      stringify: {
        writable: true,
        value: stringify
      },
      parse: {
        writable: true,
        value: parse
      },
      formatify: {
        writable: true,
        value: formatify
      },
      htmlify: {
        writable: true,
        value: htmlify
      }
    })
  }

  /**
   * Devuelve el valor de OdataValue.
   * @returns {*} El valor de OdataValue.
   */
  valueOf () {
    return this.value
  }

  /**
   * Devuelve el valor de OdataValue representado como texto.
   * @returns {string} El valor de OdataValue representado como texto.
   */
  toString () {
    if (typeof this.formatify === 'function') {
      return this.formatify(this.value)
    } else if (typeof this.stringify === 'function') {
      return this.stringify(this.value)
    } else {
      return this.value?.toString() ?? ''
    }
  }

  /**
   * Devuelve el valor de OdataValue representado como JSON.
   * @returns {*} El valor de OdataValue representado como JSON.
   */
  toJSON () {
    return typeof this.value?.toJSON === 'function'
      ? this.value.toJSON()
      : this.value
  }

  /**
   * Devuelve el valor de OdataValue representado como valor de filtro OData.
   * @returns {string} El valor de OdataValue representado como valor de filtro OData.
   */
  toFilter () {
    if (this.value == null) {
      return 'null'
    }

    if (this.value instanceof Date) {
      return `date(${this.value.toISOString()})`
    }

    if (typeof this.value === 'string') {
      if (!this.value.includes("'")) {
        return `'${this.value}'`
      } else if (!this.value.includes('"')) {
        return `"${this.value}"`
      } else {
        return `'${this.value.replace(/'/g, "''")}'`
      }
    }

    return String(this.value)
  }
}
