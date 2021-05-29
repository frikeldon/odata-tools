import test from 'tape'
import OdataDate from '../lib/date.js'

test('OdataDate representa una fecha.', t => {
  const instance = new OdataDate(1620986400000)

  t.isEquivalent(
    instance.value,
    new Date(1620986400000),
    'La propiedad "value" contiene esa fecha.'
  )

  t.end()
})

test('OdataDate representa un tipo de dato.', t => {
  const instance = new OdataDate(1620986400000, { type: 'date' })

  t.isEqual(
    instance.type,
    'date',
    'La propiedad "type" contiene ese tipo de dato.'
  )

  const otherInstance = new OdataDate(1620986400000, { type: 'dateTime' })

  t.deepEqual(
    instance,
    otherInstance,
    'La propiedad "type" no es enumerable.'
  )

  t.end()
})

test('OdataDate se tranforma a valor primitivo, a texto y a JSON y a filtro OData.', t => {
  const instance = new OdataDate(1620986400000)

  t.looseEquals(
    instance,
    1620986400000,
    'Se transforma a su valor primitivo como la fecha que representa.'
  )

  t.isEqual(
    `${instance}`,
    '14/05/2021',
    'Se transforma a texto como la fecha que representa transformada a texto.'
  )

  t.isEqual(
    JSON.stringify({ instance }),
    '{"instance":"2021-05-14T10:00:00.000Z"}',
    'Se transforma a JSON como la fecha que representa en formato ISO.'
  )

  t.isEqual(
    instance.toFilter(),
    'date(2021-05-14T10:00:00.000Z)',
    'Se transforma a valor de filtro OData'
  )

  t.end()
})

test('OdataDate interpreta una fecha a partir de un texto.', t => {
  const instance = new OdataDate(1620986400000)

  const parsedDate = instance.parse('1/1/2000')

  t.isEquivalent(
    parsedDate,
    new Date(2000, 0, 1),
    'El metodo parse por defecto interperta fechas.'
  )

  t.end()
})

test('OdataDate se puede configurar con métodos de transformación.', t => {
  const stringify = value => value.toDateString()
  const parse = text => new Date(Date.parse(text))
  const formatify = value => value.toISOString()
  const htmlify = value => `<span>${formatify(value)}</span>`
  const instance = new OdataDate(
    new Date(2021, 4, 14),
    { stringify, parse, formatify, htmlify }
  )

  t.isEqual(
    instance.stringify,
    stringify,
    'La propiedad "stringify" contiene el método para transformar a texto.'
  )

  t.isEqual(
    instance.parse,
    parse,
    'La propiedad "parse" contiene el método para interpretar un texto como una fecha.'
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

  const otherInstance = new OdataDate(
    new Date(2021, 4, 14),
    { stringify }
  )

  t.deepEqual(
    instance,
    otherInstance,
    'Las propiedades de los métodos de transformación no son enumerables.'
  )

  t.isEqual(
    `${instance}`,
    '2021-05-13T22:00:00.000Z',
    'Al transformar a texto, se utiliza el metodo "formarify", si está definidio.'
  )

  t.isEqual(
    `${otherInstance}`,
    'Fri May 14 2021',
    'Al transformar a texto, se utiliza el metodo "stringify", si está definidio y "formarify" no.'
  )

  t.end()
})

test('Se puede clonar una instancia de OdataDate usandola como valor de una nueva instancia.', t => {
  const value = new Date(2021, 4, 14, 12)
  const primitive = new OdataDate(
    value,
    { stringify: value => value.toDateString() }
  )
  const clone = new OdataDate(primitive)

  t.isEquivalent(
    clone.value,
    new Date(2021, 4, 14, 12),
    'El valor de las dos instancias es el mismo.'
  )

  t.equal(
    `${clone}`,
    'Fri May 14 2021',
    'Los metodos de conversion tambien se copian.'
  )

  const alteredClone = new OdataDate(
    primitive,
    { stringify: value => value.toISOString() }
  )

  t.equal(
    `${alteredClone}`,
    '2021-05-14T10:00:00.000Z',
    'Los metodos de conversion se pueden sobreescribir.'
  )

  t.end()
})

test('OdataDate puede reemplazar propiedades de objetos.', t => {
  const data = {
    a: 1609455600000,
    b: 1620986400000,
    c: 3
  }

  const refernece = OdataDate.replaceInData(data, { key: 'b' })

  t.isEqual(
    data,
    refernece,
    'El metodo replaceInData devuleve una referencia al objeto "data".'
  )

  t.ok(
    data.b instanceof OdataDate,
    'El valor de la propiedad indentificada en "key" se convierte a OdataDate.'
  )

  t.isEquivalent(
    data.b.value,
    new Date(1620986400000),
    'El valor de la nueva instancia de OdataDate es el valor que contenía la propiedad indentificada en "key".'
  )

  OdataDate.replaceInData(
    data,
    { key: 'a' },
    { stringify: value => value.toISOString() }
  )

  t.isEqual(
    `${data.a}`,
    '2020-12-31T23:00:00.000Z',
    'Se pueden definir los conversores de la instancia en el reemplazo de datos.'
  )

  t.end()
})

test('Las transformaciones por defecto se pueden configurar.', t => {
  const instance = new OdataDate(1620986400000, { hasTime: true })

  t.isEqual(
    instance.hasTime,
    true,
    'La propiedad "hasTime" indica que el campo incluye hora y minutos.'
  )

  t.isEqual(
    `${instance}`,
    '14/05/2021 12:00',
    'Se transforma a texto como la fecha, hora y minutos que representa transformado a texto.'
  )

  const parsedDate = instance.parse('14/05/2021 12:00')

  t.isEqual(
    parsedDate.getTime(),
    1620986400000,
    'Al interpretar de un texto se espera que tenga hora y minutos.'
  )

  instance.hasTime = false

  const parsedDateWithoutTime = instance.parse('14/05/2021 12:00')

  t.isEquivalent(
    parsedDateWithoutTime,
    new Date(2021, 4, 14),
    'Al interpretar de un texto sin fecha y hora, estas se ignoran.'
  )

  t.end()
})
