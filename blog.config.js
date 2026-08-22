// 单一配置源：blog.config.cjs，此文件仅做 ESM re-export（剥离 accessToken，避免打进前端包）
const { accessToken, ...publicConfig } = require('./blog.config.cjs') // eslint-disable-line
export default publicConfig
