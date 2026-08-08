# The release artifact (design/30-slices.md § S9): nginx:alpine serving
# Artifact's finished tree and the emitted server configuration (U7,
# design/90-decisions.md). Consumes site/dist and site/server/default.conf as
# already produced by `npm run build` + `npm run finalize-artifact` — it
# builds nothing and bundles nothing.

FROM nginx:alpine
COPY site/dist /usr/share/nginx/html
COPY site/server/default.conf /etc/nginx/conf.d/default.conf
