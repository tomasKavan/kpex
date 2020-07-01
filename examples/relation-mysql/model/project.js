const kpex = require('../../../main.js')

module.export = kpex({
  name: 'Project',
  tableName: 'project',
  attributes: {
    id: { type: Number, isInt: true, autoIncrement: true },
    name: String,
    description: String,
    running: kpex.Type.BOOLEAN,
    manager: { type: Number, isInt: true, nullable: true },
  },
  primaryKey: 'id',
  associations: {
    manager: 'Employee',
  },
  collections: {
    projects: {
      model: 'Employee',
      relatedBy: {
        tableName: 'projet_employee',
        refKey: 'employee',
        myKey: 'project'
      }
    }
  }
})
