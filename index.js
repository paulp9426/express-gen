#!/usr/bin/env node
'use strict';

const { execSync, spawn } = require('child_process')
const { PathPrompt } = require('inquirer-path')
const inquirer = require('inquirer')
const cmdify = require('cmdify')
const path = require('path')
const fse = require('fs-extra')
const fs = require('fs')
const os = require('os')

inquirer.prompt.registerPrompt('path', PathPrompt)

const init = () => {
  inquirer.prompt([
    {
      type: 'path',
      name: 'path',
      message: 'Select project location?\nYou can use relative to the default one.',
      default: process.cwd(),
      directoryOnly: true
    },
    {
      type: 'list',
      name: 'override',
      choices: ['yes', 'exit'],
      message: 'Files discovered at the given path. Override?',
      default: 'yes',
      when: (answers) => {
        if (fs.existsSync(answers.path))
          return execSync(`ls -la ${answers.path}`).toString().match(/index.js|.vscode|package.json/gm) !== null
        return false
      },
      filter: (value) => value === 'exit' ? process.exit(0) : true
    },
    {
      type: 'input',
      name: 'port',
      message: 'Server port?',
      default: 3000,
      validate: (value) => isNaN(parseInt(value)) ? 'Please enter a number.' : true,
      filter: (value) => parseInt(value)
    },
    {
      type: 'confirm',
      name: 'vscode',
      message: 'Open in VSCode when done?',
      default: true
    }
  ]).then(answers => {
    return new Promise((accept, _) => {
      inquirer.prompt([{
        type: 'list',
        name: 'result',
        message: 'Is this ok?',
        suffix: `\n${JSON.stringify(answers, null, 2)}\n`,
        choices: ['yes', 'startover', 'exit'],
        default: 'yes'
      }]).then(({ result }) => {
        accept({ answers, result })
      })
    })
  }).then(({ result, answers }) => {
    return new Promise((accept, _) => {
      switch (result) {
        case 'yes':
          accept(answers)
          break
        case 'startover':
          init()
          break
        case 'exit':
          console.log(`Bye for now :(`)
          process.exit(0)
          break
      }
    })
  }).then(async (_) => {
    try {
      const { path: _path, port, vscode, override } = _
      if (override)
        fse.emptyDirSync(_path)

      if (!fs.existsSync(_path))
        fs.mkdirSync(_path, { recursive: true })

      const sourcesPath = `${execSync('npm root -g').toString().replace('\n', '')}/expressjs-gen/sources`
      let script = fs.readFileSync(path.resolve(sourcesPath, './index.js'), 'utf8')
      const pckg = fs.readFileSync(path.resolve(sourcesPath, './package.json'), 'utf8').replace(`"author": "",`, `"author": "${os.userInfo().username}",`)
      const launch = fs.readFileSync(path.resolve(sourcesPath, './launch.json'), 'utf8')

      if (port !== 3000)
        script = script.replace(/3000/gm, port)

      fs.appendFileSync(path.resolve(_path, './index.js'), script, 'utf8')
      fs.appendFileSync(path.resolve(_path, './package.json'), pckg, 'utf8')
      fs.mkdirSync(path.resolve(_path, './.vscode'))
      fs.appendFileSync(path.resolve(_path, './.vscode/launch.json'), launch, 'utf8')

      const loader = ['/ Installing', '| Installing', '\\ Installing', '- Installing']
      let i = 4
      const ui = new inquirer.ui.BottomBar({ bottomBar: loader[i % 4] })
      setInterval(() => { ui.updateBottomBar(loader[i++ % 4]) }, 300)
      const cmd = spawn(cmdify('npm'), ['install', 'express', 'body-parser', '--save'], { stdio: 'pipe', cwd: _path })
      cmd.stdout.pipe(ui.log)
      cmd.on('close', _ => {
        ui.updateBottomBar(`Installation done at: ${_path}\n`)
        if (vscode === true)
          execSync(`code ${_path}`)
        process.exit()
      })

    } catch (error) {
      console.error(error.toString())
    }
  })
}

init()