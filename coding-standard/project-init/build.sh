# support for node@12.18.3
# sh ./coding-standard/project-init/build.sh  nuxt | vite
echo "node -v"
node -v

# 默认项目为 nuxt
_platform=${1:-nuxt}

echo "正在为 $_platform 项目创建代码规范：";

echo "1. 配置 package.json 命令"
node ./coding-standard/project-init/updatePackageJSON.js $_platform

echo "2. 控制安装相关依赖"

if [[ $_platform == vite ]]
then
   echo "安装 vite 依赖 ..."
   npm i @babel/eslint-parser@7.17.0 @commitlint/cli@17.0.3 @commitlint/config-conventional@17.0.3 @vue/eslint-config-prettier@7.0.0 cz-customizable@6.9.1 eslint@8.25.0  eslint-plugin-vue@9.6.0 husky@7.0.1  lint-staged@9.5.0 prettier@2.7.1 vite-plugin-eslint@1.7.0 --save-dev

else
   echo "安装 nuxt 依赖..."
   # npm i @babel/eslint-parser@7.14.7 @nuxtjs/eslint-config@6.0.1 eslint@7.29.0 eslint-config-prettier@8.5.0 eslint-plugin-nuxt@2.0.0 eslint-plugin-vue@9.3.0 prettier@2.7.1 husky@7.0.1 @commitlint/cli@17.0.3 @commitlint/config-conventional@17.0.3 cz-customizable@6.9.1 lint-staged@9.5.0 --save-dev
fi

echo "3. 复制代码规则文件并初始化 husky"

cp -r ./coding-standard/project-init/guide/. ./

# 创建 .eslintrc.js
node ./coding-standard/project-init/createESlintrc.js $_platform
npm run prepare
