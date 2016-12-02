# meteor-hyper-dummies

## document

make(entitiesTree = {}, entitiesModels = [], options = {}, write = false)

> each node of tree will find model by node's key

coffeescript

> ref key is based on parent node's singularized key name by default

```
user # make one user
  organizations # make many belong to parent, organization = { userId: id }
    users # make many for each of parent, user = { organizationId: id }
      projects:
        ___refName: 'ownerId' # replace default ref key
        ___refKey: 'organizationId' # use parent user's organizationId as value
        activities # make many for parent project, activity = { projectId: id }
        achievements # make many for parent project, achievement = { projectId: id }
```

more features WIP
