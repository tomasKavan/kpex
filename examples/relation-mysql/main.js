/*!
 * kpex
 * Copyright(c) 2020 Tomas Kavan
 * BSD 2-Clause Licensed
 */

'use strict'

/**
 * Importing kpex module
 */
const kpex = require('../../main.js')

/**
 * Configuration of kpex module. See employee.sql to find out how
 * to create the database. If you create something differently, feel
 * free to adjust following configuration.
 */
const dsConfig = {
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'kpexreltest',
    password: 'kpex',
    database: 'kpex_rel_test'
  }
}

kpex.configure(dsConfig)

/**
 * Creating models from schema
 */
const Employee = require('./model/employee.js')
const Project = require('./model/project.js')

/**
 * Wait until kpex is ready (model schema vas validated againts datastore)
 * and play with db entries.
 */
kpex.whenReady()
.then(async () => {
  // Create new employee
  const john = await Employee.create({
    name: 'John',
    surname: 'Doe',
    position: 'copywriter'
  })
  console.log(`New employee with id: \n ${john}`)

  // Create another employee
  const mark = await Employee.create({
    name: 'Mark',
    surname: 'Monroe',
    position: 'marketing manager'
  })
  console.log(`New employee with id: \n ${mark}`)

  // Assign Mark as John's boss
  await Employee.update(john.id, {
    line_manager: mark
  })
  console.log(`Mark is John's boss`)

  // Create new project
  const companyWeb = await Project.create({
    name: 'Company web page',
    description: 'New awesome web presentation for our company.',
    project_manager: mark
  })
  console.log(`New project with id: \n ${companyWeb}`)

  // Create another employee
  const jude = await Employee.create({
    name: 'Jude',
    surname: 'Del Mar',
    position: 'graphic designer',
    line_manager: mark
  })
  console.log(`New employee with id: \n ${jude}`)

  // Add Mark and Jude into the comany web project
  await Project.collection('employees').add(companyWeb, [jude, john])

  // List project with populated employees collection and manager
  // association
  const project = await Project.findOne(companyWeb, 'manager|employees')
  console.log(`Project in DB: \n ${project}`)

  // List all employees
  const employees = await Employee.find(null, 'projects|line_manager')
  console.log(`Employees in DB: \n ${employees}`)
})
