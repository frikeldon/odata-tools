import test from 'tape'
import odataFilter from '../lib/filter.js'
import OdataValue from '../lib/value.js'

test('odataFilter formatea datos para consultas OData.', t => {
  t.equal(
    odataFilter(undefined),
    undefined,
    'Los valores indefinidos se devuelven sin tratar.'
  )

  t.equal(
    odataFilter(null),
    'null',
    'Los valores nulos se devuelven como texto.'
  )

  t.equal(
    odataFilter('cadena de texto'),
    'cadena de texto',
    'Las cadenas de texto se devuelven sin tratar.'
  )

  t.equal(
    odataFilter(123),
    '123',
    'Los numeros i los booleanos se devuelven convertidos a texto.'
  )

  t.equal(
    odataFilter(new Date(2021, 4, 14, 12)),
    'date(2021-05-14T10:00:00.000Z)',
    'Las fechas se devuelven en formato ISO.'
  )

  t.equal(
    odataFilter(new OdataValue('Here\'s "that".')),
    "'Here''s \"that\".'",
    'Los objetos ODataValue se convierten a valor de filtro OData.'
  )

  t.end()
})

test('odataFilter convierte una estrucrura JSON en un filtro ODATA.', t => {
  const filtro = odataFilter({
    and: [
      { eq: ['IDDOCTOR', 3] },
      { eq: ['PRIMERCOGNOM', '"Doe"'] },
      {
        or: [
          { gt: ['ULTIMAFACTURA', new Date(2021, 4, 1)] },
          { eq: ['ULTIMAFACTURA', null] }
        ]
      }
    ]
  })

  t.equal(
    filtro,
    '((IDDOCTOR eq 3) and (PRIMERCOGNOM eq "Doe") and ((ULTIMAFACTURA gt date(2021-04-30T22:00:00.000Z)) or (ULTIMAFACTURA eq null)))'
  )

  t.end()
})

test('La estructura JSON se puede combinar con filtros escritos como texto.', t => {
  const filtro = odataFilter({
    and: [
      '(IDDOCTOR eq 3 and PRIMERCOGNOM eq "Doe")',
      {
        or: [
          { gt: ['ULTIMAFACTURA', new Date(2021, 4, 1)] },
          { eq: ['ULTIMAFACTURA', null] }
        ]
      }
    ]
  })

  t.equal(
    filtro,
    '((IDDOCTOR eq 3 and PRIMERCOGNOM eq "Doe") and ((ULTIMAFACTURA gt date(2021-04-30T22:00:00.000Z)) or (ULTIMAFACTURA eq null)))'
  )

  t.end()
})

test('odataFilter evalua funciones.', t => {
  let actual = 0
  const filtro = { eq: ['value', () => actual++] }

  t.equal(odataFilter(filtro), '(value eq 0)')
  t.equal(odataFilter(filtro), '(value eq 1)')
  t.equal(odataFilter(filtro), '(value eq 2)')

  t.end()
})

test('Las funciones evaluadas pueden devolver estructuras JSON.', t => {
  const filterParts = [{
    and: [
      { eq: ['IDDOCTOR', 3] },
      { eq: ['PRIMERCOGNOM', '"Doe"'] }
    ]
  }, {
    and: [
      { eq: ['IDDOCTOR', 2] }
    ]
  }, {
    and: [
      { eq: ['PRIMERCOGNOM', '"Smith"'] }
    ]
  }]
  let filterIndex = 0

  const filtro = {
    and: [
      () => filterParts[filterIndex++],
      {
        or: [
          { gt: ['ULTIMAFACTURA', new Date(2021, 4, 1)] },
          { eq: ['ULTIMAFACTURA', null] }
        ]
      }
    ]
  }

  t.equal(odataFilter(filtro), '(((IDDOCTOR eq 3) and (PRIMERCOGNOM eq "Doe")) and ((ULTIMAFACTURA gt date(2021-04-30T22:00:00.000Z)) or (ULTIMAFACTURA eq null)))')
  t.equal(odataFilter(filtro), '(((IDDOCTOR eq 2)) and ((ULTIMAFACTURA gt date(2021-04-30T22:00:00.000Z)) or (ULTIMAFACTURA eq null)))')
  t.equal(odataFilter(filtro), '(((PRIMERCOGNOM eq "Smith")) and ((ULTIMAFACTURA gt date(2021-04-30T22:00:00.000Z)) or (ULTIMAFACTURA eq null)))')

  t.end()
})

test('odataFilter acepta funciones OData.', t => {
  const filtro = {
    and: [
      { substringof: ['"Doe"', 'PRIMERCOGNOM'] },
      {
        eq: [
          { month: ['ULTIMAFACTURA'] },
          1
        ]
      }
    ]
  }

  t.equal(
    odataFilter(filtro),
    '(substringof("Doe", PRIMERCOGNOM) and (month(ULTIMAFACTURA) eq 1))'
  )

  t.end()
})

test('odataFilter acepta operaciones OData 4.0.', t => {
  const filtro = {
    in: [
      'Name',
      '"Milk"',
      '"Cheese"',
      '"Tomatoes"'
    ]
  }

  t.equal(
    odataFilter(filtro),
    '(Name in ("Milk", "Cheese", "Tomatoes"))'
  )

  t.end()
})
