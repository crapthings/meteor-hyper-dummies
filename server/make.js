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

    if (_.includes(self.key, '___')) return true

    if (!models[self._sKey] && !models['___model']) {
      console.log(self._sKey, ' model not found, default one not found, skipped...')
      return
    }

    if (!models[self._sKey]) {
      console.log(self._sKey, ' not found, use ___model from models')
    }

    self._defaultRefName = self.parent._sKey + 'Id'

    dataset[self._pKey] = dataset[self._pKey] || []

    if (self.parent._data) {

      const parentData = self.parent._data

      if (is.string(self.node.___refMap)) {
        self._defaultRefName = self.node.___refMap
        self._defaultRefValue = self._defaultRefName
      }

      if (is.array(self.node.___refMap)) {
        self._defaultRefName = self.node.___refMap[0]
        self._defaultRefValue = self.node.___refMap[1] || self._defaultRefName
      }

      if (is.json(parentData)) {
        self._data = isSingular(key)
          ?
            function () {
              const data = getDefaultModel()
              data[self._defaultRefName] = self._defaultRefValue || parentData._id
              dataset[self._pKey].push(data)
              return data
            }()
          :
            function () {
              const data = _.times(options.defaultNodeSize, n => {
                const data = getDefaultModel()
                data[self._defaultRefName] = self._defaultRefValue || parentData._id
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
                const data = getDefaultModel()
                data[self._defaultRefName] = d[self._defaultRefValue] || d._id
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
                  const data = getDefaultModel()
                  data[self._defaultRefName] = d[self._defaultRefValue] || d._id
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
            const data = getDefaultModel()
            dataset[self._pKey].push(data)
            return data
          }()
        :
          function () {
            const data = _.times(options.defaultNodeSize, n => getDefaultModel())
            dataset[self._pKey] = _.concat(dataset[self._pKey], data)
            return data
          }()

    }

    function getDefaultModel() {
      return getModel(models[self._sKey] || models['___model'])
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
