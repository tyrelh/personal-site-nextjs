# Personal site source

Source code for my personal website. Check it out at [superflux.dev](https://superflux.dev)

## Stack

* Next.js
* React
* TypeScript
* Ant Design
* marked (parsing markdown)
* grey-matter (parsing front-matter from markdown)

## Develop

```shell
npm install

npm run compile-search-index

npm run dev
```

## Deploy

Make sure to set your `origin` remote to the remote of your github pages repo. In my case to tyrelh.github.io. Or you can customize the remote that is deployed to. See [gh-pages docs](https://github.com/tschaub/gh-pages) for more info.

```shell
# either add a new remote
git remote add origin https://github.com/tyrelh/tyrelh.github.io.git

# or update existing origin remote
git remote set-url origin https://github.com/tyrelh/tyrelh.github.io.git
```

Build the static site first:

```shell
npm run build
```

Then run the deploy:
```shell
npm run deploy
```

The deploy script will do a couple things

* It will output a _CNAME_gs file to the static assets directory. This is neccessary to configure GitHub Pages with a custom domain. Make sure to edit the `deploy` script in the _package.json_ with the domain you use, or remove that `echo` entirely if you're not using a custom domain.
* It will output a _.nojekyll_ file to the static assets directory. This is neccessary to configure GitHub Pages to work with a Next.js site. It tells GitHub to not ignore files and directories beginning with `_`.
* Then it uses the `gh-pages` command to push to your GitHub Pages repo. A few flags are used. `-d out` tells it which directory should be deployed. `-b master` tells it to which branch on the remote should be deployed to. `-f` forces the push to the remote, overwriting changes that may exist there. `-t` tells it to include dotfiles, necessary for the _.nojekyll_ file.