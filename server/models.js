import faker from 'faker'

class Modal {
  constructor() {
    this._id = Random.id()
  }
}

class user extends Modal {
  constructor() {
    super()
    this.username = `用户 ${faker.internet.userName()}`
    this.age = _.random(18, 40)
  }
}

class organization extends Modal {
  constructor() {
    super()
    this.name = `公司 ${faker.company.companyName()}`
  }
}

class project extends Modal {
  constructor() {
    super()
    this.name = `项目 ${faker.lorem.words()}`
  }
}

class activity extends Modal {
  constructor() {
    super()
    this.name = `记录 ${faker.lorem.words()}`
  }
}

class achievement extends Modal {
  constructor() {
    super()
    this.name = `成果 ${faker.lorem.words()}`
  }
}

class conversion extends Modal {
  constructor() {
    super()
    this.name = `转化 ${faker.lorem.words()}`
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
