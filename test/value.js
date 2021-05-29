import test from 'tape'
import OdataValue from '../lib/value.js'

test('OdataValue representa un valor.', t => {
  const value = { text: 'data', num: 1337 }
  const instance = new OdataValue(value)

  t.isEqual(
    instance.value,
    value,
    'La propiedad "value" contiene ese valor.'
  )

  t.end()
})

test('OdataValue representa un tipo de dato.', t => {
  const instance = new OdataValue('data', { type: 'text' })

  t.isEqual(
    instance.type,
    'text',
    'La propiedad "type" contiene ese tipo de dato.'
  )

  const otherInstance = new OdataValue('data', { type: 'formatedText' })

  t.deepEqual(
    instance,
    otherInstance,
    'La propiedad "type" no es enumerable.'
  )

  t.end()
})

test('OdataValue se tranforma a valor primitivo, a texto, a JSON y a filtro OData.', t => {
  const instance = new OdataValue(42)

  t.looseEquals(
    instance,
    42,
    'Se transforma a su valor primitivo como el valor que representa.'
  )

  t.isEqual(
    `${instance}`,
    '42',
    'Se transforma a texto como el valor que representa transformado a texto.'
  )

  t.isEqual(
    JSON.stringify({ instance }),
    '{"instance":42}',
    'Se transforma a JSON como el valor que representa.'
  )

  t.isEqual(
    instance.toFilter(),
    '42',
    'Se transforma a valor de filtro OData'
  )

  t.end()
})

test('OdataValue se puede configurar con métodos de transformación.', t => {
  const stringify = value => isNaN(value) ? '' : String(value).replace('.', ',')
  const parse = text => Number(text?.replace(',', '.'))
  const formatify = value => isNaN(value)
    ? ''
    : Number(value).toLocaleString('ca-ES', {
      style: 'decimal',
      useGrouping: true,
      maximumFractionDigits: 2
    })
  const htmlify = value => `<span>${value}</span>`

  const instance = new OdataValue(1234.5678, { stringify, parse, formatify, htmlify })

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

  const otherInstance = new OdataValue(1234.5678, { stringify })

  t.deepEqual(
    instance,
    otherInstance,
    'Las propiedades de los métodos de transformación no son enumerables.'
  )

  t.isEqual(
    `${instance}`,
    '1.234,57',
    'Al transformar a texto, se utiliza el metodo "formarify", si está definidio.'
  )

  t.isEqual(
    `${otherInstance}`,
    '1234,5678',
    'Al transformar a texto, se utiliza el metodo "stringify", si está definidio y "formarify" no.'
  )

  t.end()
})

test('Se puede clonar una instancia de OdataValue usandola como valor de una nueva instancia.', t => {
  const value = { text: 'data', num: 1337 }
  const primitive = new OdataValue(value, { stringify: value => `${value.text} -> ${value.num}` })
  const clone = new OdataValue(primitive)

  t.equal(
    clone.value,
    value,
    'El valor de las dos instancias es estrictamente el mismo.'
  )

  t.equal(
    `${clone}`,
    'data -> 1337',
    'Los metodos de conversion tambien se copian.'
  )

  const alteredClone = new OdataValue(primitive, { stringify: value => `${value.text} (${value.num})` })

  t.equal(
    `${alteredClone}`,
    'data (1337)',
    'Los metodos de conversion se pueden sobreescribir.'
  )

  t.end()
})

test('OdataValue puede reemplazar propiedades de objetos.', t => {
  const value = { num: 2 }
  const data = {
    a: 1,
    b: value,
    c: 3
  }

  const refernece = OdataValue.replaceInData(data, { key: 'b' })

  t.isEqual(
    data,
    refernece,
    'El metodo replaceInData devuleve una referencia al objeto "data".'
  )

  t.ok(
    data.b instanceof OdataValue,
    'El valor de la propiedad indentificada en "key" se convierte a OdataValue.'
  )

  t.isEqual(
    data.b.value,
    value,
    'El valor de la nueva instancia de OdataValue es el valor que contenía la propiedad indentificada en "key".'
  )

  OdataValue.replaceInData(
    data,
    { key: 'a' },
    { stringify: value => `--> ${value} <--` }
  )

  t.isEqual(
    `${data.a}`,
    '--> 1 <--',
    'Se pueden definir los conversores de la instancia en el reemplazo de datos.'
  )

  t.end()
})

test('El valor de filtro OData formatea los tipos de valores.', t => {
  t.isEqual(
    (new OdataValue(new Date(2021, 4, 14, 12))).toFilter(),
    'date(2021-05-14T10:00:00.000Z)',
    'Las fechas se devuelven en formato ISO.'
  )

  t.isEqual(
    (new OdataValue('Hello World!')).toFilter(),
    "'Hello World!'",
    'Las cadenas de texto se devuelven entre comillas simples.'
  )

  t.isEqual(
    (new OdataValue("I'm a hero!")).toFilter(),
    '"I\'m a hero!"',
    'Las cadenas de texto que contienen comillas simples se devuelven entre comillas dobles.'
  )

  t.isEqual(
    (new OdataValue('I\'m a "hero"')).toFilter(),
    "'I''m a \"hero\"'",
    'Las cadenas de texto que contienen comillas simples y dobles se devuelven entre comillas simples con las comillas simples del texto escapdas.'
  )

  t.end()
})

test('OdataValue interpreta un valor de filtro OData.', t => {
  t.isEquivalent(
    OdataValue.fromFilter('date(2021-05-14T10:00:00.000Z)').value,
    new Date(2021, 4, 14, 12),
    'Interpreta valores de tipo fecha.'
  )

  t.isEqual(
    OdataValue.fromFilter("'Hello World!'").value,
    'Hello World!',
    'Se eliminan las comillas simples que envuelven las cadenas de texto.'
  )

  t.isEqual(
    OdataValue.fromFilter('"I\'m a hero!"').value,
    "I'm a hero!",
    'Se eliminan las comillas dobles que envuelven las cadenas de texto.'
  )

  t.isEqual(
    OdataValue.fromFilter("'I''m a \"hero\"'").value,
    'I\'m a "hero"',
    'Al eliminar las comillas simples, se simplifican las comillas duplicadas.'
  )

  t.end()
})
