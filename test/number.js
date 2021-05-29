import test from 'tape'
import OdataNumber from '../lib/number.js'

test('OdataNumber representa un número.', t => {
  const instance = new OdataNumber(1620986400000.123)

  t.isEquivalent(
    instance.value,
    1620986400000.123,
    'La propiedad "value" contiene ese número.'
  )

  t.end()
})

test('OdataNumber representa un tipo de dato.', t => {
  const instance = new OdataNumber(123, { type: 'number' })

  t.isEqual(
    instance.type,
    'number',
    'La propiedad "type" contiene ese tipo de dato.'
  )

  const otherInstance = new OdataNumber(123, { type: 'integer' })

  t.deepEqual(
    instance,
    otherInstance,
    'La propiedad "type" no es enumerable.'
  )

  t.end()
})

test('OdataNumber se tranforma a valor primitivo, a texto y a JSON y a filtro OData.', t => {
  const instance = new OdataNumber(1123456.789)

  t.looseEquals(
    instance,
    1123456.789,
    'Se transforma a su valor primitivo como el valor que representa.'
  )

  t.isEqual(
    `${instance}`,
    '1123456,789',
    'Se transforma a texto como el valor que representa transformado a texto.'
  )

  t.isEqual(
    JSON.stringify({ instance }),
    '{"instance":1123456.789}',
    'Se transforma a JSON como el valor que representa.'
  )

  t.isEqual(
    instance.toFilter(),
    '1123456.789',
    'Se transforma a valor de filtro OData'
  )

  t.end()
})

test('OdataNumber interpreta una número a partir de un texto.', t => {
  const instance = new OdataNumber(1337)

  const parsedDate = instance.parse('1.620.986.400,123')

  t.isEqual(
    parsedDate,
    1620986400.123,
    'El metodo parse por defecto interperta números.'
  )

  t.end()
})

test('OdataNumber se puede configurar con métodos de transformación.', t => {
  const stringify = value => `${value} FM`
  const parse = text => Number(text.replace(/ FM$/, ''))
  const formatify = value => {
    const numbers = String(value).split('')
      .map(digit => {
        switch (digit) {
          case '0': return 'cero'
          case '1': return 'uno'
          case '2': return 'dos'
          case '3': return 'tres'
          case '4': return 'cuatro'
          case '5': return 'cinco'
          case '6': return 'seis'
          case '7': return 'siete'
          case '8': return 'ocho'
          case '9': return 'nueve'
          default: return digit
        }
      })
      .join(' ')
    return `${numbers} FM`
  }
  const htmlify = value => `<span>${value} FM</span>`

  const instance = new OdataNumber(1234.5678, { stringify, parse, formatify, htmlify })

  t.isEqual(
    instance.stringify,
    stringify,
    'La propiedad "stringify" contiene el método para transformar a texto.'
  )

  t.isEqual(
    instance.parse,
    parse,
    'La propiedad "parse" contiene el método para interpretar un texto como un valor.'
  )

  t.isEqual(
    instance.formatify,
    formatify,
    'La propiedad "formatify" contiene el método para transformar a texto formateado.'
  )

  t.isEqual(
    instance.htmlify,
    htmlify,
    'La propiedad "htmlify" contiene el método para transformar a HTML.'
  )

  const otherInstance = new OdataNumber(1234.5678, { stringify })

  t.deepEqual(
    instance,
    otherInstance,
    'Las propiedades de los métodos de transformación no son enumerables.'
  )

  t.isEqual(
    `${instance}`,
    'uno dos tres cuatro . cinco seis siete ocho FM',
    'Al transformar a texto, se utiliza el metodo "formatify", si está definidio.'
  )

  instance.formatify = null

  t.isEqual(
    `${instance}`,
    '1234.5678 FM',
    'Al transformar a texto, se utiliza el metodo "stringify", si está definidio y "formatify" no.'
  )

  t.end()
})

test('Se puede clonar una instancia de OdataNumber usandola como valor de una nueva instancia.', t => {
  const primitive = new OdataNumber(123456, { formatify: value => `data -> ${value}` })
  const clone = new OdataNumber(primitive)

  t.equal(
    clone.value,
    123456,
    'El valor de las dos instancias es el mismo.'
  )

  t.equal(
    `${clone}`,
    'data -> 123456',
    'Los metodos de conversion tambien se copian.'
  )

  const alteredClone = new OdataNumber(primitive, { formatify: value => `data (${value})` })

  t.equal(
    `${alteredClone}`,
    'data (123456)',
    'Los metodos de conversion se pueden sobreescribir.'
  )

  t.end()
})

test('OdataNumber puede reemplazar propiedades de objetos.', t => {
  const data = {
    a: 1609455600000,
    b: 1620986400000,
    c: 3
  }

  const refernece = OdataNumber.replaceInData(data, { key: 'b' })

  t.isEqual(
    data,
    refernece,
    'El metodo replaceInData devuleve una referencia al objeto "data".'
  )

  t.ok(
    data.b instanceof OdataNumber,
    'El valor de la propiedad indentificada en "key" se convierte a OdataValue.'
  )

  t.isEqual(
    data.b.value,
    1620986400000,
    'El valor de la nueva instancia de OdataNumber es el valor que contenía la propiedad indentificada en "key".'
  )

  OdataNumber.replaceInData(
    data,
    { key: 'a' },
    { formatify: value => `--> ${value} <--` }
  )

  t.isEqual(
    `${data.a}`,
    '--> 1609455600000 <--',
    'Se pueden definir los conversores de la instancia en el reemplazo de datos.'
  )

  t.end()
})

test('Las transformaciones por defecto se pueden configurar.', t => {
  const instance = new OdataNumber(1234.56789, { useGrouping: true })

  t.isEqual(
    `${instance}`,
    '1.234,56789',
    'La propiedad "useGrouping" indica que los números se formatean con separadores de millar.'
  )

  instance.fractionDigits = 2

  t.isEqual(
    `${instance}`,
    '1.234,57',
    'La propiedad "fractionDigits" indica el número de dígitos decimales que deben mostrarse.'
  )

  const parsedValue = instance.parse('9.876,54321')

  t.isEqual(
    parsedValue,
    9876.54,
    'La propiedad "fractionDigits" indica el número de dígitos decimales que se tienen en cuenta al interpretar un texto.'
  )

  instance.value = 5
  instance.minimumIntegerDigits = 3

  t.isEqual(
    `${instance}`,
    '005,00',
    'La propiedad "minimumIntegerDigits" indica el número mínimo de dígitos enteros que deben mostrarse.'
  )

  t.end()
})

test('Si el valor de inicio no es un número se parsea con el metodo "parse".', t => {
  const instance = new OdataNumber('1.234,56')

  t.isEqual(
    instance.value,
    1234.56
  )

  t.end()
})
