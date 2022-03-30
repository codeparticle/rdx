/* eslint-disable unicorn/no-abusive-eslint-disable, eslint-comments/no-unlimited-disable, eslint-comments/disable-enable-pair */
/* eslint-disable */
const { cd, exec, echo, touch } = require(`shelljs`)
const { readFileSync } = require(`fs`)
const url = require(`url`)

let repoUrl
const pkg = JSON.parse(readFileSync(`package.json`))

if (typeof pkg.repository === `object`) {
  if (!pkg.repository.hasOwnProperty(`url`)) {
    throw new Error(`URL does not exist in repository section`)
  }

  repoUrl = pkg.repository.url
} else {
  repoUrl = pkg.repository
}

const parsedUrl = url.parse(repoUrl)
const repository = (parsedUrl.host || ``) + (parsedUrl.path || ``)
const ghToken = process.env.GH_TOKEN

echo(`Deploying docs!!!`)
cd(`docs`)
touch(`.nojekyll`)
exec(`git init`)
exec(`git add .`)
exec(`git config user.name "Nick Krause"`)
exec(`git config user.email "nick@codeparticle.com"`)
exec(`git commit -m "docs(docs): update gh-pages"`)
exec(`git push --force --quiet "https://${ghToken}@${repository}" master:gh-pages`)
echo(`Docs deployed!!`)
