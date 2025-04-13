const { exec, cd, echo } = require('shelljs')
const blogConfig = require('./blog.config')
/*
 自动发布 blog 站点
*/

echo('# 开始生产环境编译 + 部署')
exec('npm run build')

echo('# 进入生成的文件夹')
cd('dist')

echo('# 提交推送')
exec('git init')
exec('git add -A')
exec('git commit -m "deploy: autoDeploy by nuxt-issus-blog"')

// # 如果发布到 https://<userName>.github.io
// # git push -f git@github.com:<userName>/<userName>.github.io.git master

exec(
  `git push -f https://github.com/${blogConfig.userName}/${blogConfig.repository}.git master:gh-pages`
)

cd('-')
