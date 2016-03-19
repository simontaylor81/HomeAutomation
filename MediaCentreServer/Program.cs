using System;
using Microsoft.Owin.Hosting;

namespace MediaCentreServer
{
    class Program
    {
        private const int port = 55343;
        
        static void Main(string[] args)
        {
            var url = $"http://localhost:{port}";
            using (WebApp.Start<Startup>(url))
            {
                Console.WriteLine($"Listening on port {port}");
                Console.WriteLine("Press Enter to quit.");
                Console.ReadLine();
            }
        }
    }
}