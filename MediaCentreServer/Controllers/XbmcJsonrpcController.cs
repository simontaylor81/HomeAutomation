using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web.Http;

namespace MediaCentreServer.Controllers
{
	// Simple proxy controller for passing on requests to XBMC's JSONRPC interface.
	// Required to bypass cross-origin security annoyance.
	public class XbmcJsonrpcController : ApiController
	{
		private const string url = "http://alfred:8080/jsonrpc";
		private const string username = "xbmc";
		private const string password = "xbmc";

		public XbmcJsonrpcController()
		{
			// Set up credentials to pass username & password to XBMC.
			// Can't forward on from the client because cross-origin requests aren't allowed.
			var credentials = new NetworkCredential(username, password);
			var handler = new HttpClientHandler() { Credentials = credentials };
			httpClient = new HttpClient(handler);
		}

		// POST /api/xbmcjsonrpc
		public async Task<HttpResponseMessage> Post(HttpRequestMessage request)
		{
			// Change the request url to point to XBMC itself.
			request.RequestUri = new Uri(url);

			// Forward the request to XMBC, and return the response directly.
			return await httpClient.SendAsync(request);
		}

		private HttpClient httpClient;
	}
}
