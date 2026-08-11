#!/usr/bin/env python3
"""Servidor estático de desenvolvimento, com cache do navegador DESLIGADO.

Por que existe
--------------
`python -m http.server` responde com Last-Modified e deixa o navegador
cachear HTML/JS. Durante o desenvolvimento isso faz o navegador servir uma
versão ANTIGA de um arquivo que você acabou de editar — e o sintoma não
parece cache: parece bug de lógica. Você edita, recarrega, nada muda, e vai
procurar o erro no lugar errado.

Este servidor manda `Cache-Control: no-store` em toda resposta, então o que
você vê é sempre o que está no disco.

Uso
---
    python3 scripts/devserver.py          # porta 8000
    python3 scripts/devserver.py 8011     # porta explícita

Não use em produção: o site é publicado como arquivos estáticos pelo
GitHub Pages (.github/workflows/publish.yml), sem servidor próprio.
"""

import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    """SimpleHTTPRequestHandler servindo a raiz do repo, sem cache."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


class Server(http.server.ThreadingHTTPServer):
    # Sem isto, reiniciar o servidor logo após um Ctrl+C falha com
    # "Address already in use" enquanto o socket antigo está em TIME_WAIT.
    allow_reuse_address = True


def main():
    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Porta inválida: {sys.argv[1]!r}", file=sys.stderr)
            return 1

    try:
        httpd = Server(("", port), NoCacheHandler)
    except OSError as err:
        if err.errno in (48, 98):   # EADDRINUSE no macOS / Linux
            print(f"A porta {port} já está em uso.", file=sys.stderr)
            print(f"Rode em outra porta:  python3 scripts/devserver.py {port + 1}",
                  file=sys.stderr)
            return 1
        raise

    with httpd:
        print(f"Servindo {ROOT}")
        print(f"  http://localhost:{port}/   (cache desligado)")
        print("Ctrl+C para parar.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nEncerrado.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
