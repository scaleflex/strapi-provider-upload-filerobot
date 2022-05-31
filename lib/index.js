'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const { pipeline } = require('stream');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { PayloadTooLargeError } = require('@strapi/utils').errors;

const UPLOADS_FOLDER_NAME = 'uploads';

module.exports = {
  init(config) {

    var haveFRConfigs = false;

    if (config && config.token && config.sec_tmp_id && config.fr_dir)
    {
      haveFRConfigs = true;
    }
    else
    {
      haveFRConfigs = false;
    }

    //@Todo: Check fRCredsValid too
    var fRCredsValid = false;

    if (!haveFRConfigs || !fRCredsValid) { // Upload to local if can't upload to Filerobot
      const { sizeLimit } = config;
      const verifySize = file => {
        if (file.size > sizeLimit) {
          throw new PayloadTooLargeError();
        }
      };

      // Ensure uploads folder exists
      const uploadPath = path.resolve(strapi.dirs.public, UPLOADS_FOLDER_NAME);
      if (!fse.pathExistsSync(uploadPath)) {
        throw new Error(
          `The upload folder (${uploadPath}) doesn't exist or is not accessible. Please make sure it exists.`
        );
      }
    }

    // const uploadToFilerobot = (base64, fr_dir, name, ext) =>
    //   new Promise(resolve => {

    //     var myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "application/json");
    //     myHeaders.append("X-Filerobot-Key", "SASS KEY HERE");

    //     var raw = JSON.stringify({
    //       "name": `${name}.${ext}`,
    //       "data": base64,
    //       "postactions": "decode_base64"
    //     });

    //     var requestOptions = {
    //       method: 'POST',
    //       headers: myHeaders,
    //       body: raw,
    //       redirect: 'follow'
    //     };

    //     fetch(`https://api.filerobot.com/fkklnkdm/v4/files?folder=/${fr_dir}`, requestOptions)
    //       .then(response => response.text())
    //       .then( 
    //         (result) => {
    //             console.log(result);

    //             if (result.status === 'success')
    //             {
    //                 file.url = result.file.url.cdn;
    //                 resolve();
    //             }
    //             else
    //             {
    //                 throw new Error(`Error uploading to Filerobot); 
    //             }
    //         } 
    //       )
    //       .catch( 
    //         (error) => {
    //             console.log('error', error);
    //             throw new Error(`Error uploading to Filerobot: ${error.code} - ${error.msg}`); 
    //         } 
    //       );

    return {
      uploadStream(file) {
        if (!haveFRConfigs || !fRCredsValid) { // Upload to local if can't upload to Filerobot
          verifySize(file);

          return new Promise((resolve, reject) => {
            pipeline(
              file.stream,
              fs.createWriteStream(path.join(uploadPath, `${file.hash}${file.ext}`)),
              err => {
                if (err) {
                  return reject(err);
                }

                file.url = `/uploads/${file.hash}${file.ext}`;

                resolve();
              }
            );
          });
        } else { // Upload to Filerobot
          const base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});

          // return uploadToFilerobot(base64, config.fr_dir, file.name, file.ext);
        }
      },
      upload(file) {
        if (!haveFRConfigs || !fRCredsValid) { // Upload to local if can't upload to Filerobot
          verifySize(file);

          return new Promise((resolve, reject) => {
            // write file in public/assets folder
            fs.writeFile(path.join(uploadPath, `${file.hash}${file.ext}`), file.buffer, err => {
              if (err) {
                return reject(err);
              }

              file.url = `/${UPLOADS_FOLDER_NAME}/${file.hash}${file.ext}`;

              resolve();
            });
          });
        } else { // Upload to Filerobot
          const base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});

          // return uploadToFilerobot(base64, config.fr_dir, file.name, file.ext);
        }
      },
      delete(file) {
        if (!haveFRConfigs || !fRCredsValid) { // Delete from local if can't use Filerobot
          return new Promise((resolve, reject) => {
            const filePath = path.join(uploadPath, `${file.hash}${file.ext}`);

            if (!fs.existsSync(filePath)) {
              return resolve("File doesn't exist");
            }

            // remove file from public/assets folder
            fs.unlink(filePath, err => {
              if (err) {
                return reject(err);
              }

              resolve();
            });
          });
        } else { // Delete from Filerobot
          const base64 = fs.readFileSync((file.stream.path), {encoding: 'base64'});

          // return deleteFromilerobot();
        }
      },
    };
  },
};
