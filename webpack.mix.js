const mix = require('laravel-mix')

mix.js('./autocompletex.js', './dist/autocompletex.min.js')
  .sass('./autocompletex.scss', './dist/autocompletex.min.css')
  .options({
    autoprefixer: {
      options: {
        browsers: ['cover 99.5%']
      }
    }
  })