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
      try {
        const output = (await $`aws s3 cp --endpoint-url ${process.env.AWS_ENDPOINT_URL} s3://${process.env.AWS_BUCKET_NAME}/${dataType}/${currentFolder}/project /io/data/${currentFolder} --recursive`).stdout.trim();
        console.log(output);
      } catch (err) {
        console.log(`\n!!!**** Error: 'aws s3 cp' failed for ${dataType} ****!!!\n`);
      }
      await $`sed -i 's,{RAW_DATA_PROXY_URL},${process.env.RAW_DATA_PROXY_URL},g' /io/data/${currentFolder}/${currentFolder}.qgs`;
    } 
  })
  .catch((e) => {
    console.log(`\n!!!**** Error: 'aws s3 ls' failed for ${dataType} ****!!!\n`);
    console.log(`${e.stdout.trim()}\n`);
    return;
  });

});