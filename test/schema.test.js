const schema = require('../lib/schema')

const validConfigs = [
  [{historyLabel: 'history'}],
  [{issueTitle: 'history has been altered'}],
  [{issueComment: 'sorry guys'}],
  [{_extends: '.github'}],
  [{_extends: 'foobar'}]
]

const invalidConfigs = [
  [{historyLabel: ''}, 'not allowed to be empty'],
  [{historyLabel: false}, 'must be a string'],
  [{historyLabel: ['a', 'b']}, 'must be a string'],
  [{issueTitle: ''}, 'not allowed to be empty'],
  [{issueTitle: false}, 'must be a string'],
  [{issueTitle: ['a', 'b']}, 'must be a string'],
  [{issueComment: ''}, 'not allowed to be empty'],
  [{issueComment: false}, 'must be a string'],
  [{issueComment: ['a', 'b']}, 'must be a string'],
  [{_extends: true}, 'must be a string'],
  [{_extends: false}, 'must be a string']
]

describe('schema', () => {
  test('defaults', async () => {
    expect(schema.validate({}).value).toEqual({
      historyLabel: 'history',
      issueTitle: 'Attention to contributors',
      issueComment: 'It appears that a change in history has occured. ' +
      'If you plan on contributing to this project please ' +
      'delete your fork and make a new one. ' +
      'We apologize for the inconvenience.',
      perform: true
    })
  })

  validConfigs.forEach(([example, expected = example]) => {
    test(`${JSON.stringify(example)} is valid`, () => {
      const result = schema.validate(example)
      expect(result.error).toBe(null)
      expect(result.value).toMatchObject(expected)
    })
  })

  invalidConfigs.forEach(([example, message]) => {
    test(`${JSON.stringify(example)} is invalid`, () => {
      const {error} = schema.validate(example)
      expect(error && error.toString()).toMatch(message)
    })
  })
})
