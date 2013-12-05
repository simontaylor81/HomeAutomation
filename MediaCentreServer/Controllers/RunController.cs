using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace MediaCentreServer.Controllers
{
	// Controller for running an application.
	public class RunController : ApiController
	{
		// POST /api/run?path=...
		public void Post(string path)
		{
			var startInfo = new ProcessStartInfo(path);
			startInfo.UseShellExecute = false;
			Process.Start(startInfo);
		}
	}
}
