'use strict';

const fetch = require("node-fetch");
const fs = require('fs');
const localUpload = require('@strapi/provider-upload-local');

module.exports = {
  init(config) {
    const filerobotApiDomain = 'https://api.filerobot.com';

    const removeQueryParam = (link, paramName) =>
    {
      var url = new URL(link);
      var params = new URLSearchParams(url.search);
      params.delete(paramName);
      var newUrl = params.toString() ? `${url.origin}${url.pathname}?${params.toString()}` : `${url.origin}${url.pathname}`;

      return newUrl;
    }
  
    const adjustForCname = (link, configs) =>
    {
      if (!configs.cname)
      {
        return link;
      }

      link = link.replace(`https://${configs.token}.filerobot.com/v7`, `https://${configs.cname}`);

      return link;
    }

    const getConfigs = async () =>
    {
      var pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'filerobot'
      });

      var configs = await pluginStore.get({key:'options'});

      return configs;
    }

    const getFilerobotUploader = (base64, file, configs) =>
    {
      const uploadImage = async () => {
        var uploadHeaders = new fetch.Headers();
        uploadHeaders.append("Content-Type", "application/json");
        uploadHeaders.append("X-Filerobot-Key", configs.sass);

        var raw = JSON.stringify({
          "name": file.name,
          "data": base64,
          "postactions": "decode_base64"
        });

        var uploadRequestOptions = {
          method: 'POST',
          headers: uploadHeaders,
          body: raw
        };

        var response = await fetch(`${filerobotApiDomain}/${configs.token}/v4/files?folder=/${configs.folder}`, uploadRequestOptions);
        var data = await response.json();

        if (data.status !== 'success')
        {
          throw new Error('System Error: Upload API call to Filerobot went wrong.');
        }

        var url = data.file.url.cdn;
        url = removeQueryParam(url, 'vh');
        url = adjustForCname(url, configs);
        file.url = url;
        file.hash = data.file.hash.sha1;
        file.alternativeText = data.file.uuid;
      }

      return uploadImage();
    }

    const getSass = async (configs) =>
    {
      var headers = new fetch.Headers();
      headers.append("Content-Type", "application/json");

      var requestOptions = {
        method: 'GET',
        headers: headers
      };

      if (typeof(Storage) !== "undefined" && sessionStorage.getItem("sassKey"))
      { // Have in-browser Sass Key
        var sass = sessionStorage.getItem("sassKey");

        var headers = new fetch.Headers();
        headers.append("Content-Type", "application/json");
        headers.append("X-Filerobot-Key", sass);

        var requestOptions = {
          method: 'GET',
          headers: headers,
          redirect: 'follow'
        };

        var response = await fetch(`${filerobotApiDomain}/${configs.token}/v4/files/`, requestOptions);
        var data = await response.json();

        if (data.code !== 'KEY_EXPIRED' && data.code !== 'UNAUTHORIZED')
        { // In-browser Sass Key still valid
          return sass;
        }
        else
        { // Need another new Sass Key
          var sass = await getNewSass(configs, requestOptions);

          return sass;
        }
      }
      else
      { // Need first Sass Key
        var sass = await getNewSass(configs, requestOptions);

        return sass;
      }
    }
    const getNewSass = async (configs, requestOptions) => 
    {
      var response = await fetch(`${filerobotApiDomain}/${configs.token}/key/${configs.sec_temp}`, requestOptions);
      var data = await response.json();

      if (data.status !== 'success')
      {
        throw new Error('System Error: SASS API call to Filerobot went wrong.');
      }

      var sass = data.key;

      if (typeof(Storage) !== "undefined")
      {
        sessionStorage.setItem("sassKey", sass);
      }

      return sass;
    }

    return {
      async uploadStream(file) 
      {
        var filerobotConfigs = await getConfigs();

        if (!filerobotConfigs) 
        {
          return localUpload.init().upload(file);
        }

        if (file.caption)
        { // Ignore Strapi CMS's size variations
          var sass = await getSass(filerobotConfigs);
          filerobotConfigs.sass = sass;

          var base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});

          return getFilerobotUploader(base64, file, filerobotConfigs);
        }
      },
      async upload(file) 
      {
        var filerobotConfigs = await getConfigs();

        if (!filerobotConfigs) 
        {
          return localUpload.init().upload(file);
        }

        if (file.caption)
        { // Ignore Strapi CMS's size variations
          var sass = await getSass(filerobotConfigs);
          filerobotConfigs.sass = sass;

          var base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});

          return getFilerobotUploader(base64, file, filerobotConfigs);
        }
      },
      async delete(file) 
      {
        var filerobotConfigs = await getConfigs();

        if (!filerobotConfigs) 
        {
          return localUpload.init().delete(file);
        }

        var sass = await getSass(filerobotConfigs);

        if (file.id)
        { // Ignore Strapi CMS's size variations
          var headers = new fetch.Headers();
          headers.append("Content-Type", "application/json");
          headers.append("X-Filerobot-Key", sass);

          var deleteOptions = {
            method: 'DELETE',
            headers: headers,
            redirect: 'follow'
          };

          var response = await fetch(`${filerobotApiDomain}/${filerobotConfigs.token}/v4/files/${file.alternativeText}`, deleteOptions);
          var result = await response.text();
          console.log(result);
        }
      },
    };
  },
};
