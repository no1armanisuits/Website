# Website

Jekyll site for No.1 Armani Suits. Repo root is the site root.

## Generate locally

1. Install [Ruby](https://www.ruby-lang.org/) and [Bundler](https://bundler.io/) if needed.
2. From this directory (repo root), run:
   ```bash
   bundle install
   bundle exec jekyll serve
   ```
3. Open http://127.0.0.1:4000 (or the URL Jekyll prints). Use http://127.0.0.1:4000/da/, /sv/, /no/ for the other languages.

To only build the static files (no server):
```bash
bundle exec jekyll build
```
Output goes to `_site/`.