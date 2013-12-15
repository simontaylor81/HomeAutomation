using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace MediaCentreServer.Controllers
{
	// Controller for killing processes on the target PC.
	public class KillProcessController : ApiController
	{
		// POST /api/killprocess?name=...
		public string Post(string name)
		{
			// Kill each process with the given name.
			var processes = Process.GetProcessesByName(name);
			foreach (var process in processes)
			{
				process.Kill();
			}

			if (processes.Length > 0)
			{
				return string.Format("Killing {0} process{1}.", processes.Length, processes.Length != 1 ? "es" : "");
			}
			else
			{
				return "No processes found.";
			}
		}
	}
}
