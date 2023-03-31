
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
 
echo '请指定编译方式  dev 或者 generate'
