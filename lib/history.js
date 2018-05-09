const schema = require('./schema')

module.exports = class History {
  constructor (github, {owner, repo, logger = console, ...config}) {
    this.github = github
    this.logger = logger

    const {error, value} = schema.validate(config)

    this.config = value

    if (error) {
      // Report errors to sentry
      logger.warn({err: new Error(error), owner, repo}, 'Invalid config')
    }

    Object.assign(this.config, {owner, repo})
  }

  async notifyUsers () {
    if (!this.config['perform']) {
      return
    }

    this.logger.info(this.config, 'Notifying users')

    await this.ensureHistoryLabelExists()

    const users = []
    this.getForks().then(res => {
      const forks = res.data
      
      if (!forks.length === 0) {
        this.logger.info('No forks found for %s/%s', this.config['owner'], this.config['repo'])
        return
      }

      forks.forEach(repo => {
        users.push(`@${repo.owner.login}`)
      })

      this.createIssue(users)
    })
  }

  getForks () {
    const {owner, repo} = this.config
    return this.github.repos.getForks({owner, repo})
  }

  async createIssue (users) {
    const {owner, repo} = this.config
    const mention = '\n\n' + users.join(', ')
    const perform = this.config['perform']
    const historyLabel = this.config['historyLabel']
    const issueTitle = this.config['issueTitle']
    const issueComment = this.config['issueComment'] + mention

    if (perform) {
      this.logger.info('Creating an issue on %s/%s', owner, repo)
      if (issueTitle && issueComment) {
        const params = {owner, repo, title: issueTitle, body: issueComment, labels: [historyLabel]}
        return this.github.issues.create(params)
      }
    } else {
      this.logger.info("%s/%s's contributors would have been notified (dry-run)", owner, repo)
    }
  }

  async ensureHistoryLabelExists () {
    const {owner, repo} = this.config
    const historyLabel = this.config['historyLabel']

    return this.github.issues.getLabel({owner, repo, name: historyLabel}).catch(() => {
      return this.github.issues.createLabel({owner, repo, name: historyLabel, color: 'f7ca18'})
    })
  }
}
