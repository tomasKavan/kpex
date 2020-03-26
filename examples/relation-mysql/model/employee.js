import kpex from 'kpex'

module.export = kpex({
  name: 'Employee',
  tableName: 'employee',
  attributes: {
    id: { type: Number, isInt: true, autoIncrement: true },
    name: String,
    surname: String,
    position: String,
    line_manager: { type: Number, isInt: true, nullable: true },
  },
  primaryKey: 'id',
  associations: {
    line_manager: 'Employee',
  },
  collections: {
    managed_projects: 'Project:manager',
    projects: {
      model: 'Project',
      relatedBy: {
        tableName: 'projet_employee',
        refKey: 'project',
        myKey: 'employee'
      }
    }
  }
})
