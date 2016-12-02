import _ from 'lodash'

import { en as lingo } from 'lingo'

import traverse from 'traverse'

import jsonfile from 'jsonfile'

import is from 'is_js'

jsonfile.spaces = 4

function make(entities = {}, models = {}, options = {}, write = false) {

  const dataset = {}

  options = _.defaults(options, {
    defaultNodeSize: 3,
  })

  traverse(entities).forEach(function (entity) {

    if (_.isEmpty(this.key)) return

    const self = this

    const key = self.key
    self._sKey = singularize(key)
    self._pKey = pluralize(self._sKey)

    if (_.includes(self.key, '___')) return

    if (!models[self._sKey]) {
      console.log(self._sKey, ' not found, skipped...')
      return
    }

    dataset[self._pKey] = dataset[self._pKey] || []

    if (self.parent._data) {

      const parentData = self.parent._data
      const defaultRefName = self.node.___refName || self.parent._sKey + 'Id'

      if (is.json(parentData)) {
        self._data = isSingular(key)
          ?
            function () {
              const data = getModel(models[self._sKey])
              data[defaultRefName] = self.node.___refKey || parentData._id
              dataset[self._pKey].push(data)
              return data
            }()
          :
            function () {
              const data = _.times(options.defaultNodeSize, n => {
                const data = getModel(models[self._sKey])
                data[defaultRefName] = self.node.___refKey || parentData._id
                return data
              })
              dataset[self._pKey] = _.concat(dataset[self._pKey], data)

              return data
            }()
      }

      if (is.array(parentData)) {

        self._data = isSingular(key)
          ?
            function () {
              const data = _.map(parentData, d => {
                const data = getModel(models[self._sKey])
                data[defaultRefName] = d[self.node.___refKey] || d._id
                return data
              })
              dataset[self._pKey] = _.concat(dataset[self._pKey], data)
              return data
            }()
          :
            function () {
              const data = _(parentData)
              .map(d => {
                return _.times(options.defaultNodeSize, n => {
                  const data = getModel(models[self._sKey])
                  data[defaultRefName] = d[self.node.___refKey] || d._id
                  return data
                })
              })
              .flatten()
              .value()
              dataset[self._pKey] = _.concat(dataset[self._pKey], data)
              return data
            }()
      }

    } else {

      self._data = isSingular(key)
        ?
          function () {
            const data = getModel(models[self._sKey])
            dataset[self._pKey].push(data)
            return data
          }()
        :
          function () {
            const data = _.times(options.defaultNodeSize, n => getModel(models[self._sKey]))
            dataset[self._pKey] = _.concat(dataset[self._pKey], data)
            return data
          }()

    }

  })

  const _dataset = _(dataset).omitBy(_.isEmpty).value()

  if (_.isEmpty(_dataset)) return

  if (write) writeFiles(_dataset)

  return _dataset

}

function getModel(model) {
  return new model()
}

function getNodeRefName(node) {
  if (_.isEmpty(node)) return

  if (node.___ref) {
    return node.___ref
  }

  return isSingular(node.key) ? 'Id' : 'Ids'
}

function isSingular(string) {
  return lingo.isSingular(string)
}

function singularize(string) {
  return lingo.singularize(string)
}

function pluralize(string) {
  return lingo.pluralize(singularize(string))
}

// save content to files
function writeFiles(dataset) {
  const cwd = process.cwd()
  const folder = (Meteor.isDevelopment ? cwd.replace(/\/\.meteor.*/, '') : cwd) + '/.dummies/'
  _.forEach(dataset, (v, k) => {
    console.log('write file to ', folder + k)
    jsonfile.writeFile(`${folder}${k}.json`, v)
  })
}

export default make
