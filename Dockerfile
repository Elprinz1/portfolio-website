# The site is already built by the time this runs — CI hands us dist/ from the
# `build` job. Nothing is compiled here, so the image is just a web server plus
# static files and stays a few megabytes.
#
# Building locally instead? Run `npm ci && npm run build` first.

FROM caddy:2-alpine

COPY Caddyfile /etc/caddy/Caddyfile
COPY dist /srv

EXPOSE 8080

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
