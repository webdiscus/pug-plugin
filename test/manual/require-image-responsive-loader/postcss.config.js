module.exports = (ctx) => {
  return {
    syntax: 'postcss-scss',
    plugins: [
      require('postcss-font-magician')({
        variants: {
          Oswald: {
            '300 italic': [],
            '400 italic': [],
            '500 italic': [],
            '600 italic': [],
            '700 italic': [],
            '800 italic': [],
            '900 italic': []
          }
        },
        foundries: ['google'],
        hosted: ['./fonts']
      }),
      require('tailwindcss'),
      require('autoprefixer'),
      require('postcss-property-lookup'),
      require('postcss-short')({ skip: 'null' }),
      require('postcss-sort-media-queries'),
      require('cssnano'),
      ctx.mode === 'production'
        ? require('@fullhuman/postcss-purgecss')({
            content: [`./src/**/*.{pug,html,js}`]
          })
        : null
    ]
  };
};
