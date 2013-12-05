using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;

namespace MediaCentreServer
{
	public static class WebApiConfig
	{
		public const string DEFAULT_ROUTE_NAME = "MyDefaultRoute";
		public static void Register(HttpConfiguration config)
		{
			// Enable CORS (fully open -- it's internal only).
			var cors = new EnableCorsAttribute("*", "*", "*");
			config.EnableCors(cors);

			config.Routes.MapHttpRoute(
				name: DEFAULT_ROUTE_NAME,
				routeTemplate: "api/{controller}/{id}",
				defaults: new { id = RouteParameter.Optional }
			);

			config.EnableSystemDiagnosticsTracing();
		}
	}
}
