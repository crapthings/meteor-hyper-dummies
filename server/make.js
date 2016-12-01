import _ from 'lodash'

import { en as lingo } from 'lingo'

import traverse from 'traverse'

import isSingular from 'is-singular'

import jsonfile from 'jsonfile'

jsonfile.spaces = 4

function make(entities = {}, models = {}, options = {}, write = false) {

  const dataset = {}

  traverse(entities).forEach(function (entity) {

    if (_.isEmpty(this.key)) return

    const self = this
    const key = this.key
    self._singularizedKey = lingo.singularize(key)
    self._pluralizedKey = lingo.pluralize(self._singularizedKey)

    if (!_.includes(self.key, '___'))
      dataset[self._pluralizedKey] = dataset[self._pluralizedKey] || []

    if (models[self._singularizedKey]) {

      if (lingo.isSingular(self.key)) {

        self._datum = new models[self._singularizedKey]()

        if (self.parent._datum) {
          const refName = self.node.___ref ? self.node.___ref : self.parent._singularizedKey + 'Id'
          self._datum[refName] = self.parent._datum._id
        }

        dataset[self._pluralizedKey].push(self._datum)

      } else {

        const data = _.times(10, n => {
          const datum = new models[self._singularizedKey]()

          if (self.parent._data) {
            const refName = self.node.___ref ? self.node.___ref : self.parent._singularizedKey + 'Ids'
            const maxSampleSize = _.random(1, self.parent._data.length)
            datum[refName] = _(self.parent._data).map('_id').sampleSize(maxSampleSize).value()
          }

          return datum
        })

        self._data = data

        dataset[self._pluralizedKey] = _.concat(dataset[self._pluralizedKey], data)

      }

    }

  })

  if (write) {
    setTimeout(function () {
      const cwd = process.cwd()
      const folder = (Meteor.isDevelopment ? cwd.replace(/\/\.meteor.*/, '') : cwd) + '/.dummies/'
      _.forEach(dataset, (v, k) => {
        console.log(folder + k)
        jsonfile.writeFile(`${folder}${k}.json`, v)
      })
    }, 0)
  }

  return dataset

}

export default make
