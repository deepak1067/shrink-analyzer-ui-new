(function (window) {
    window.envconfig = window.envconfig || {};
    window['envconfig']['apiUrl'] = `${API_URL}`;
    window['envconfig']['ssoApiUrl'] = `${SSO_API_URL}`;
    window['envconfig']['env'] = `${ENVIRONMENT}`;
    window['envconfig']['api_key'] = `${API_KEY}`;
    window['envconfig']['googleMapKey'] = `${SHRINK_ANALYZER_GOOGLE_MAP_KEY}`;
    window['envconfig']['datadogLogLevel'] = `${DATADOG_LOG_LEVEL}`;
})(this);
