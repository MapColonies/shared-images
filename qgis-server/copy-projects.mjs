#!/usr/bin/env zx

$.verbose = false;

['dtm','dsm'].forEach(async (dataType) => {
    
  ($`aws s3 ls --endpoint-url ${process.env.AWS_ENDPOINT_URL} s3://${process.env.AWS_BUCKET_NAME}/${dataType}/ --human-readable --summarize`)
  .then(async (data) => {
    const bucketList = data.stdout.trim();
    console.log(`\n**** ${dataType} projects to download ****\n ${bucketList}\n`);

    const regexp = /\w*\//g;
    let folder;
    while (folder = regexp.exec(bucketList)) {
      const currentFolder = folder[0].replace('/','');
      console.log('*** Copying project folder of --> ', currentFolder);
      const output = (await $`aws s3 cp --endpoint-url ${process.env.AWS_ENDPOINT_URL} s3://${process.env.AWS_BUCKET_NAME}/${dataType}/${currentFolder}/project /io/data/${currentFolder} --recursive`).stdout.trim();
      console.log(output);
    } 
  })
  .catch((e) => {
    console.log(`\n!!!**** ${dataType} folder doesn't exist ****!!!\n`);
    console.log(`${e.stdout.trim()}\n`);
    return;
  });

});