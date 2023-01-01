'use strict';

const fetch = require("node-fetch");
const fs = require('fs');
const localUpload = require('@strapi/provider-upload-local');

module.exports = {
  init(config) {
    const filerobotApiDomain = 'https://api.filerobot.com';

    const removeQueryParam = (link, paramName) =>
    {
      let url = new URL(link);
      let params = new URLSearchParams(url.search);
      params.delete(paramName);
      let newUrl = params.toString() ? `${url.origin}${url.pathname}?${params.toString()}` : `${url.origin}${url.pathname}`;

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
      let pluginStore = strapi.store({
        environment: strapi.config.environment,
        type: 'plugin',
        name: 'filerobot'
      });

      let configs = await pluginStore.get({key:'options'});

      return configs;
    }

    const getFilerobotUploader = (base64, file, configs) =>
    {
      const uploadImage = async () => {
        let uploadHeaders = new fetch.Headers();
        uploadHeaders.append("Content-Type", "application/json");
        uploadHeaders.append("X-Filerobot-Key", configs.sass);

        let raw = JSON.stringify({
          "name": file.name,
          "data": base64,
          "postactions": "decode_base64"
        });

        let uploadRequestOptions = {
          method: 'POST',
          headers: uploadHeaders,
          body: raw
        };

        let response = await fetch(`${filerobotApiDomain}/${configs.token}/v4/files?folder=/${configs.folder}`, uploadRequestOptions);
        let data = await response.json();

        if (data.status !== 'success')
        {
          throw new Error('System Error: Upload API call to Filerobot went wrong.');
        }

        let url = data.file.url.cdn;
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
      let headers = new fetch.Headers();
      headers.append("Content-Type", "application/json");

      let requestOptions = {
        method: 'GET',
        headers: headers
      };

      if (typeof(Storage) !== "undefined" && sessionStorage.getItem("sassKey"))
      { // Have in-browser Sass Key
        let sass = sessionStorage.getItem("sassKey");

        let headers = new fetch.Headers();
        headers.append("Content-Type", "application/json");
        headers.append("X-Filerobot-Key", sass);

        let requestOptions = {
          method: 'GET',
          headers: headers,
          redirect: 'follow'
        };

        let response = await fetch(`${filerobotApiDomain}/${configs.token}/v4/files/`, requestOptions);
        let data = await response.json();

        if (data.code !== 'KEY_EXPIRED' && data.code !== 'UNAUTHORIZED')
        { // In-browser Sass Key still valid
          return sass;
        }
        else
        { // Need another new Sass Key
          let sass = await getNewSass(configs, requestOptions);

          return sass;
        }
      }
      else
      { // Need first Sass Key
        let sass = await getNewSass(configs, requestOptions);

        return sass;
      }
    }
    const getNewSass = async (configs, requestOptions) => 
    {
      let response = await fetch(`${filerobotApiDomain}/${configs.token}/key/${configs.sec_temp}`, requestOptions);
      let data = await response.json();

      if (data.status !== 'success')
      {
        throw new Error('System Error: SASS API call to Filerobot went wrong.');
      }

      let sass = data.key;

      if (typeof(Storage) !== "undefined")
      {
        sessionStorage.setItem("sassKey", sass);
      }

      return sass;
    }

    return {
      async uploadStream(file) 
      {
        let filerobotConfigs = await getConfigs();

        if (!filerobotConfigs) 
        {
          return localUpload.init().uploadStream(file);
        }

        if (file.caption)
        { // Ignore Strapi CMS's size variations
          let sass = await getSass(filerobotConfigs);
          filerobotConfigs.sass = sass;

          let base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});

          return getFilerobotUploader(base64, file, filerobotConfigs);
        }
      },
      async upload(file) 
      {
        let filerobotConfigs = await getConfigs();

        if (!filerobotConfigs) 
        {
          return localUpload.init().upload(file);
        }

        if (file.caption)
        { // Ignore Strapi CMS's size variations
          let sass = await getSass(filerobotConfigs);
          filerobotConfigs.sass = sass;

          let base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});

          return getFilerobotUploader(base64, file, filerobotConfigs);
        }
      },
      async delete(file) 
      {
        let filerobotConfigs = await getConfigs();

        if (!filerobotConfigs) 
        {
          return localUpload.init().delete(file);
        }

        let sass = await getSass(filerobotConfigs);

        if (file.id)
        { // Ignore Strapi CMS's size variations
          let headers = new fetch.Headers();
          headers.append("Content-Type", "application/json");
          headers.append("X-Filerobot-Key", sass);

          let deleteOptions = {
            method: 'DELETE',
            headers: headers,
            redirect: 'follow'
          };

          let response = await fetch(`${filerobotApiDomain}/${filerobotConfigs.token}/v4/files/${file.alternativeText}`, deleteOptions);
          let result = await response.text();
          console.log(result);
        }
      },
    };
  },
};
