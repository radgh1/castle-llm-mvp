# Simple HTTP server to serve the employee handbook
# Run this script and access http://localhost:8000/employee-handbook.html

import http.server
import socketserver
import os

PORT = 8000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/employee-handbook.html'
        return super().do_GET()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_server():
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        print(f"Access the employee handbook at: http://localhost:{PORT}/employee-handbook.html")
        print("Press Ctrl+C to stop the server")
        httpd.serve_forever()

if __name__ == "__main__":
    # Change to the directory containing the HTML file
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    run_server()