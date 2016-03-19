using System.Web.Http;
using System.Web.Http.Cors;
using Owin;

namespace MediaCentreServer
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
			app.UseErrorPage();

			// Enable CORS (fully open -- it's internal only).
			app.UseCors(Microsoft.Owin.Cors.CorsOptions.AllowAll);

            // Configure Web API for self-host.
            var config = new HttpConfiguration();
            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );

			app.UseWebApi(config);
        }
    }
}