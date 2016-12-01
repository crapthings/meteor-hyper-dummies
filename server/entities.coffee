import make from './make'

import models from './models'

entities =
  user:
    organization:
      ___ref: 'ownerId' # need better name
      users:
        organizations:
          users:
            projects:
              activities: {},
              achievements: {},
              conversions: {},
            achievements: {},
            conversions: {},

dataset = make entities, models

console.log(JSON.stringify entities, null ,2)

console.log(JSON.stringify dataset, null ,2)
