# Markdown Previewer

This Python script allows you to preview a Markdown file in your web browser. It starts a local web server that renders the Markdown file as HTML.

## Setup

1.  **Navigate to the `md_previewer` directory:**

    ```bash
    cd md_previewer
    ```

2.  **Install the required packages:**

    It is recommended to use a virtual environment to manage dependencies.

    ```bash
    # Create and activate a virtual environment (optional but recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install dependencies
    pip install -r requirements.txt
    ```

## Usage

To preview a Markdown file, run the `preview.py` script from the command line and provide the path to the Markdown file as an argument.

```bash
python preview.py /path/to/your/markdown/file.md
```

### Example

To preview the included `sample.md` file, run the following command from within the `md_previewer` directory:

```bash
python preview.py sample.md
```

This will start a web server on `http://localhost:8000` and automatically open the preview in your default web browser.

### Custom Port

You can specify a custom port using the `--port` option:

```bash
python preview.py sample.md --port 8080
```

To stop the server, press `Ctrl+C` in the terminal.
