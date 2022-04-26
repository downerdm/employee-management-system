const inquirer = require('inquirer');
const mysql = require('mysql2');
const cTable = require('console.table');
const util = require('util');

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      // MySQL username,
      user: 'root',
      // TODO: Add MySQL password here
      password: 'root1',
      database: 'tracker_db'
    },
    console.log(`Connected to the tracker_db database.`)
  );

  db.connect(function(err) {
    if (err) throw err;
    console.log("Connected");
    getListResponse();
  })
  const trackerList = [
    {
        type: 'list',
        message: 'What would you like to do?',
        name: 'trackerList',
        choices: ['View all departments', 'View all roles', 'View all employees', 'Add a department', 'Add a role', 'Add an employee', 'Update an employee role', 'Quit'],
      }];

      async function getListResponse () {
        await inquirer.prompt(trackerList).then(data => {
          if (data.trackerList === 'View all departments') {
            viewAllDepts();
          } else if (data.trackerList === 'View all roles') {
             viewAllRoles();
          } else if (data.trackerList === 'View all employees') {
            viewAllEmployees();
          } else if (data.trackerList === 'Add a department') {
            addDept();
          } else if (data.trackerList === 'Add a role') {
            addRole();
          } else if (data.trackerList === 'Add an employee') {
            addEmployee();
          } else if (data.trackerList === 'Update an employee role') {
            updateEmployeeRole();
          } else if (data.trackerList === 'Quit') {
            return;
          } 
        })
      }
    
    async function viewAllDepts() {
      db.query("SELECT * FROM department", function (err, result){
        if (err) throw err;
        console.table(result);
        getListResponse();
      })
     }

    async function viewAllRoles() {
      db.query("SELECT * FROM role", function (err, result){
        if (err) throw err;
        console.table(result);
        getListResponse();
      })
     }

    async function viewAllEmployees() {
      db.query("SELECT * FROM employee", function (err, result){
        if (err) throw err;
        console.table(result);
        getListResponse();
      })
    }

    async function addDept() {
      let result = await inquirer.prompt([{
        type: 'input',
        message: 'What is the name of the department you wish to add?',
        name: 'addedDept',
      }]);
      await db.promise().query(
        "INSERT INTO department SET ?", {
          deptName:result.addedDept
        }
      )
      getListResponse();
    }

    async function addRole() {

    db.query = util.promisify(db.query);

    let departments = await db.query('SELECT * FROM department');
   
    let deptList = departments.map( (currDept) => {
      return {
        name: currDept.deptName,
        value: currDept.id
      }
    });

              
      let result = await inquirer.prompt([{
        type: 'input',
        message: 'What is the name of the role you wish to add?',
        name: 'addedRole',
      },
      {
        type: 'input',
        message: 'What is the salary of the role you wish to add?',
        name: 'addedRoleSalary',
      },
      {
        type: 'list',
        message: 'What is the name of the department affiliated with that role?',
        name: 'addedRoleDept',
        choices:deptList
      }]);
      await db.promise().query(
        "INSERT INTO role SET ?", {
          title:result.addedRole,
          salary:result.addedRoleSalary,
          department_id:result.addedRoleDept
        }
      )
      getListResponse();
    }

    async function addEmployee() {

      db.query = util.promisify(db.query);

      let roles = await db.query('SELECT * FROM role');
        
      let roleList = roles.map( (currRole) => {
        return {
          name: currRole.title,
          value: currRole.id
        }
      });
  
      let result = await inquirer.prompt([{
        type: 'input',
        message: 'What is the first name of the employee you wish to add?',
        name: 'addedFirstName',
      },
      {
        type: 'input',
        message: 'What is the last name of the employee you wish to add?',
        name: 'addedLastName',
      },
      {
        type: 'list',
        message: 'What is the role of the employee you wish to add?',
        name: 'addedEmployeeRole',
        choices:roleList
      }]);
      await db.promise().query(
        "INSERT INTO employee SET ?", {
          first_Name:result.addedFirstName,
          last_Name:result.addedLastName,
          role_id:result.addedEmployeeRole,

        }
      )
      getListResponse();
    }

    async function updateEmployeeRole() {
      db.query = util.promisify(db.query);

      let employees = await db.query('SELECT * FROM employee');
     
      let empList = employees.map( (currEmp) => {
        return {
          name: currEmp.last_name +  " , " + currEmp.first_name,
          value: currEmp.id
        }
      });

      let roles = await db.query('SELECT * FROM role');
     
      let roleList = roles.map( (addRole) => {
        return {
          name: addRole.title,
          value: addRole.id
        }
      });
     
      let result = await inquirer.prompt([{
        type: 'list',
        message: 'What is the name of the employee of whom you wish to change the role?',
        name: 'empChange',
        choices: empList,
      },
      {
        type: 'list',
        message: 'What is the new role for this employee?',
        name: 'empRoleChange',
        choices: roleList,
      }
    ])
    await db.promise().query(
      "UPDATE employee SET ? WHERE ?", [{
       role_id:result.empRoleChange},
       {id:result.empChange
      }]
    )

    getListResponse();
    }