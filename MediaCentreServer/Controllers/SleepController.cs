using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;

namespace MediaCentreServer.Controllers
{
	// Controller for putting the server to sleep.
	public class SleepController : ApiController
	{
		public void Post()
		{
			// Put the PC into standby.
			// Post to thread pool so we time to return the response before we go to sleep.
			Task.Run(() =>
				System.Windows.Forms.Application.SetSuspendState(
					System.Windows.Forms.PowerState.Suspend,
					false,		// force
					false)		// disable wake events
			);
		}
	}
}
