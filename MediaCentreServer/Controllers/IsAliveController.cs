using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MediaCentreServer.Controllers
{
	// Very simple controller that returns a response to gets so you know the server is up.
	public class IsAliveController : ApiController
	{
		// GET api/isalive
		public void Get()
		{
			//return new HttpResponseMessage(HttpStatusCode.OK);
		}
	}
}
