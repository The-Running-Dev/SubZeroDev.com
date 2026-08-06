// Artifact — the container server's configuration (contract's Artifact §
// Public signatures, "serverConfig is Artifact's third duty"; U7 settled the
// format as nginx's).
//
// `try_files $uri $uri/ =404` with `error_page 404 /404.html` resolves an
// unknown path to the root miss document with a 404 status (R4). No cookie,
// no application-chosen cache-control directive, no tracking or rewrite
// header — a response header that is an unconfigured byproduct of serving a
// static file is not a violation and is not suppressed here. Pure and
// deterministic: no filesystem, no container and no network is involved in
// producing this text.

export const serverConfigFilename = "default.conf" as const;

export function serverConfig(): string {
  return `server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
}
`;
}
