import OdataValue from './value.js'

function getUnitaryOperation (operator) {
  return function filterUnitaryOperation (filter) {
    return `(${operator} ${odataFilter(filter[operator])})`
  }
}

function getBinaryOperation (operator) {
  return function filterBinaryOperation (filter) {
    if (!Array.isArray(filter[operator])) {
      throw new Error(`La operacion de filtro "${operator}" debe contener un array de operandos.`)
    }
    if (filter[operator].length !== 2) {
      throw new Error(`La operacion de filtro "${operator}" solo puede tener dos operandos.`)
    }
    const [first, second] = filter[operator].map(element => odataFilter(element))
    return `(${first} ${operator} ${second})`
  }
}

function getMultipleOperation (operator) {
  return function filterMultipleOperation (filter) {
    if (!Array.isArray(filter[operator])) {
      throw new Error(`La operacion de filtro "${operator}" debe contener un array de operandos.`)
    }
    const operands = filter[operator]
      .filter(operand => operand != null)
      .map(operand => odataFilter(operand))
    return `(${operands.join(` ${operator} `)})`
  }
}

function getCollectionOperation (operator) {
  return function filterCollectionOperation (filter) {
    if (!Array.isArray(filter[operator])) {
      throw new Error(`La operacion de filtro "${operator}" debe contener un array de operandos.`)
    }
    if (filter[operator].length < 2) {
      throw new Error(`La operacion de filtro "${operator}" necesita como mínimo dos operandos.`)
    }
    const [field, ...optionsDefinition] = filter[operator].map(element => odataFilter(element))
    const options = optionsDefinition.map(opt => odataFilter(opt))

    return `(${odataFilter(field)} ${operator} (${options.join(', ')}))`
  }
}

function getFunctionOperation (name) {
  return function filterFunctionOperation (filter) {
    if (!Array.isArray(filter[name])) {
      throw new Error(`La operacion de filtro "${name}" debe contener un array de operandos.`)
    }
    const parameters = filter[name].map(parameter => odataFilter(parameter))
    return `${name}(${parameters.join(', ')})`
  }
}

const operations = {
  // Logical Operators
  eq: getBinaryOperation('eq'),
  ne: getBinaryOperation('ne'),
  gt: getBinaryOperation('gt'),
  ge: getBinaryOperation('ge'),
  lt: getBinaryOperation('lt'),
  le: getBinaryOperation('le'),
  and: getMultipleOperation('and'),
  or: getMultipleOperation('or'),
  not: getUnitaryOperation('not'),
  in: getCollectionOperation('in'),
  has: getCollectionOperation('has'),

  // Arithmetic Operators
  add: getMultipleOperation('add'),
  sub: getMultipleOperation('sub'),
  '-': getUnitaryOperation('-'),
  mul: getMultipleOperation('mul'),
  div: getMultipleOperation('div'),
  mod: getBinaryOperation('mod'),

  // String and Collection Functions
  substringof: getFunctionOperation('substringof'),
  endswith: getFunctionOperation('endswith'),
  startswith: getFunctionOperation('startswith'),
  length: getFunctionOperation('length'),
  indexof: getFunctionOperation('indexof'),
  replace: getFunctionOperation('replace'),
  substring: getFunctionOperation('substring'),
  concat: getFunctionOperation('concat'),
  contains: getFunctionOperation('contains'),

  // Collection Functions
  hassubset: getFunctionOperation('hassubset'),
  hassubsequence: getFunctionOperation('hassubsequence'),

  // String Functions
  matchesPattern: getFunctionOperation('matchesPattern'),
  tolower: getFunctionOperation('tolower'),
  toupper: getFunctionOperation('toupper'),
  trim: getFunctionOperation('trim'),

  // Date Functions
  date: getFunctionOperation('date'),
  day: getFunctionOperation('day'),
  fractionalseconds: getFunctionOperation('fractionalseconds'),
  hour: getFunctionOperation('hour'),
  minute: getFunctionOperation('minute'),
  month: getFunctionOperation('month'),
  second: getFunctionOperation('second'),
  time: getFunctionOperation('time'),
  totaloffsetminutes: getFunctionOperation('totaloffsetminutes'),
  totalseconds: getFunctionOperation('totalseconds'),
  year: getFunctionOperation('year'),
  maxdatetime: getFunctionOperation('maxdatetime'),
  mindatetime: getFunctionOperation('mindatetime'),
  now: getFunctionOperation('now'),

  // Math Functions
  round: getFunctionOperation('round'),
  floor: getFunctionOperation('floor'),
  ceiling: getFunctionOperation('ceiling'),

  // Type Functions
  cast: getFunctionOperation('cast'),
  isof: getFunctionOperation('isof')
}

/**
 * Convierte una estructura JSON en on filtro OData.
 * @param {*} filter Estructura a convertir.
 * @returns {string,undefined} filtro OData.
 */
export default function odataFilter (filter) {
  if (filter === undefined || typeof filter === 'symbol') {
    return undefined
  }

  if (filter === null) {
    return 'null'
  }

  if (typeof filter === 'function') {
    return odataFilter(filter())
  }

  if (['string', 'number', 'boolean', 'bigint'].includes(typeof filter)) {
    return String(filter)
  }

  if (filter instanceof Date) {
    return `date(${filter.toJSON()})`
  }

  if (filter instanceof OdataValue) {
    return filter.toFilter()
  }

  if (Array.isArray(filter)) {
    return `[${
      filter.map(element => odataFilter(element)).join(',')
    }]`
  }

  const { 0: operationName, length: propertiesCount } = Object.keys(filter)

  if (propertiesCount !== 1) {
    throw new Error('Un filtro odata requiere de una única propiedad.')
  }

  if (!(operationName in operations)) {
    throw new Error(`El filtro odata "${operationName}" no se reconoce.`)
  }

  return operations[operationName](filter)
}
