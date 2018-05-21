const getConfig = require('probot-config')
const History = require('./lib/history')

module.exports = async robot => {
  robot.on('push', notifyUsers)

  async function notifyUsers (context) {
    if (context.payload.forced) {
      const history = await forRepository(context)
      await history.notifyUsers()
    }
  }

  async function forRepository (context) {
    let config = await getConfig(context, 'history.yml')

    if (!config) {
      // Don't actually perform for repository without a config
      config = {perform: false}
    }

    config = Object.assign(config, context.repo({logger: robot.log}))

    return new History(context.github, config)
  }
}
