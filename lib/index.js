'use strict';

const fetch = require("node-fetch");
const fs = require('fs');

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

    const connFilerobot = (base64, file, configs) =>
      new Promise(resolve => {
        var headers = new fetch.Headers();
        headers.append("Content-Type", "application/json");

        var requestOptions = {
          method: 'GET',
          headers: headers
        };

        if (typeof(Storage) !== "undefined" && sessionStorage.getItem("sassKey"))
        {
          var sass = sessionStorage.getItem("sassKey");

          var headers = new fetch.Headers();
          headers.append("Content-Type", "application/json");
          headers.append("X-Filerobot-Key", sass);

          var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
          };

          fetch(`${filerobotApiDomain}/${configs.token}/v4/files/`, requestOptions)
            .then(response => response.json())
            .then(data => {
              if (data.code !== 'KEY_EXPIRED' && data.code !== 'UNAUTHORIZED')
              { // In-browser Sass Key still valid
                //--- @Todo: See if its possible to not to repeat this chunk of code
                var uploadHeaders = new fetch.Headers();
                uploadHeaders.append("Content-Type", "application/json");
                uploadHeaders.append("X-Filerobot-Key", sass);

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

                fetch(`${filerobotApiDomain}/${configs.token}/v4/files?folder=/${configs.folder}`, uploadRequestOptions)
                  .then(response => response.json())
                  .then(data => {
                    if (data.status === 'success')
                    {
                      var url = data.file.url.cdn;
                      url = removeQueryParam(url, 'vh');
                      url = adjustForCname(url, configs);
                      file.url = url;
                      file.hash = data.file.hash.sha1;
                      file.alternativeText = data.file.uuid;
                      resolve();
                    }
                    else
                    {
                      throw new Error('System Error: Upload API call to Filerobot went wrong.');
                    }
                  })
                  .catch(error => {
                    throw new Error('System Error: Upload API call to Filerobot went wrong.');
                  });
                //---
              }
              else
              { // Need a new Sass Key
                //--- @Todo: See if its possible to not to repeat this chunk of code
                fetch(`${filerobotApiDomain}/${configs.token}/key/${configs.sec_temp}`, requestOptions)
                  .then(response => response.json())
                  .then(data => {
                    if (data.status === 'success')
                    {
                      var sass = data.key;

                      if (typeof(Storage) !== "undefined")
                      {
                        sessionStorage.setItem("sassKey", sass);
                      }

                      //--- @Todo: See if its possible to not to repeat this chunk of code
                      var uploadHeaders = new fetch.Headers();
                      uploadHeaders.append("Content-Type", "application/json");
                      uploadHeaders.append("X-Filerobot-Key", sass);

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

                      fetch(`${filerobotApiDomain}/${configs.token}/v4/files?folder=/${configs.folder}`, uploadRequestOptions)
                        .then(response => response.json())
                        .then(data => {
                          if (data.status === 'success')
                          {
                            var url = data.file.url.cdn;
                            url = removeQueryParam(url, 'vh');
                            url = adjustForCname(url, configs);
                            file.url = url;
                            file.hash = data.file.hash.sha1;
                            file.alternativeText = data.file.uuid;
                            resolve();
                          }
                          else
                          {
                            throw new Error('System Error: Upload API call to Filerobot went wrong.');
                          }
                        })
                        .catch(error => {
                          throw new Error('System Error: Upload API call to Filerobot went wrong.');
                        });
                      //---
                    }
                    else
                    {
                      throw new Error('System Error: SASS API call to Filerobot went wrong.');
                    }
                  })
                  .catch(error => {
                    throw new Error('System Error: SASS API call to Filerobot went wrong.');
                  });
                    }
                  });
                //---
        }
        else
        {
          fetch(`${filerobotApiDomain}/${configs.token}/key/${configs.sec_temp}`, requestOptions)
            .then(response => response.json())
            .then(data => {
              if (data.status === 'success')
              {
                var sass = data.key;

                if (typeof(Storage) !== "undefined")
                {
                  sessionStorage.setItem("sassKey", sass);
                }

                //--- @Todo: See if its possible to not to repeat this chunk of code
                var uploadHeaders = new fetch.Headers();
                uploadHeaders.append("Content-Type", "application/json");
                uploadHeaders.append("X-Filerobot-Key", sass);

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

                fetch(`${filerobotApiDomain}/${configs.token}/v4/files?folder=/${configs.folder}`, uploadRequestOptions)
                  .then(response => response.json())
                  .then(data => {
                    if (data.status === 'success')
                    {
                      var url = data.file.url.cdn;
                      url = removeQueryParam(url, 'vh');
                      url = adjustForCname(url, configs);
                      file.url = url;
                      file.hash = data.file.hash.sha1;
                      file.alternativeText = data.file.uuid;
                      resolve();
                    }
                    else
                    {
                      throw new Error('System Error: Upload API call to Filerobot went wrong.');
                    }
                  })
                  .catch(error => {
                    throw new Error('System Error: Upload API call to Filerobot went wrong.');
                  });
                //---
              }
              else
              {
                throw new Error('System Error: SASS API call to Filerobot went wrong.');
              }
            })
            .catch(error => {
              throw new Error('System Error: SASS API call to Filerobot went wrong.');//
            });
        }
      });

    return {
      async uploadStream(file) {
        var configs = await getConfigs();

        if (!configs) 
        {
          throw new Error('Please provide all Filerobot credentials');
        }

        //if (file.hasOwnProperty('caption'))
        //{ // Ignore Strapi CMS's size variations
          var base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});
          return connFilerobot(base64, file, configs);
        //}
      },
      async upload(file) {
        var configs = await getConfigs();

        if (!configs) 
        {
          throw new Error('Please provide all Filerobot credentials');
        }

        //if (file.hasOwnProperty('caption'))
        //{ // Ignore Strapi CMS's size variations
          var base64 = file.buffer.toString('base64');
          return connFilerobot(base64, file, configs);
        //}
      },
      async delete(file) { //@Todo: DRY and try to un-nest code
        var configs = await getConfigs();

        if (!configs) 
        {
          throw new Error('Please provide all Filerobot credentials');
        }

        //if (file.id)
        //{ // Ignore Strapi CMS's size variations
          if (typeof(Storage) !== "undefined" && sessionStorage.getItem("sassKey"))
          {
            var sass = sessionStorage.getItem("sassKey");

            var headers = new fetch.Headers();
            headers.append("Content-Type", "application/json");
            headers.append("X-Filerobot-Key", sass);

            var deleteOptions = {
              method: 'DELETE',
              headers: headers,
              redirect: 'follow'
            };

            fetch(`${filerobotApiDomain}/${configs.token}/v4/files/${file.alternativeText}`, deleteOptions)
              .then(response => response.text())
              .then(result => console.log(result))
              .catch(error => {
                throw new Error('System Error: Upload API call to Filerobot went wrong.');
              });
          }
          else
          {
            var headers = new fetch.Headers();
            headers.append("Content-Type", "application/json");

            var requestOptions = {
              method: 'GET',
              headers: headers
            };

            fetch(`${filerobotApiDomain}/${configs.token}/key/${configs.sec_temp}`, requestOptions)
              .then(response => response.json())
              .then(data => {
                if (data.status === 'success')
                {
                  var sass = data.key;

                  if (typeof(Storage) !== "undefined")
                  {
                    sessionStorage.setItem("sassKey", sass);
                  }

                  var headers = new fetch.Headers();
                  headers.append("Content-Type", "application/json");
                  headers.append("X-Filerobot-Key", sass);

                  var deleteOptions = {
                    method: 'DELETE',
                    headers: headers,
                    redirect: 'follow'
                  };

                  fetch(`${filerobotApiDomain}/${configs.token}/v4/files/${file.alternativeText}`, deleteOptions)
                    .then(response => response.text())
                    .then(result => console.log(result))
                    .catch(error => {
                      throw new Error('System Error: Upload API call to Filerobot went wrong.');
                    });
                }
                else
                {
                  throw new Error('System Error: SASS API call to Filerobot went wrong.');
                }
              })
              .catch(error => {
                throw new Error('System Error: SASS API call to Filerobot went wrong.');
              });
          }
        //}
      },
    };
  },
};
