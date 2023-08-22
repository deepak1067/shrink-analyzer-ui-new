export const environment = {
  production: false,
  api: {
    baseUrl: (window as any)["envconfig"]["apiUrl"] || "default",
    routes: {
      auth: {
        validate: '/v1/api/cookie',
        verifyToken: '/v1/api/token/verify',
        fetchToken: '/v1/api/token',
        refreshToken: '/v1/api/token/refresh',
        deleteToken: '/v1/api/cookie/delete'
      },
      user: {
        fetch: '/v1/api/user/info'
      },
      tenants: {
        get: '/v1/api/tenants',
        getTenant: '/v1/tenant'
      },
      apis: {
        sites: '/v1/sites2',
        dataKey: (window as any)["envconfig"]["api_key"] || "default",
        getShrinkEventsBySites: '/v1/shrink-events-by-site',
        getShrinkVisibility: '/v1/shrink-visibility',
        getDaysOfWeekData: '/v1/shrink-events-by-day-of-the-week',
        getHoursOfTheDayData: '/v1/shrink-events-by-hour-of-the-day',
        getProductAttributes: '/v1/product-attributes',
        getEpcEvents: '/v1/epc-events',
        getShrinkEventsByProductAttribute: '/v1/shrink-events-by-product-attribute',
        getBulkEventsData:'/v1/bulk-shrink-events',
        setExitEventLabel:'/v1/exit/events2'
      },
    }
  },
  ssoApiUrl: (window as any)["envconfig"]["ssoApiUrl"] || "default",
  redirectApiurl: '/auth-process',
  env: (window as any)["envconfig"]["env"] || "default",
  datadogLogLevel: (window as any)["envconfig"]["datadogLogLevel"] || "default",
  googleMapKey: (window as any)["envconfig"]["googleMapKey"] || "default",
  useDataKey: false
};
