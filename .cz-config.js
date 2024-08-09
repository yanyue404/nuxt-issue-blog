module.exports = {
  // 可选类型
  types: [
    { value: 'feat', name: 'feat:     新功能' },
    { value: 'chore', name: 'chore:    构建过程或辅助工具的变动' },
    { value: 'test', name: 'test:     增加测试' },
    { value: 'fix', name: 'fix:      修复' },
    { value: 'build', name: 'build:    打包' },
    { value: 'style', name: 'style:    代码格式(不影响代码运行的变动)' },
    { value: 'docs', name: 'docs:     文档变更' },
    { value: 'perf', name: 'perf:     性能优化' },
    {
      value: 'refactor',
      name: 'refactor: 重构(既不是增加feature, 也不是修复bug)'
    },
    { value: 'revert', name: 'revert:   回退' }
  ],
  scopes: [
    { name: 'core' },
    { name: 'admin' },
    { name: 'exampleScope' },
    { name: 'changeMe' }
  ],
  // 消息步骤
  messages: {
    type: '请选择提交类型:',
    scope: '请输入修改范围(可选):',
    // used if allowCustomScopes is true
    customScope: 'Denote the SCOPE of this change:',
    subject: '请简要描述提交(必填):',
    body: '请输入详细描述(可选):',
    footer: '请输入要关闭的issue(可选):',
    confirmCommit: '确认使用以上信息提交？(y/n/e/h)'
  },
  // 展示空的 scope
  allowCustomScope: false,
  // 跳过问题
  skipQuestions: ['scope', 'body', 'footer'],
  // subject文字长度默认是100
  subjectLimit: 100
}
