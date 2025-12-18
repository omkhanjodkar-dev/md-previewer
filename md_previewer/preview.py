
import argparse
import http.server
import socketserver
import webbrowser
import os
import markdown2

DEFAULT_PORT = 8000

class MarkdownPreviewHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        self.html = kwargs.pop('html', '')
        super().__init__(*args, **kwargs)

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(self.html.encode('utf-8'))
        else:
            super().do_GET()

def main():
    parser = argparse.ArgumentParser(description='Preview a Markdown file.')
    parser.add_argument('filepath', help='Path to the Markdown file')
    parser.add_argument('--port', type=int, default=DEFAULT_PORT, help='Port to serve the preview on')
    args = parser.parse_args()

    try:
        with open(args.filepath, 'r', encoding='utf-8') as f:
            md_content = f.read()
    except FileNotFoundError:
        print(f"Error: File not found at '{args.filepath}'")
        return

    html_body = markdown2.markdown(md_content, extras=['fenced-code-blocks', 'tables'])
    html_template = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Markdown Preview: {os.path.basename(args.filepath)}</title>
        <style>
            body {{
                font-family: sans-serif;
                line-height: 1.6;
                padding: 2em;
                max-width: 800px;
                margin: 0 auto;
                color: #333;
            }}
            pre {{
                background-color: #f4f4f4;
                padding: 1em;
                border-radius: 5px;
                overflow-x: auto;
            }}
            code {{
                font-family: 'Courier New', Courier, monospace;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
            }}
            th, td {{
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
            }}
            th {{
                background-color: #f2f2f2;
            }}
        </style>
    </head>
    <body>
        {html_body}
    </body>
    </html>
    """

    def handler_factory(*args, **kwargs):
        return MarkdownPreviewHandler(*args, html=html_template, **kwargs)

    with socketserver.TCPServer(("", args.port), handler_factory) as httpd:
        print(f"Serving at http://localhost:{args.port}")
        url = f"http://localhost:{args.port}"
        webbrowser.open_new_tab(url)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down the server.")
            httpd.shutdown()

if __name__ == "__main__":
    main()
