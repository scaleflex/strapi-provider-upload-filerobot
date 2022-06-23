# Strapi v4's Filerobot upload provider

Node v14.8.0
NPM v6.14.7

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

## In Middleware

Replace `'strapi::security'` with:

```
{
  name: 'strapi::security',
  config: {
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'connect-src': ["'self'", 'https:'],
        'img-src': ["'self'", 'data:', 'blob:', 'scaleflex.cloudimg.io', '{YOUR FILEROBOT TOKEN}.filerobot.com'], // OR YOUR ENTIRE DOMAIN NAME
        'media-src': ["'self'", 'data:', 'blob:', 'scaleflex.cloudimg.io', '{YOUR FILEROBOT TOKEN}.filerobot.com'], // OR YOUR ENTIRE DOMAIN NAME
        upgradeInsecureRequests: null,
      },
    },
  },
},
```

for proper re-display after upload to Filerobot. This is a Strapi security thing that you need to pass.

## Useful commands

`npm i -S ./local_modules/@strapi/provider-upload-filerobot`

# References for imitation

- https://www.npmjs.com/package/@strapi/provider-upload-cloudinary
- https://github.com/strapi/strapi/tree/master/packages/providers/upload-cloudinary
- https://github.com/strapi/strapi/tree/master/packages/providers/upload-local

# Note

https://www.npmjs.com/package/@filerobot/core and https://www.npmjs.com/package/@filerobot/xhr-upload won't be use in this module, even though they would make code cleaner.

Because the team responsible for the replied:

Can't use `const Filerobot = require('@filerobot/core');` nor `import FIlerobot from '@filerobot/core'` in the context of this module, because

> From our side unfortunately you can't use require(CommonJs) because we export our libs using es6 module and we can't export both as (Common and ES6) , so maybe you can ask strapi if you can use ES6 import statements

Relevant task: https://sfx.li/KOL7JVXTSvGEle

# Potential problems you may come across

- https://stackoverflow.com/questions/57186018/referenceerror-headers-is-not-defined-when-using-headers-in-a-server-side-ren
- https://stackoverflow.com/questions/62119144/firebase-login-assertion-failed-new-time-loop-time-file-c-ws-deps-uv-src

# Todo:

- Currently it won't run on Windows. It only works properly on Linux. Because of this bug `Error: EPERM: operation not permitted, lstat 'C:/Users/%20/AppData/Local/Temp/strapi-upload- ... '`. But if one can learn how to upload via pipes are streams (like in this Cloudinary example: https://github.com/strapi/strapi/blob/master/packages/providers/upload-cloudinary/lib/index.js#L56), then this bug can be avoided.
- Save SASS key into browser, instead of getting it via API all the time.
- Nested code. Linearize it if possible.
