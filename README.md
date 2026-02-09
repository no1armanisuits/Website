# Website

Jekyll site for No.1 Armani Suits. Repo root is the site root. Production URL: **https://www.no1armanisuits.com**

## Generate locally

1. Install [Ruby](https://www.ruby-lang.org/) and [Bundler](https://bundler.io/) if needed.
2. From this directory (repo root), run:
   ```bash
   bundle install
   bundle exec jekyll serve
   ```
3. Open http://127.0.0.1:4000 (or the URL Jekyll prints). Use http://127.0.0.1:4000/da/, /sv/, /nb/ for the other languages.

To only build the static files (no server):
```bash
bundle exec jekyll build
```
Output goes to `_site/`.

## Before launch

- **Domain**: `url` in `_config.yml` is set to https://www.no1armanisuits.com.
- **SEO**: Sitemap (`/sitemap.xml`), `robots.txt`, hreflang, canonical, meta description, and Open Graph/Twitter tags are in place.
- **404**: Custom `404.html` is included (used automatically on GitHub Pages).
- **Favicon**: Add a `favicon.ico` in the site root if you want a custom favicon; the layout already links to it.
- **Host**: Point the domain’s DNS to your host (e.g. GitHub Pages), then enable the custom domain in the host’s settings.