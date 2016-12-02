import faker from 'faker'
import make from './make'

entities =
  categories:
    subcategories:
      authors:
        books:
          orders: {}

class Model
  constructor: ->
    @_id = Random.id()
    @name = faker.lorem.words()
    @createdAt = faker.date.past()

models =
  ___model: class model extends Model
    constructor: ->
      super

  category: class model extends Model
    constructor: ->
      super

dataset = make entities, models, {}, true

console.log(JSON.stringify entities, null ,2)

console.log(JSON.stringify dataset, null ,2)
