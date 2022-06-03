# Strapi v4's Filerobot upload provider

## For local development, so as follows

- Strapiv4 CMS root folder
	- build
	- config
	- ...
	- **local_modules**
		- @strapi
			- **provider-upload-filerobot**
				- lib
					- index.js
				- package.json
	- node_modules
	- public
	- ...

So you will be cloning into `local_modules\@strapi\provider-upload-filerobot`.   
So in your local Strapi v4 setup, in its root folder:   
1. `mkdir -p local_modules\@strapi`
2. `cd local_modules\@strapi`
3. `git clone -b provider-v4 https://code.scaleflex.cloud/strapi/strapi-filerobot-provider.git provider-upload-filerobot`

## Config

In `{root Strapi v4 CMS folder}config/plugins.js`

```js
module.exports = {
	...
  'scaleflex-filerobot': {
    enabled: true,
    resolve: "./src/plugins/scaleflex-filerobot", // Folder of your plugin
  },
  'upload': {
    config: {
      provider: 'filerobot',
      providerOptions: {
        token: '',
        sec_tmp_id: '',
        fr_dir: '',
      },
    },
  },
};
```
If you don't have a `plugins.js`, then create it.

## Useful commands

`npm i -S ./local_modules/@strapi/provider-upload-filerobot`
