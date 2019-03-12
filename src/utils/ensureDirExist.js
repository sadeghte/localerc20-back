import mkdirp from './mkdirP';
import fs from 'fs';

export default function (dir) {
  // eslint-disable-next-line no-undef
  return new Promise(function (resolve, reject) {
    mkdirp(dir, function(err){
        if (err)
          reject(err);
        else{
          resolve();
        }
    });
  })
}