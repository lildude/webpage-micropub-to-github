'use strict';

const { deepFreeze } = require('./utils');

const env = process.env;
const pkg = require('../package.json');
let prefix = 'MICROPUB_';

prefix = env[prefix + 'PREFIX'] || prefix;

// Load the dotenv file
if (process.env.DOTENV_FILE) {
  require('dotenv').load({ path: process.env.DOTENV_FILE });
} else {
  // Fail silently if we assume default dotenv file location
  require('dotenv').load({ silent: true });
}

const parseJSON = (value) => value ? JSON.parse(value) : undefined;
const parseJSONList = (value) => [].concat(parseJSON(value) || []);

const config = {
  version: pkg.version,
  env: env.NODE_ENV || 'production',
  port: env.PORT || 8080,
  host: env[prefix + 'HOST'],
  github: {
    user: env[prefix + 'GITHUB_USER'],
    token: env[prefix + 'GITHUB_TOKEN']
  },
  site: {
    url: env[prefix + 'SITE_URL'],
    repo: env[prefix + 'SITE_GITHUB_REPO'],
    syndicateToUid: env[prefix + 'SITE_SYNDICATE_TO_UID'],
    syndicateToName: env[prefix + 'SITE_SYNDICATE_TO_NAME'],
    syndicateTo: parseJSONList(env[prefix + 'SITE_SYNDICATE_TO'])
  },
  sites: parseJSON(env[prefix + 'SITES_JSON']) || false,
  token: env[prefix + 'TOKEN_ENDPOINT']
    ? [{
      endpoint: env[prefix + 'TOKEN_ENDPOINT'],
      me: env[prefix + 'TOKEN_ME'] || env[prefix + 'SITE_URL']
    }]
    : [],
  handlerOptions: {
    noAutoConfigure: !!env[prefix + 'OPTION_NO_AUTO_CONFIGURE'],
    deriveCategory: parseJSON(env[prefix + 'OPTION_DERIVE_CATEGORY']) || false,
    deriveLanguages: (env[prefix + 'OPTION_DERIVE_LANGUAGES'] || '').split(',').filter(item => !!item),
    permalinkStyle: env[prefix + 'PERMALINK_STYLE']
  }
};

config.userAgent = pkg.name + '/' + config.version + ' (' + pkg.homepage + ')';

module.exports = deepFreeze(config);
