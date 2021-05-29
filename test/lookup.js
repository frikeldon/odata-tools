import test from 'tape'
import OdataLookup from '../lib/lookup.js'

test('OdataLookup representa un valor con un texto asociado.', t => {
  const instance = new OdataLookup(42, 'answer')

  t.isEqual(
    instance.value,
    42,
    'La propiedad "value" contiene ese valor.'
  )

  t.isEqual(
    instance.text,
    'answer',
    'La propiedad "text" contiene el texto asociado.'
  )

  const otherInstance = new OdataLookup(42, 'The Answer')

  t.deepEqual(
    instance,
    otherInstance,
    'La propiedad "text" no es enumerable.'
  )

  t.end()
})

test('OdataLookup representa un tipo de dato.', t => {
  const instance = new OdataLookup(1, 'data', { type: 'lookup' })

  t.isEqual(
    instance.type,
    'lookup',
    'La propiedad "type" contiene ese tipo de dato.'
  )

  const otherInstance = new OdataLookup(1, 'data', { type: 'customLookup' })

  t.deepEqual(
    instance,
    otherInstance,
    'La propiedad "type" no es enumerable.'
  )

  t.end()
})

test('OdataLookup se tranforma a valor primitivo, a texto y a JSON y a filtro OData.', t => {
  const instance = new OdataLookup(42, 'answer')

  t.looseEquals(
    instance,
    42,
    'Se transforma a su valor primitivo como el valor que representa.'
  )

  t.isEqual(
    `${instance}`,
    'answer',
    'Se transforma a texto como el texto asociado al valor que representa.'
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

test('OdataLookup se puede configurar con métodos de transformación.', t => {
  const formatify = value => isNaN(value) ? '' : `Id: ${value}`

  const instance = new OdataLookup(1234, 'password', { formatify })

  t.isEqual(instance.toString(), 'Id: 1234')

  t.end()
})

test('Se puede clonar una instancia de OdataLookup usandola como valor de una nueva instancia.', t => {
  const value = { num: 42 }
  const primitive = new OdataLookup(value, 'answer')
  const clone = new OdataLookup(primitive)

  t.equal(
    clone.value,
    value,
    'El valor de las dos instancias es el mismo.'
  )

  t.equal(
    clone.text,
    'answer',
    'El valor del texto asociado es el mismo.'
  )

  const alteredClone = new OdataLookup(primitive, 'The Answer')

  t.equal(
    alteredClone.text,
    'The Answer',
    'Se puede asignar un nuevo texto asociado a la nueva instancia.'
  )

  t.end()
})

test('OdataLookup puede reemplazar propiedades de objetos.', t => {
  const value = { num: 2 }
  const data = {
    a: 1,
    b: value,
    c: 3,
    options: {
      one: 'First',
      two: 'Second'
    }
  }

  const refernece = OdataLookup.replaceInData(data, { key: 'b', expand: 'options', expandText: 'two' })

  t.isEqual(
    data,
    refernece,
    'El metodo replaceInData devuleve una referencia al objeto "data".'
  )

  t.ok(
    data.b instanceof OdataLookup,
    'El valor de la propiedad indentificada en "key" se convierte a OdataLookup.'
  )

  t.isEqual(
    data.b.value,
    value,
    'El valor de la nueva instancia de OdataLookup es el valor que contenía la propiedad indentificada en "key".'
  )

  t.isEqual(
    data.b.text,
    'Second',
    'El texto asociado al valor de la nueva instancia de OdataLookup es el valor que contenía la propiedad indentificada en "expand"->"expandText".'
  )

  OdataLookup.replaceInData(
    data,
    { key: 'a', expand: 'options', expandText: 'one' },
    { formatify (value) { return `(${this.value}) ${this.text}` } }
  )

  t.isEqual(
    `${data.a}`,
    '(1) First',
    'Se pueden definir los conversores de la instancia en el reemplazo de datos.'
  )

  t.end()
})

test('El constructor de OdataLookup permite omitir el texto, manteniendo la firma de OdataValue.', t => {
  const instance = new OdataLookup(42, { formatify: value => `(${value})` })

  t.isEqual(
    `${instance}`,
    '(42)',
    'El segundo parametro son las opciones.'
  )

  const clone = new OdataLookup(instance, { formatify: value => `[${value}]` })

  t.isEqual(
    `${clone}`,
    '[42]',
    'Al clonar, se mantiene el comportamiento.'
  )

  t.end()
})
