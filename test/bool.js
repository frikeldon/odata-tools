import test from 'tape'
import OdataBool from '../lib/bool.js'

test('OdataBool representa un valor.', t => {
  const instance = new OdataBool(false)

  t.isEqual(
    instance.value,
    false,
    'La propiedad "value" contiene ese valor.'
  )

  t.end()
})

test('OdataBool representa un tipo de dato.', t => {
  const instance = new OdataBool(false, { type: 'bool' })

  t.isEqual(
    instance.type,
    'bool',
    'La propiedad "type" contiene ese tipo de dato.'
  )

  const otherInstance = new OdataBool(false, { type: 'boolIcon' })

  t.deepEqual(
    instance,
    otherInstance,
    'La propiedad "type" no es enumerable.'
  )

  t.end()
})

test('OdataBool se tranforma a valor primitivo, a texto y a JSON y a filtro OData.', t => {
  const instance = new OdataBool(false)

  t.looseEquals(
    instance,
    false,
    'Se transforma a su valor primitivo como el valor que representa.'
  )

  t.isEqual(
    `${instance}`,
    'No',
    'Se transforma a texto como el valor que representa transformado a texto.'
  )

  t.isEqual(
    JSON.stringify({ instance }),
    '{"instance":false}',
    'Se transforma a JSON como el valor que representa.'
  )

  t.isEqual(
    instance.toFilter(),
    'false',
    'Se transforma a valor de filtro OData'
  )

  instance.toJsonAsInt = true
  const otherInstance = new OdataBool(true, { toJsonAsInt: true })

  t.isEqual(
    JSON.stringify({ instance, otherInstance }),
    '{"instance":0,"otherInstance":1}',
    'Si "toJsonAsInt" esta configurado se transorma a JSON como entero.'
  )

  t.isEqual(
    instance.toFilter(),
    '0',
    'Si "toJsonAsInt" esta configurado se transorma a valor de filtro OData como enter.'
  )

  t.end()
})

test('OdataBool interpreta una fecha a partir de un texto.', t => {
  const instance = new OdataBool(true)

  const parsedDate = instance.parse('Si')

  t.isEqual(
    parsedDate,
    true,
    'El metodo parse por defecto interperta fechas.'
  )

  t.end()
})

test('OdataBool se puede configurar con métodos de transformación.', t => {
  const stringify = value => value ? 'Ok' : 'Ko'
  const parse = text => text === 'Ok'
  const formatify = value => value ? '¡¡Ok!!' : '..Ko..'
  const htmlify = value => `<span>${value ? 'Ok' : 'Ko'}</span>`

  const instance = new OdataBool(true, { stringify, parse, formatify, htmlify })

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

  const otherInstance = new OdataBool(true, { stringify })

  t.deepEqual(
    instance,
    otherInstance,
    'Las propiedades de los métodos de transformación no son enumerables.'
  )

  t.isEqual(
    `${instance}`,
    '¡¡Ok!!',
    'Al transformar a texto, se utiliza el metodo "formarify", si está definidio.'
  )

  t.isEqual(
    `${otherInstance}`,
    'Ok',
    'Al transformar a texto, se utiliza el metodo "stringify", si está definidio y "formarify" no.'
  )

  t.end()
})

test('Se puede clonar una instancia de OdataBool usandola como valor de una nueva instancia.', t => {
  const primitive = new OdataBool(true, { stringify: value => value ? 'Ok' : 'Ko' })
  const clone = new OdataBool(primitive)

  t.equal(
    clone.value,
    true,
    'El valor de las dos instancias es estrictamente el mismo.'
  )

  t.equal(
    `${clone}`,
    'Ok',
    'Los metodos de conversion tambien se copian.'
  )

  const alteredClone = new OdataBool(primitive, { stringify: value => value ? 'X' : '_' })

  t.equal(
    `${alteredClone}`,
    'X',
    'Los metodos de conversion se pueden sobreescribir.'
  )

  t.end()
})

test('OdataBool puede reemplazar propiedades de objetos.', t => {
  const data = {
    a: false,
    b: true,
    c: 3
  }

  const refernece = OdataBool.replaceInData(data, { key: 'b' })

  t.isEqual(
    data,
    refernece,
    'El metodo replaceInData devuleve una referencia al objeto "data".'
  )

  t.ok(
    data.b instanceof OdataBool,
    'El valor de la propiedad indentificada en "key" se convierte a OdataBool.'
  )

  t.isEqual(
    data.b.value,
    true,
    'El valor de la nueva instancia de OdataBool es el valor que contenía la propiedad indentificada en "key".'
  )

  OdataBool.replaceInData(
    data,
    { key: 'a' },
    { stringify: value => `--> ${value ? 'Sí' : 'No'} <--` }
  )

  t.isEqual(
    `${data.a}`,
    '--> No <--',
    'Se pueden definir los conversores de la instancia en el reemplazo de datos.'
  )

  t.end()
})
