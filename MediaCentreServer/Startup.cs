using System.Web.Http;
using Owin;
using System.Web.Http.Tracing;

namespace MediaCentreServer
{
	public class Startup
	{
		public void Configuration(IAppBuilder app)
		{
			// Enable CORS (fully open -- it's internal only).
			app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);

			// Configure Web API for self-host.
			var config = new HttpConfiguration();
			config.Routes.MapHttpRoute(
				name: "DefaultApi",
				routeTemplate: "api/{controller}/{id}",
				defaults: new { id = RouteParameter.Optional }
			);

			// Configure logging.
			var traceWriter = config.EnableSystemDiagnosticsTracing();
			traceWriter.MinimumLevel = TraceLevel.Warn;

			app.UseWebApi(config);
		}
	}
}