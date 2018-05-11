/* eslint-disable camelcase */
process.env.LOG_LEVEL = 'fatal'

const {createRobot} = require('probot')
const History = require('../lib/history')
const notFoundError = {
  code: 404,
  status: 'Not Found',
  headers: {}
}

describe('history', () => {
  let robot
  let github

  beforeEach(() => {
    robot = createRobot()

    const issueAction = jest.fn().mockImplementation(() => Promise.resolve(notFoundError))

    // Mock out the GitHub API
    github = {
      integrations: {
        getInstallations: jest.fn()
      },
      paginate: jest.fn(),
      issues: {
        getLabel: jest.fn().mockImplementation(() => Promise.reject(notFoundError)),
        createLabel: issueAction,
        addLabels: issueAction,
        create: issueAction
      },
      repos: {
        getForks: jest.fn().mockImplementation(() => Promise.reject(notFoundError))
      }
    }

    // Mock out GitHub client
    robot.auth = () => Promise.resolve(github)
  })

  test(
    'creates Issue mentioning contributors',
    async () => {
      let history = new History(github, {perform: true, owner: 'nickgarlis', repo: 'history', logger: robot.log})
      try {
        await history.createIssue(['@nickgarlis'])
      } catch (_) {
        throw new Error('Should not have thrown an error')
      }
    }
  )

  test(
    "gets contributors' usernames",
    async () => {
      let history = new History(github, {perform: true, owner: 'nickgarlis', repo: 'history', logger: robot.log})
      const users = await history.getUsers([{
        'owner': {
          'login': 'nickgarlis'
        }
      }])
      expect(users).toEqual(['@nickgarlis'])
    }
  )
})
