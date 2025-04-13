#!/bin/bash

# 从 blog.config.js 读取配置
CONFIG=$(node -e "
const config = require('./blog.config.js');
console.log(JSON.stringify({
    userName: config.userName,
    repository: config.repository,
    blogName: config.blogName
}));
")

# 解析配置
USER_NAME=$(echo $CONFIG | jq -r '.userName')
REPOSITORY=$(echo $CONFIG | jq -r '.repository')
BLOG_NAME=$(echo $CONFIG | jq -r '.blogName')

if [[ $1 == "dev" ]]; then
    echo '开始编译测试环境'
    cross-env PATH_TYPE=trial nuxt generate
    exit
fi

if [[ $1 == "generate" ]]; then
    echo '开始生产环境编译'
    cross-env PATH_TYPE=production nuxt generate
    exit
fi

if [[ $1 == "deploy" ]]; then
    echo "开始生产环境编译 + 部署到 $USER_NAME/$REPOSITORY"
    cross-env PATH_TYPE=production nuxt generate

    # 进入生成的文件夹
    cd dist

    git init
    git add -A
    git commit -m "deploy: auto deploy $BLOG_NAME by nuxt-issues-blog"

    # 动态构建 GitHub 仓库地址
    GITHUB_REPO="https://github.com/$USER_NAME/$REPOSITORY.git"
    
    # 推送到对应的 gh-pages 分支
    git push -f $GITHUB_REPO master:gh-pages

    cd -
    echo "部署完成：https://$USER_NAME.github.io/$REPOSITORY"
    exit
fi

echo '请指定编译方式 dev|generate|deploy'
