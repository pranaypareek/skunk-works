'use strict';

exports.returnFileExtension = function(runtime) {
  let extension = '';

  if (runtime === 'node') {
    extension = '.js';
  } else if (runtime === 'go') {
    extension = '.go';
  } else if (runtime === 'ruby') {
    extension = '.rb';
  } else {
    extension = '';
  }

  return extension;
};

exports.returnFileRuntime = function(extension) {
  let runtime = '';

  if (extension === 'js') {
    runtime = 'node';
  } else if (extension === 'go') {
    runtime = 'go';
  } else if (extension === 'rb') {
    runtime = 'ruby';
  }

  return runtime;
};
