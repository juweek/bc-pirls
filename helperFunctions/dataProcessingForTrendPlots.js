/*
------------------------
DESCRIP: a few methods for data processing for 2.1-2.2, and 2.3-2.4
------------------------
  */
 // Preprocess and transform the data
  function preprocessData(data) {
    return data.map(series => ({
      ...series,
      values: series.values.filter(d =>
        !isNaN(d.value) && d.value !== null && d.value !== '0' && d.value !== 0)
    }));
  }

  // Compute the error lookup from the dataset
  function computeErrorLookup(values) {
    return values
      .filter(d => d.time.endsWith('_error'))
      .reduce((acc, d) => {
        acc[d.time.replace('_error', '')] = d.value;
        return acc;
      }, {});
  }

  // Filter and sort data points based on time 
  function filterAndSortData(values) {
    return values
      .filter(d => !isNaN(d.time) || ['Wave', 'Country', 'Benchmark'].includes(d.time))
      .sort((a, b) => a.time - b.time);
  }

export {preprocessData, computeErrorLookup, filterAndSortData};

