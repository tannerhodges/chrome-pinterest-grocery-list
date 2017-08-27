const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('default', () =>
  gulp.src('src/*')
    .pipe(zip('chrome-pinterest-grocery-list.zip'))
    .pipe(gulp.dest('dist'))
);
