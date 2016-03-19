using System;
using Microsoft.Owin.Hosting;
using System.Threading;

namespace MediaCentreServer
{
    class Program
    {
        private const int port = 55343;
        
        static void Main(string[] args)
        {
			// Fire event on Ctrl+C.
			var quitEvent = new ManualResetEvent(false);
			Console.CancelKeyPress += (o, e) =>
			{
				quitEvent.Set();
				e.Cancel = true;
			};

			var url = $"http://*:{port}";
			using (WebApp.Start<Startup>(url))
			{
				Console.WriteLine($"Listening on port {port}");

				// Wait for Ctrl+C (which RunInTray uses to trigger exit).
				quitEvent.WaitOne();
			}
		}
	}
}