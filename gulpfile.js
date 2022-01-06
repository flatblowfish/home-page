const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const cssminify = require('gulp-minify-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify'); //Minify JavaScript with UglifyJS3.
const obfuscate = require('gulp-obfuscate');
const header = require('gulp-header');

const yaml = require('js-yaml');
const template = require('art-template');

const fs   = require('fs');
const fse = require('fs-extra')
const path = require('path');

const output = 'dist';
/*
###########################################################
# 编译模板，输出到 temp/index.html
###########################################################
*/
let siteConf = yaml.load(fs.readFileSync('config.yml', 'utf8'));
let themeConf = yaml.load(fs.readFileSync( path.join(__dirname, 'theme', siteConf.theme, 'config.yml'), 'utf8'));
let doc = {
    "site": siteConf,
    "theme": themeConf
};
console.log(JSON.stringify(doc,null,2));

const themeDir = path.join(__dirname, 'theme', siteConf.theme);
const tempDir = path.join(__dirname, 'temp');
fse.mkdirpSync(tempDir);
fse.removeSync(output);

const templates = path.join(themeDir, 'template', 'index.art');
const html = template(templates, doc);
fs.writeFileSync(path.join(tempDir, 'index.html'), html);
/*
###########################################################
# gulp 复制、压缩文件
###########################################################
*/
const header_text_html =
`<!--
 *
 * theme: ${doc.site.theme}
 * ${doc.theme.desc}
 *
 * home-page: a simple home page generator
 * Copyright (C) flatblowfish
 * Github:   https://github.com/flatblowfish
 * Website:  https://blog.maplesugar.top
 *
-->
`;
const header_text_js = header_text_html.replace(/<!--/, "/*").replace(/-->/, " */");
const header_text_css = header_text_js;

gulp.task('copy',  function() {
    return gulp.src([themeDir + '/**/*','!'+themeDir+"/config.yml",'!'+themeDir+"/template",'!'+themeDir+"/template/*"])
        .pipe(gulp.dest(output))
});

gulp.task('html-minify', function () {
    var options = {
        removeComments: true,  //清除HTML注释
        collapseWhitespace: true,  //压缩HTML
        collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true,  //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
        minifyJS:true,  //压缩页面JS，不起作用，分离出来了
        minifyCSS: true  //压缩页面CSS
    };
    return gulp.src(tempDir + '/*.html')
        .pipe(htmlmin(options))
        .pipe(header(header_text_html))
        .pipe(gulp.dest(output));
});

gulp.task('css-minify', function() {
    return gulp.src(themeDir+'/**/*.css')
        .pipe(cssminify())
        .pipe(header(header_text_css))
        .pipe(gulp.dest(output));
});

gulp.task('js-minify', function() {
    // return: used to signal async completion
    return gulp.src(themeDir + '/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(uglify({
            // https://github.com/mishoo/UglifyJS#mangle-options
            mangle: {
                toplevel: true // 混淆变量名
            },
            // https://github.com/mishoo/UglifyJS#compress-options
            compress: {
                drop_console: true
            }
        }).on('error', function(e){
            console.log(e);
        }))
        // 混淆后，参数为css的名称也被混淆了，直接不能运行了
        // .pipe(obfuscate())
        .pipe(header(header_text_js))
        .pipe(gulp.dest(output));
});

// 如果在命令行输入gulp 会直接执行当前目录的名为default的任务
gulp.task('default', gulp.series('copy', 'html-minify', 'css-minify', 'js-minify', function (done) {
    fse.removeSync(tempDir);
    console.log('success: all task complete!');
    // used to signal async completion
    // gulp automatically passes a callback function to your task as its first argument. Just call that function when you're done
    done();
}));
