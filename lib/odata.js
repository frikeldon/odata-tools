import odataFilter from './filter.js'

function applyOdataFilter (params) {
  if (params) {
    if (params.$filter && typeof params.$filter === 'object') {
      params.$filter = odataFilter(params.$filter)
    } else if (!params.$filter) {
      params.$filter = undefined
    }
  }
  return params
}

export default class Odata {
  /**
   * Crea un objeto URL a una URL.
   * @param {string,Array} urlParts URL del recurso como string o como Array con las partes a concatenar.
   * @param {object} [getParams] Parametros GET de la URL.
   * @returns Objeto URL.
   */
  static createUrl (urlParts, getParams = {}) {
    const joinedUrlParts = Array.isArray(urlParts)
      ? urlParts.reduce((accumulated, current) => {
        if (current == null) {
          return accumulated
        }
        const slashEnd = accumulated.endsWith('/')
        const slashStart = current.startsWith('/')
        if (slashEnd && slashStart) {
          return accumulated + current.substr(1)
        } else if (!slashEnd && !slashStart) {
          return accumulated + '/' + current
        } else {
          return accumulated + current
        }
      })
      : urlParts
    const url = new URL(joinedUrlParts)
    for (const name in getParams) {
      const value = getParams[name]
      if (value) {
        url.searchParams.append(name, getParams[name])
      }
    }
    return url
  }

  static async get (urlParts, getParams) {
    getParams = applyOdataFilter(getParams)
    const url = this.createUrl(urlParts, getParams)
    const options = {
      headers: { Accept: 'application/json' }
    }
    const response = await fetch(url, options)
    if (response.ok) {
      return (await response.json())
    } else if (response.status === 400) {
      throw await response.json()
    } else {
      throw new Error()
    }
  }

  static async post (urlParts, data, getParams) {
    getParams = applyOdataFilter(getParams)
    const url = this.createUrl(urlParts, getParams)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(data)
    }
    const response = await fetch(url, options)
    if (response.ok) {
      return (await response.json())
    } else if (response.status === 400) {
      throw await response.json()
    } else {
      throw new Error()
    }
  }

  static async put (urlParts, data, getParams) {
    getParams = applyOdataFilter(getParams)
    const url = this.createUrl(urlParts, getParams)
    const options = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(data)
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const text = await response.text()
      return text ? JSON.parse(text) : null
    } else if (response.status === 400) {
      throw await response.json()
    } else {
      throw new Error()
    }
  }

  static async delete (urlParts, getParams) {
    getParams = applyOdataFilter(getParams)
    const url = this.createUrl(urlParts, getParams)
    const options = {
      method: 'DELETE',
      headers: { Accept: 'application/json' }
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const text = await response.text()
      return text ? JSON.parse(text) : null
    } else if (response.status === 400) {
      throw await response.json()
    } else {
      throw new Error()
    }
  }

  constructor (apiUrl) {
    Object.assign(this, { apiUrl })
  }

  async getEntitySet (entitySet, getParams) {
    const result = await Odata.get([this.apiUrl, entitySet], getParams)
    return result
  }

  async getEntity (entitySet, id, getParams) {
    const result = await Odata.get([this.apiUrl, `${entitySet}(${id})`], getParams)
    return result
  }

  async createEntity (entitySet, data, getParams) {
    return await Odata.post([this.apiUrl, entitySet], data, getParams)
  }

  async updateEntity (entitySet, id, data, getParams) {
    return await Odata.put([this.apiUrl, `${entitySet}(${id})`], data, getParams)
  }

  async deleteEntity (entitySet, id, getParams) {
    return await Odata.delete([this.apiUrl, `${entitySet}(${id})`], getParams)
  }
}
