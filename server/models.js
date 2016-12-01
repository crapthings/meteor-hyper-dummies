import faker from 'faker'

class Modal {
  constructor() {
    this._id = Random.id()
  }
}

class user extends Modal {
  constructor() {
    super()
    this.username = faker.internet.userName()
    this.age = _.random(18, 40)
  }
}

class organization extends Modal {
  constructor() {
    super()
    this.name = faker.company.companyName()
  }
}

class project extends Modal {
  constructor() {
    super()
    this.name = faker.lorem.words()
  }
}

class activity extends Modal {
  constructor() {
    super()
    this.name = faker.lorem.words()
  }
}

class achievement extends Modal {
  constructor() {
    super()
    this.name = faker.lorem.words()
  }
}

class conversion extends Modal {
  constructor() {
    super()
    this.name = faker.lorem.words()
  }
}

const models = {
  user,
  organization,
  project,
  activity,
  achievement,
  conversion,
}

export default models
