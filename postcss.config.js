const AutoPrefixer = require("autoprefixer");
module.exports = ({ file }) => {
  return {
    plugins: [
      AutoPrefixer({
        overrideBrowserslist: ["last 20 versions", "android >= 4.0"],
      }),
    ],
  };
};
