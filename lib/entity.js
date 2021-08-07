function replaceOdataValuesInObject (properties, types, data) {
  for (const property of properties) {
    if (property.key in data) {
      if (property.type in types) {
        const type = types[property.type]
        type.constructor.replaceInData(data, property, type.options)
      }
    }
  }
  return data
}

function getExpandExpression ({ properties }, expand) {
  if (typeof expand === 'string') {
    return expand
  } else if (expand === true) {
    return properties
      .filter(property => property.expand)
      .map(property => `${property.expand}($select=${property.expandText})`)
  } else if (Array.isArray(expand)) {
    return properties
      .filter(property => property.expand && expand.includes(property.key))
      .map(property => `${property.expand}($select=${property.expandText})`)
  } else {
    return undefined
  }
}

function prepareGetParams (entity, getParams) {
  return getParams
    ? {
        ...getParams,
        $expand: getExpandExpression(entity, getParams.$expand)
      }
    : undefined
}

/** Representa una definicion de entidad OData. */
export default class OdataEntity {
  /**
   * Crea una nueva instancia a partir de una definicion de entidad OData.
   * @param {object} definition Definicion de la entidad OData.
   * @param {string} definition.odata Objeto OData para relalizar las petiticones.
   * @param {string} definition.endpoint Direccionamiento de la entidad OData.
   * @param {Array} definition.properties Lista con las definiciones de las propiedades de la entidad.
   * @param {object} definition.types Tipos de propiedades.
   */
  constructor ({ odata, endpoint, properties, types = {} }) {
    Object.assign(this, { odata, endpoint, properties, types })
  }

  /**
   * Recupera la definición de una propiedad de la entidad a partir de su clave de identificación.
   * @param {string} key Clave de identificación de la propiedad.
   * @returns Definición de la propiedad de la entidad Odata.
   */
  getProperty (key) {
    return this.properties.find(property => property.key === key)
  }

  /**
   * Recupera la definición del tipo de una propiedad de la entidad a partir de su clave de identificación.
   * @param {string} key Clave de identificación de la propiedad.
   * @returns Definición del tipo de la propiedad de la entidad Odata.
   */
  getType (key) {
    const property = this.properties.find(property => property.key === key)
    if (property && property.type in this.types) {
      return this.types[property.type]
    }
    return null
  }

  /**
   * Reemplaza los valores de una estructura de datos, por objectos OdataValue segun los tipos definidos en el esquema.
   * @param {object,Array} data Estructura de datos cuyos valores seran remplazados.
   * @returns {object,Array} Referencia a "data"
   */
  replaceOdataValues (data) {
    if (Array.isArray(data)) {
      for (const element of data) {
        replaceOdataValuesInObject(this.properties, this.types, element)
      }
    } else {
      replaceOdataValuesInObject(this.properties, this.types, data)
    }
    return data
  }

  async getEntitySet (getParams) {
    const params = prepareGetParams(this, getParams)
    const data = await this.odata.getEntitySet(this.endpoint, params)
    data.value = this.replaceOdataValues(data.value)
    return this.replaceOdataValues(data)
  }

  async getEntity (id, getParams) {
    const params = prepareGetParams(this, getParams)
    return await this.odata.getEntity(this.endpoint, id, params)
  }

  async createEntity (data, getParams) {
    const params = prepareGetParams(this, getParams)
    return await this.odata.createEntity(this.endpoint, data, params)
  }

  async updateEntity (id, data, getParams) {
    const params = prepareGetParams(this, getParams)
    return await this.odata.updateEntity(this.endpoint, id, data, params)
  }

  async deleteEntity (id, getParams) {
    const params = prepareGetParams(this, getParams)
    return await this.odata.deleteEntity(this.endpoint, id, params)
  }
}
