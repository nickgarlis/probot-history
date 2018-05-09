const Joi = require('joi')

const fields = {
  historyLabel: Joi.string()
    .description('Label to use when notifying contributors'),

  issueTitle: Joi.string()
    .description('Title to use when notifying contributors'),

  issueComment: Joi.string()
    .description('Comment to post when notifying contributors')
}

const schema = Joi.object().keys({
  historyLabel: fields.historyLabel.default('history'),
  issueTitle: fields.issueTitle.default(
    'Attention to contributors'
  ),
  issueComment: fields.issueComment.default(
    'It appears that a change in history has occured. ' +
    'If you plan on contributing to this project please ' +
    'delete your fork and make a new one. ' +
    'We apologize for the inconvenience.'
  ),
  perform: Joi.boolean().default(!process.env.DRY_RUN),
  _extends: Joi.string().description('Repository to extend settings from')
})

module.exports = schema
