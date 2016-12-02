import _ from 'lodash'

import { en as lingo } from 'lingo'

import traverse from 'traverse'

import jsonfile from 'jsonfile'

import is from 'is_js'

jsonfile.spaces = 4

function make(entities = {}, models = {}, options = {}, write = false) {

  const dataset = {}

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

    // console.log('上层有数据 ', this.path, typeof self.parent._data, self.parent._data)

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
              const data = _.times(3, n => {
                const data = getModel(models[self._sKey])
                data[defaultRefName] = self.node.___refKey || parentData._id
                return data
              })
              dataset[self._pKey] = _.concat(dataset[self._pKey], data)

              return data
            }()
      }

      if (is.array(parentData)) {

        // console.log(JSON.stringify(parentData, null, 4))

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
                return _.times(3, n => {
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
      // console.log('why', this.key, this.path, this.parent.key)
      self._data = isSingular(key)
        ?
          function () {
            const data = getModel(models[self._sKey])
            dataset[self._pKey].push(data)
            return data
          }()
        :
          function () {
            const data = _.times(3, n => getModel(models[self._sKey]))
            dataset[self._pKey] = _.concat(dataset[self._pKey], data)
            return data
          }()

    }

    // if (parentData._id) {

    //   const refNameSuffix = getNodeRefName(parent)
    //   const refName = `${isSingular(parentSKey) ? parentSKey : parentPKey}${refNameSuffix}`


    // }

    // if (_.isArray(parentData)) {
    //   console.log(key, ' isArray')
    //   const refNameSuffix = getNodeRefName(parent)
    //   const refName = `${isSingular(parentSKey) ? parentSKey : parentPKey}${refNameSuffix}`


    // }

  })

  const _dataset = _(dataset).omitBy(_.isEmpty).value()

  if (_.isEmpty(_dataset)) return

  if (write) writeFiles(_dataset)

  return _dataset

}

function attachRef(model, ref) {

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
