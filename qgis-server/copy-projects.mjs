#!/usr/bin/env zx

$.verbose = false;

const S3_SERVER_URL = 'http://10.8.0.9:9000';
const S3_BUCKET = 'dem-int';

['dtm','dsm'].forEach(async (dataType) => {
    
  ($`aws s3 ls --endpoint-url ${S3_SERVER_URL} s3://${S3_BUCKET}/${dataType}/ --human-readable --summarize`)
  .then(async (data) => {
    const bucketList = data.stdout.trim();
    console.log(`\n**** ${dataType} projects to download ****\n ${bucketList}\n`);

    const regexp = /\w*\//g;
    let folder;
    while (folder = regexp.exec(bucketList)) {
      const currentFolder = folder[0].replace('/','');
      console.log('*** Copying project folder of --> ', currentFolder);
      const output = (await $`aws s3 cp --endpoint-url ${S3_SERVER_URL} s3://${S3_BUCKET}/${dataType}/${currentFolder}/project ./${currentFolder} --recursive`).stdout.trim();
      console.log(output);
    } 
  })
  .catch((e) => {
    console.log(`\n!!!**** ${dataType} folder doesn't exist ****!!!\n`);
    console.log(`${e.stdout.trim()}\n`);
    return;
  });

});