'use strict';

const fetch = require("node-fetch");
const fs = require('fs');

module.exports = {
  init(config) {
    if (!config || !config.token || !config.sec_tmp_id || !config.fr_dir)
    {
      return {
        uploadStream(file, customConfig = {}) {
          throw new Error('Please provide all Filerobot credentials');
        },
        upload(file, customConfig = {}) {
          throw new Error('Please provide all Filerobot credentials');
        },
        delete(file, customConfig = {}) {
          throw new Error('Please provide all Filerobot credentials');
        },
      };
    }

    const removeQueryParam = (link, paramName) =>
    {
      var url = new URL(link);
      var params = new URLSearchParams(url.search);
      params.delete(paramName);
      var newUrl = params.toString() ? `${url.origin}${url.pathname}?${params.toString()}` : `${url.origin}${url.pathname}`;

      return newUrl;
    }

    const connFilerobot = (base64, file) =>
      new Promise(resolve => {
        const filerobotApiDomain = 'https://api.filerobot.com';

        var headers = new fetch.Headers();
        headers.append("Content-Type", "application/json");

        var requestOptions = {
          method: 'GET',
          headers: headers
        };

        if (typeof(Storage) !== "undefined" && sessionStorage.getItem("sassKey"))
        {
          var sass = sessionStorage.getItem("sassKey");

          var headers = new Headers();
          headers.append("Content-Type", "application/json");
          headers.append("X-Filerobot-Key", sass);

          var requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
          };

          fetch(`${filerobotApiDomain}/${config.token}/v4/files/`, requestOptions)
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

                fetch(`${filerobotApiDomain}/${config.token}/v4/files?folder=/${config.fr_dir}`, uploadRequestOptions)
                  .then(response => response.json())
                  .then(data => {
                    if (data.status === 'success')
                    {
                      file.url = removeQueryParam(data.file.url.cdn, 'vh');
                      file.hash = data.file.hash.sha1;
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
                fetch(`${filerobotApiDomain}/${config.token}/key/${config.sec_tmp_id}`, requestOptions)
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

                      fetch(`${filerobotApiDomain}/${config.token}/v4/files?folder=/${config.fr_dir}`, uploadRequestOptions)
                        .then(response => response.json())
                        .then(data => {
                          if (data.status === 'success')
                          {
                            file.url = removeQueryParam(data.file.url.cdn, 'vh');
                            file.hash = data.file.hash.sha1;
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
          fetch(`${filerobotApiDomain}/${config.token}/key/${config.sec_tmp_id}`, requestOptions)
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

                fetch(`${filerobotApiDomain}/${config.token}/v4/files?folder=/${config.fr_dir}`, uploadRequestOptions)
                  .then(response => response.json())
                  .then(data => {
                    if (data.status === 'success')
                    {
                      file.url = removeQueryParam(data.file.url.cdn, 'vh');
                      file.hash = data.file.hash.sha1;
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

    return {
      uploadStream(file) {
        var base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});
        return connFilerobot(base64, file);
      },
      upload(file) {
        var base64 = file.buffer.toString('base64');
        return connFilerobot(base64, file);
      },
      delete(file) {

      },
    };
  },
};
