"""
server.py — local dev server for the genomics research tool

Wraps Python's built-in HTTP server and bolts on a few /api/* endpoints
so the browser can trigger PLINK/GATK without me having to open a terminal
every time. Nothing fancy — this is not production code.

Run with: python server.py
"""

import http.server
import socketserver
import json
import subprocess
import os
import urllib.parse
import re

PORT = 8000


class GenomicsHandler(http.server.SimpleHTTPRequestHandler):

    def end_headers(self):
        # CORS — needed during dev when I sometimes serve the frontend from a different port
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        # browsers send a preflight before POST — just say yes to everything
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        qs = urllib.parse.parse_qs(parsed.query)

        if path == '/api/status':
            self.handle_status()
        elif path == '/api/list-inputs':
            self.handle_list_inputs()
        elif path == '/api/read-result':
            self.handle_read_result(qs)
        else:
            # everything else falls through to static file serving
            super().do_GET()

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path

        if path == '/api/run-plink':
            self.handle_run_plink()
        elif path == '/api/run-gatk':
            self.handle_run_gatk()
        elif path == '/api/generate-simulated-data':
            self.handle_generate_simulated_data()
        else:
            self.send_error(404, 'not found')

    # ------------------------------------------------------------------
    # /api/status
    # ------------------------------------------------------------------
    def handle_status(self):
        result = {
            'plink': {'status': 'missing', 'path': 'tools/plink.exe', 'version': ''},
            'gatk':  {'status': 'missing', 'path': 'tools/gatk/gatk-package-4.6.2.0-local.jar', 'version': ''},
            'java':  {'status': 'missing', 'version': ''},
        }

        # plink
        if os.path.exists('tools/plink.exe'):
            result['plink']['status'] = 'ok'
            try:
                r = subprocess.run(['tools/plink.exe', '--help'], capture_output=True, text=True, check=False)
                first = r.stdout.split('\n')[0]
                if 'PLINK' in first:
                    result['plink']['version'] = first.strip()
            except Exception as e:
                result['plink']['version'] = f'error: {e}'

        # gatk — just check the jar exists, don't spin up the JVM for a status check
        gatk_jar = 'tools/gatk/gatk-package-4.6.2.0-local.jar'
        if os.path.exists(gatk_jar):
            result['gatk']['status'] = 'ok'
            result['gatk']['version'] = 'GATK v4.6.2.0 (local jar)'

        # java — version goes to stderr for some reason, check both
        try:
            r = subprocess.run(['java', '-version'], capture_output=True, text=True, check=False)
            ver_text = r.stderr or r.stdout
            first = ver_text.split('\n')[0] if ver_text else 'unknown'
            result['java']['status'] = 'ok'
            result['java']['version'] = first.strip()
        except Exception:
            result['java']['version'] = 'java not found in PATH'

        self.send_json(result)

    # ------------------------------------------------------------------
    # /api/list-inputs
    # ------------------------------------------------------------------
    def handle_list_inputs(self):
        tools_dir = 'tools'
        seen = {}   # name -> list of extensions found
        vcfs = []

        if os.path.exists(tools_dir):
            for fname in os.listdir(tools_dir):
                name, ext = os.path.splitext(fname)
                ext = ext.lower()
                if ext in ('.ped', '.map'):
                    seen.setdefault(name, []).append(ext[1:])
                elif ext == '.vcf':
                    vcfs.append(fname)

        # only include datasets where we have BOTH .ped and .map
        datasets = [
            {'name': n, 'types': exts, 'path': f'tools/{n}'}
            for n, exts in seen.items()
            if 'ped' in exts and 'map' in exts
        ]

        self.send_json({'datasets': datasets, 'vcfs': vcfs})

    # ------------------------------------------------------------------
    # /api/read-result?file=...
    # ------------------------------------------------------------------
    def handle_read_result(self, qs):
        raw = qs.get('file', [''])[0]
        clean = os.path.normpath(raw)

        # basic path-traversal guard — only allow reading known result extensions under tools/
        allowed_exts = ('.frq', '.assoc', '.hwe', '.log', '.vcf')
        if (clean.startswith('..') or os.path.isabs(clean)
                or not clean.startswith('tools' + os.sep)
                or not any(clean.endswith(e) for e in allowed_exts)):
            self.send_error(400, 'invalid file path')
            return

        if not os.path.exists(clean):
            self.send_error(404, 'file not found')
            return

        try:
            with open(clean, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except Exception as e:
            self.send_error(500, str(e))

    # ------------------------------------------------------------------
    # /api/run-plink  (POST)
    # ------------------------------------------------------------------
    def handle_run_plink(self):
        body = self._read_body()
        if body is None:
            return

        file_name = body.get('file', '')
        analysis_type = body.get('type', '')

        # validate — don't want shell injection through the file name
        if not re.match(r'^tools/[a-zA-Z0-9_\-]+$', file_name):
            self.send_error(400, 'bad file path')
            return
        if analysis_type not in ('freq', 'assoc', 'hardy'):
            self.send_error(400, 'unsupported analysis type')
            return

        out_prefix = f'{file_name}_result'
        cmd = ['tools/plink.exe', '--file', file_name, f'--{analysis_type}', '--out', out_prefix]

        # TODO: add --allow-no-sex flag option in the UI for datasets without sex column
        res = subprocess.run(cmd, capture_output=True, text=True, check=False)

        result_files = {}
        if res.returncode == 0:
            ext_map = {'freq': '.frq', 'assoc': '.assoc', 'hardy': '.hwe'}
            result_files[analysis_type] = f'{out_prefix}{ext_map[analysis_type]}'
            result_files['log'] = f'{out_prefix}.log'

        self.send_json({
            'success': res.returncode == 0,
            'returncode': res.returncode,
            'stdout': res.stdout,
            'stderr': res.stderr,
            'result_files': result_files,
        })

    # ------------------------------------------------------------------
    # /api/run-gatk  (POST)
    # ------------------------------------------------------------------
    def handle_run_gatk(self):
        body = self._read_body()
        if body is None:
            return

        file_name = body.get('file', '')
        gatk_tool = body.get('tool', 'CountVariants')

        if not re.match(r'^tools/[a-zA-Z0-9_\-]+\.vcf$', file_name):
            self.send_error(400, 'bad vcf path')
            return

        # keeping this locked to CountVariants for now — don't need HaplotypeCaller locally
        if gatk_tool not in ('CountVariants',):
            self.send_error(400, 'unsupported gatk tool')
            return

        gatk_jar = 'tools/gatk/gatk-package-4.6.2.0-local.jar'
        if not os.path.exists(gatk_jar):
            self.send_json({
                'success': False,
                'stdout': '',
                'stderr': 'GATK jar not found. Put gatk-package-4.6.2.0-local.jar in tools/gatk/',
                'result_files': {},
            })
            return

        cmd = ['java', '-jar', gatk_jar, gatk_tool, '-V', file_name]
        res = subprocess.run(cmd, capture_output=True, text=True, check=False)

        self.send_json({
            'success': res.returncode == 0,
            'returncode': res.returncode,
            'stdout': res.stdout,
            'stderr': res.stderr,
            'result_files': {},
        })

    # ------------------------------------------------------------------
    # /api/generate-simulated-data  (POST)
    # ------------------------------------------------------------------
    def handle_generate_simulated_data(self):
        try:
            import tools.generate_data as gd
            gd.generate_simulated_gwas()
            gd.generate_sample_vcf()
            self.send_json({
                'success': True,
                'message': 'Simulated ped/map and VCF files written to tools/',
            })
        except Exception as e:
            self.send_json({'success': False, 'message': str(e)})

    # ------------------------------------------------------------------
    # helpers
    # ------------------------------------------------------------------
    def _read_body(self):
        """Read and parse JSON POST body. Returns None and sends a 400 on failure."""
        try:
            length = int(self.headers.get('Content-Length', 0))
            raw = self.rfile.read(length)
            return json.loads(raw.decode('utf-8'))
        except Exception as e:
            self.send_error(400, f'bad request body: {e}')
            return None

    def send_json(self, data):
        payload = json.dumps(data).encode('utf-8')
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, fmt, *args):
        # default logging is noisy — keep it but strip the date prefix
        print(f'  {self.address_string()} {fmt % args}')


if __name__ == '__main__':
    print(f'Server running at http://localhost:{PORT}')
    print('Press Ctrl+C to stop.\n')
    with socketserver.TCPServer(('', PORT), GenomicsHandler) as srv:
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print('\nStopped.')
