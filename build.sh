
if [[ $1 == "dev" ]]; then
    echo '开始编译测试环境'
    cross-env PATH_TYPE=trial nuxt generate
    exit
fi

if [[ $1 == "generate" ]]; then
    echo '开始生产环境编译'
    cross-env PATH_TYPE=production  nuxt generate
    exit
fi

if [[ $1 == "deploy" ]]; then
    echo '开始生产环境编译 + 部署'
    cross-env PATH_TYPE=production  nuxt generate

    # 进入生成的文件夹
    cd dist

    # 如果是发布到自定义域名
    # echo 'www.example.com' > CNAME

    git init
    git add -A
    git commit -m 'deploy: autoDeploy by nuxt-issus-blog'

    # 如果发布到 https://<USERNAME>.github.io
    # git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

    # 如果发布到 https://<USERNAME>.github.io/<REPO>
    git push -f https://github.com/yanyue404/blog.git master:gh-pages

    cd -
    exit
fi

echo '请指定编译方式  dev|generate|deploy'
