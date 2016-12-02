import make from './make'

import models from './models'

entities =
  user:
    organization:
      users:
        organizations:
          users:
            projects:
              activities: {}
              achievements: {}
              conversions: {}
            achievements: {}
            conversions: {}

dataset = make entities, models, {}, true

# console.log(JSON.stringify entities, null ,2)

# console.log(JSON.stringify dataset, null ,2)
