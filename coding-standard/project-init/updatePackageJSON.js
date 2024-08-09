const fs = require("fs");
const pkg = require("../../../package.json");
let param = process.argv[2] 

function merge() {
  let isObj = (s) => "[object Object]" == Object.prototype.toString.call(s);
  let r = {};
  for (let i = 0, e = arguments.length; i < e; i++) {
    let m = arguments[i];
    if (isObj(m)) {
      for (let k in m) {
        let n = m[k];
        if (isObj(n)) {
          r[k] = merge(r[k] || {}, n);
        } else {
          r[k] = n;
        }
      }
    } else {
      throw new Error("arguments must be pure object.");
    }
  }
  return r;
}

const context = {
  nuxt: {
    config: {
      commitizen: {
        path: "node_modules/cz-customizable",
      },
    },
    scripts: {
      prepare: "husky install",
      lint:
        "eslint --ext .vue pages/ --ext .vue components/prd --ext .js store/",
      prettier: "prettier pages/** store/* components/prd/*  --write",
      "lint:fix": "npm run lint -- --fix",
    },
    "lint-staged": {
      "pages/*.vue": ["eslint --fix", "prettier --write", "git add"],
      "store/*.js": ["eslint --fix", "prettier --write", "git add"],
    },
  },
  vite: {
    config: {
      commitizen: {
        path: "node_modules/cz-customizable",
      },
    },
    scripts: {
      prepare: "husky install",
      lint: "eslint --ext .vue,.js src/",
      prettier: "prettier src/**/*.js  src/**/*.vue  --write",
      "lint:fix": "npm run lint -- --fix",
    },
    "lint-staged": {
      "src/*.vue": ["eslint --fix", "prettier --write", "git add"],
      "src/*.js": ["eslint --fix", "prettier --write", "git add"],
    },
  },
};

// 这个端口可以传参
const PackageJSONResult = merge(pkg, context[param]);

fs.writeFile(
  "package.json",
  JSON.stringify(PackageJSONResult, null, 2),
  "utf-8",
  () => {}
);
