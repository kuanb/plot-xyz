const runExtractionProcesses = {
  getFile: (file) => {
    return new Promise ((fulfill, reject) => {
      let location = file || 'data.csv';
      let data;
      $.get(file)
        .success(fulfill)
        .fail(reject);
    });
  }
}

const runExtraction = (file) => {
  return new Promise ((fulfill, reject) => {
    let proc = runExtractionProcesses;
    
    proc.getFile(file)
    .then((res) => {
      res = res.split('\n').map((ea) => {
        return ea.split(',');
      }).filter((ea) => {
        // we only want the location value and pointsecurity
        return ea[9] && ea[22];

      // convert to default obj structure
      }).map((ea) => {
        let loc = ea[9].split(' ');
        let sec = ea[22];
        return {
          lat: Number(loc[0]),
          lng: Number(loc[1]),
          val: Number(sec),
        };

      // make sure that there are no NaN values in result
      }).filter((ea) => {
        return !isNaN(ea.lat) && !isNaN(ea.lng) && !isNaN(ea.val);
      });

      fulfill(res.splice(300, 310));
      // fulfill(res);
      
    }).catch(reject)
  });
};