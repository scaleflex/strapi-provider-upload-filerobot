# Strapi v3 upload provider for Filerobot by Scaleflex

## Pre-requisite

**The Filerobot Upload Provider MUST be installed AFTER the Filerobot Plugin for the Strapi CMS.**

## Install

`npm install strapi-provider-upload-filerobot`

or

`yarn add strapi-provider-upload-filerobot`

## After you install the upload provider

In `extensions/upload/config/settings.json` (Create this file if it doesn't already exist)

```
{
  "provider": "filerobot",
  "providerOptions": {}
}
```

## Run

`yarn build`

`yarn start`

## Usage

**Now when you upload stuff to Strapi's Media Library, the images will end up with a Filerobot URL:**

![](https://store.filerobot.com/opendocs-global/834c79e6a9fc02747988077d5c9e919f651268324ea76ce0d24d4c88e0cd6c1f.png)

On top of that, if you have a content type which contains a Media field, like for example below:

![](https://store.filerobot.com/opendocs-global/5fb4ee7183fd8da9bfcc275461d75a9dddadd133e8fc0615084d035e346d46b1.png)

The media that you'll add/upload into the content-post will also end up with a Filerobot URL.

## Disable the generation of size-variations for images

Turn these off

![](https://store.filerobot.com/opendocs-global/project_test/d5b0478dd30da29305b466fd167d0abac30334101dbe03bf3f9efb0e94b20eaf.png)