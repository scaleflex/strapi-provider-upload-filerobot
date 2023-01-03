# Strapi v4 upload provider for Filerobot by Scaleflex

## Pre-requisite

The Filerobot Upload Provider should be installed after the Filerobot Plugin for Strapi. Otherwise media will just get uploaded to the local server.

## Install

`npm install provider-upload-filerobot`

(Use `npm install provider-upload-filerobot --legacy-peer-deps `if you need to)

## After you install the upload provider

### Config

In `config/plugins.js`

```
module.exports = {
    // ...
    'upload': {
        config: {
            provider: 'provider-upload-filerobot',
            providerOptions: {},
        },
    },
};
```

## Run

`yarn build`

`yarn start`

## Usage

**Now when you upload stuff to Strapi's Media Library, the images will end up with a Filerobot URL:**

![](https://store.filerobot.com/opendocs-global/ab479f6263b25a0c226b93df0429cddf8b9528840dc2563d5a2be1fb60be7dd0.png)

On top of that, if you have a content type which contains a Media field, like for example below:

![](https://store.filerobot.com/opendocs-global/e13f4a64f974e500b2d32871f47322da6c089bda3d5ca7b41bb1dfce4b8a8e91.png)

The media that you'll add/upload into the content-post will also end up with a Filerobot URL:

![](https://store.filerobot.com/opendocs-global/70280a599a6bd498e20067c338591d060e34a54b4be84549c2e2973948cf9d90.png)
