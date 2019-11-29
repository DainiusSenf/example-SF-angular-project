var forceDeploy = require('gulp-jsforce-deploy');
var gulp = require('gulp');
var del = require('del');
var zip = require('gulp-zip');
var rename = require("gulp-rename");
var replace = require('gulp-replace');
var file = require('gulp-file');
var dotenv = require('dotenv');
dotenv.config();

// define variables from process.env
const pageName = process.env.PAGE_NAME;
const apiVersion = process.env.API_VERSION;
const resources = process.env.RESOURCE_NAME;
const baseHref = process.env.BASE_HREF;
const devResources = process.env.DEV_RESOURCES_URL;
const distPath = process.env.DIST_PATH || 'dist';

let controller = process.env.CONTROLLER;
controller = controller ? `controller="${controller}"` : ``;

let extensions = process.env.EXTENSIONS;
extensions = extensions ? `extensions="${extensions}"` : ``;

const otherPageAttrs = `sidebar="false" standardStylesheets="false" showHeader="false" applyBodyTag="false" applyHtmlTag= "false" docType="html-5.0"`;

// Here we describe meta.xml files to package
const pageMetaXML = `<?xml version="1.0" encoding="UTF-8"?>
<ApexPage xmlns="http://soap.sforce.com/2006/04/metadata">
    <apiVersion>${apiVersion}</apiVersion>
    <availableInTouch>false</availableInTouch>
    <confirmationTokenRequired>false</confirmationTokenRequired>
    <label>${pageName}</label>
</ApexPage>`;

const resourcesMetaXML = `<?xml version="1.0" encoding="UTF-8"?>
<StaticResource xmlns="http://soap.sforce.com/2006/04/metadata">
    <cacheControl>Public</cacheControl>
    <contentType>application/x-zip-compressed</contentType>
</StaticResource>`;

const packageXML = `<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>*</members>
        <name>ApexPage</name>
    </types>
    <types>
        <members>*</members>
        <name>StaticResource</name>
    </types>
    <version>${apiVersion}</version>
</Package>`;

// Task to remove package folder
gulp.task('clean', done => {
    del(['./package']);
    done();
});

gulp.task('create-package', function () {
    return gulp.src('./package', {
            allowEmpty: true
        })
        .pipe(file(`package.xml`, packageXML))
        .pipe(gulp.dest('package/'));
});

gulp.task('page_to_prod', function () {
    return gulp.src(['./' + distPath + '/index.html'])
        .pipe(replace('<!doctype html>', ''))
        .pipe(replace('<html lang="en">', `<apex:page ${otherPageAttrs} ${controller} ${extensions}>`))
        .pipe(replace(`<base href="/">`, `<base href="${baseHref}"/>`))
        .pipe(replace(`<base href="/">`, `belekas`))
        .pipe(replace(`href="assets/favicon.png" />`, `href="{!URLFOR($Resource.${resources}, 'assets/favicon.png')}" />`))
        .pipe(replace('href="styles.css">', `href="{!URLFOR($Resource.${resources}, 'styles.css')}"/>`))
        .pipe(replace('src="../../../assets/images/logo.png"', `src="{!URLFOR($Resource.${resources}, 'assets/images/logo.png')}"`))
        .pipe(replace('<body>', `<body>
          <script type="text/javascript">
            window._VfResources = '{!URLFOR($Resource.${resources})}';
          </script>
        `))
        .pipe(replace(`<script type="text/javascript" src="`, `<script type="text/javascript" src="{!URLFOR($Resource.${resources}, '`))
        .pipe(replace(`.js"></script>`, `.js')}"></script>`))
        .pipe(replace('</html>', `</apex:page>`))
        // Angular 8 Scripts - runtime and polyfills
        .pipe(replace(`<script src="`, `<script src="{!URLFOR($Resource.${resources}, '`))
        .pipe(replace('.js"', `.js')}"`))
        .pipe(replace('type="module">', `type="module">`))
        .pipe(replace('nomodule>', `nomodule="true">`))
        .pipe(rename(function (path) {
            path.dirname += "/pages";
            path.basename = `${pageName}`;
            path.extname = ".page"
        }))
        .pipe(file(`pages/${pageName}.page-meta.xml`, pageMetaXML))
        .pipe(gulp.dest('package/'));
});

gulp.task('page_to_dev', function () {
    return gulp.src(['./' + distPath + '/index.html'])
        .pipe(replace('<!doctype html>', ''))
        .pipe(replace('<html lang="en">', `<apex:page ${otherPageAttrs} ${controller} ${extensions}>`))
        .pipe(replace(`<base href="/">`, `<base href="${baseHref}"/>`))
        .pipe(replace('href="assets/favicon.png" />', `href="${devResources}/assets/favicon.png" />`))
        .pipe(replace('src="../../../assets/images/logo.png"', `src="${devResources}/assets/images/logo.png"`))
        .pipe(replace('</head>',
            `<script type="text/javascript">
              window._VfResources = '${devResources}';
            </script>
          </head>`))
        .pipe(replace(`<script type="text/javascript" src="`, `<script type="text/javascript" src="${devResources}/`))
        .pipe(replace(`<script src="`, `<script src="${devResources}/`))
        .pipe(replace('type="module">', `type="module">`))
        .pipe(replace('defer>', `defer="true">`))
        .pipe(replace('nomodule>', `nomodule="true">`))
        .pipe(replace('</html>', `</apex:page>`))
        .pipe(rename(function (path) {
            path.dirname += "/pages";
            path.basename = `${pageName}`;
            path.extname = ".page"
        }))
        .pipe(file(`pages/${pageName}.page-meta.xml`, pageMetaXML))
        .pipe(gulp.dest('package/'));
});

gulp.task('staticresources', function () {
    return gulp.src('./' + distPath + '/**')
        .pipe(zip(`${resources}.resource`))
        .pipe(file(`${resources}.resource-meta.xml`, resourcesMetaXML))
        .pipe(gulp.dest('package/staticresources/'));
});

gulp.task('build-static', gulp.parallel(['create-package', 'staticresources']));
gulp.task('build-package', gulp.parallel(['create-package', 'page_to_prod', 'staticresources']));
gulp.task('build-dev-package', gulp.parallel(['create-package', 'page_to_dev']));

gulp.task('deploy', function () {
    return gulp.src('./package/**', {
            base: "."
        })
        .pipe(zip('package.zip'))
        .pipe(forceDeploy({
            username: process.env.SF_USERNAME,
            password: process.env.SF_PASSWORD,
            loginUrl: process.env.LOGIN_URL,
            pollTimeout: 60000 * 6,
            rollbackOnError: true
        }))
});
