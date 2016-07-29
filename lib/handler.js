/* jshint node: true */

'use strict';

var GitHubPublisher = require('github-publish');
var MicropubFormatter = require('format-microformat');

module.exports = function (githubTarget, micropubDocument, siteUrl, options) {
  options = options || {};

  var publisher = new GitHubPublisher(githubTarget.token, githubTarget.user, githubTarget.repo, githubTarget.branch);
  var formatter = new MicropubFormatter({
    relativeTo: siteUrl,
    deriveLanguages: options.deriveLanguages,
    permalinkStyle: options.permalinkStyle
  });
  var force = false;

  return formatter.formatAll(micropubDocument)
    .then(function (formatted) {
      if (formatted.raw.url === formatted.url) {
        force = true;
      }

      return Promise.all(
          (formatted.files || []).map(function (file) {
            return publisher.publish(file.filename, file.buffer, {
              force: force,
              message: 'uploading media'
            })
              .then(function (result) {
                // TODO: Do something more than just logging
                if (!result) { console.log('Failed to upload media'); }
              });
          })
        )
        .then(function () {
          return formatted;
        });
    })
    .then(function (formatted) {
      var category = formatted.raw.derived.category || 'article';

      if (category === 'social') {
        category = 'social interaction';
      }

      return publisher.publish(formatted.filename, formatted.content, {
        force: force,
        message: 'uploading ' + category
      })
        .then(function (result) {
          return result ? formatted.url : false;
        });
    });
};
