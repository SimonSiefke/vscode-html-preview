import { genDom } from '../genDom'

test(`only text node`, () => {
  const output = genDom(`hello world`)
  const expectedOutput = `hello world`
  expect(output).toBe(expectedOutput)
})

test(`only element node`, () => {
  const output = genDom(`<h1></h1>`)
  const expectedOutput = `<h1 data-id="1"></h1>`
  expect(output).toBe(expectedOutput)
})

test(`comments before doctype`, () => {
  const output = genDom(`<!-- ## Introduction -->
<!doctype html>
<html ⚡>
</html>`)
  const expectedOutput = `<!-- ## Introduction -->
<!doctype html>
<html data-id="3"⚡>
</html>`
  expect(output).toBe(expectedOutput)
})

test(`only self-closing element node`, () => {
  const output = genDom(`<br>`)
  const expectedOutput = `<br data-id="1">`
  expect(output).toBe(expectedOutput)
})

test(`multiple element nodes and text nodes #1`, () => {
  const output = genDom(`<h1>hello</h1>world`)
  const expectedOutput = `<h1 data-id="1">hello</h1>world`
  expect(output).toBe(expectedOutput)
})

test(`multiple element nodes and text nodes #1`, () => {
  const output = genDom(`<h1>hello</h1>world
<h2>!!!</h2>`)
  const expectedOutput = `<h1 data-id="1">hello</h1>world
<h2 data-id="4">!!!</h2>`
  expect(output).toBe(expectedOutput)
})

test(`with !DOCTYPE`, () => {
  const output = genDom(`<!DOCTYPE html>
<html>
  <h1>hello</h1>
</html>`)
  const expectedOutput = `<!DOCTYPE html>
<html data-id="2">
  <h1 data-id="4">hello</h1>
</html>`
  expect(output).toBe(expectedOutput)
})

test(`with !doctype`, () => {
  const output = genDom(`<!doctype html>
<html>
  <h1>hello</h1>
</html>`)
  const expectedOutput = `<!doctype html>
<html data-id="2">
  <h1 data-id="4">hello</h1>
</html>`
  expect(output).toBe(expectedOutput)
})

test(`example amp`, () => {
  const output = genDom(`<!-- ## Introduction -->
<!--
This is a sample showing how to implement client-side filtering.
-->
<!-- -->
<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>

  <!-- ## Setup -->
  <!--
    Additionally used AMP components must be imported in the header. We use \`amp-bind\` to store products locally into a variable.
  -->
  <script async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
  <!--
    We use \`amp-list\` to retrieve static data.
  -->
  <script async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
  <!--
    We use \`amp-mustache\` to render data.
  -->
  <script async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>

  <link rel="canonical" href="https://amp.dev/documentation/examples/interactivity-dynamic-content/client-side_filtering/index.html">
  <title>Client-side filtering</title>

  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

</head>
<body>
  <!--
    ## Client-side Filter

    It is possible to implement client-side filtering by using \`amp-list\`, \`amp-state\` and \`amp-bind\`.

    The \`amp-state\` is initially setup with data from an endpoint which returns a list of available products; the user can choose between different colors and that selection sets the variable \`filteredProducts\` to the result of a filter expression. The filter expression is an \`amp-bind\` expression which uses the \`Array.filter\` function.

    The \`filteredProducts\` variable is then used as \`src\` of \`amp-list\`. \`amp-list\` does not resize automatically, but it is possible to calculate its height in the filtered state by using \`amp-bind\`: here we are binding the \`[height]\` to the length of the \`filteredProducts\` array times the height of a single element.

    The alternative to this approach is using server-side filtering which we explain in the [product sample](https://amp.dev/documentation/examples/e-commerce/product_browse_page/).
  -->
  <div>
    <amp-state id="allProducts" src="/static/samples/json/related_products.json"></amp-state>
    <select on="change:AMP.setState({
        filteredProducts: allProducts.items.filter(a => event.value == 'all' ? true : a.color == event.value)
      })">
      <option value="all" selected="">All</option>
      <option value="red">red</option>
      <option value="green">green</option>
      <option value="yellow">yellow</option>
      <option value="orange">orange</option>
    </select>
    <amp-list height="282" [height]="(40 + 24) * filteredProducts.length" layout="fixed-height" src="/static/samples/json/related_products.json" [src]="filteredProducts" binding="no">
      <template type="amp-mustache">
        <amp-img src="{{img}}" layout="fixed" width="60" height="40" alt="{{name}}"></amp-img>
        {{name}}
      </template>
    </amp-list>
  </div>

</body>
</html>`)
  const expectedOutput = `<!-- ## Introduction -->
<!--
This is a sample showing how to implement client-side filtering.
-->
<!-- -->
<!doctype html>
<html data-id="8" ⚡>
<head data-id="10">
  <meta data-id="12" charset="utf-8">
  <script data-id="14" async src="https://cdn.ampproject.org/v0.js"></script>

  <!-- ## Setup -->
  <!--
    Additionally used AMP components must be imported in the header. We use \`amp-bind\` to store products locally into a variable.
  -->
  <script data-id="20" async custom-element="amp-bind" src="https://cdn.ampproject.org/v0/amp-bind-0.1.js"></script>
  <!--
    We use \`amp-list\` to retrieve static data.
  -->
  <script data-id="24" async custom-element="amp-list" src="https://cdn.ampproject.org/v0/amp-list-0.1.js"></script>
  <!--
    We use \`amp-mustache\` to render data.
  -->
  <script data-id="28" async custom-template="amp-mustache" src="https://cdn.ampproject.org/v0/amp-mustache-0.2.js"></script>

  <link data-id="30" rel="canonical" href="https://amp.dev/documentation/examples/interactivity-dynamic-content/client-side_filtering/index.html">
  <title data-id="32">Client-side filtering</title>

  <meta data-id="35" name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">

  <style data-id="37" amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript data-id="39"><style data-id="40" amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

</head>
<body data-id="44">
  <!--
    ## Client-side Filter

    It is possible to implement client-side filtering by using \`amp-list\`, \`amp-state\` and \`amp-bind\`.

    The \`amp-state\` is initially setup with data from an endpoint which returns a list of available products; the user can choose between different colors and that selection sets the variable \`filteredProducts\` to the result of a filter expression. The filter expression is an \`amp-bind\` expression which uses the \`Array.filter\` function.

    The \`filteredProducts\` variable is then used as \`src\` of \`amp-list\`. \`amp-list\` does not resize automatically, but it is possible to calculate its height in the filtered state by using \`amp-bind\`: here we are binding the \`[height]\` to the length of the \`filteredProducts\` array times the height of a single element.

    The alternative to this approach is using server-side filtering which we explain in the [product sample](https://amp.dev/documentation/examples/e-commerce/product_browse_page/).
  -->
  <div data-id="48">
    <amp-state data-id="50" id="allProducts" src="/static/samples/json/related_products.json"></amp-state>
    <select data-id="52" on="change:AMP.setState({
        filteredProducts: allProducts.items.filter(a => event.value == 'all' ? true : a.color == event.value)
      })">
      <option data-id="54" value="all" selected="">All</option>
      <option data-id="57" value="red">red</option>
      <option data-id="60" value="green">green</option>
      <option data-id="63" value="yellow">yellow</option>
      <option data-id="66" value="orange">orange</option>
    </select>
    <amp-list data-id="70" height="282" [height]="(40 + 24) * filteredProducts.length" layout="fixed-height" src="/static/samples/json/related_products.json" [src]="filteredProducts" binding="no">
      <template data-id="72" type="amp-mustache">
        <amp-img data-id="74" src="{{img}}" layout="fixed" width="60" height="40" alt="{{name}}"></amp-img>
        {{name}}
      </template>
    </amp-list>
  </div>

</body>
</html>`
  expect(output).toBe(expectedOutput)
})

test(`example html5 boilerplate`, () => {
  const output = genDom(`<!doctype html>
<html class="no-js" lang="">

<head>
  <meta charset="utf-8">
  <title></title>
  <meta name="description" content="">
  <meta name="viewport" content="width=device-width, initial-scale=1">

  <link rel="manifest" href="site.webmanifest">
  <link rel="apple-touch-icon" href="icon.png">
  <!-- Place favicon.ico in the root directory -->

  <link rel="stylesheet" href="css/normalize.css">
  <link rel="stylesheet" href="css/main.css">

  <meta name="theme-color" content="#fafafa">
</head>

<body>
  <!--[if IE]>
    <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p>
  <![endif]-->

  <!-- Add your site or application content here -->
  <p>Hello world! This is HTML5 Boilerplate.</p>
  <script src="js/vendor/modernizr-{{MODERNIZR_VERSION}}.min.js"></script>
  <script src="https://code.jquery.com/jquery-{{JQUERY_VERSION}}.min.js" integrity="{{JQUERY_SRI_HASH}}" crossorigin="anonymous"></script>
  <script>window.jQuery || document.write('<script src="js/vendor/jquery-{{JQUERY_VERSION}}.min.js"></script>')</script>
  <script src="js/plugins.js"></script>
  <script src="js/main.js"></script>

  <!-- Google Analytics: change UA-XXXXX-Y to be your site's ID. -->
  <script>
    window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;
    ga('create', 'UA-XXXXX-Y', 'auto'); ga('set','transport','beacon'); ga('send', 'pageview')
  </script>
  <script src="https://www.google-analytics.com/analytics.js" async></script>
</body>

</html>`)
  const expectedOutput = `<!doctype html>
<html data-id="2" class="no-js" lang="">

<head data-id="4">
  <meta data-id="6" charset="utf-8">
  <title data-id="8"></title>
  <meta data-id="10" name="description" content="">
  <meta data-id="12" name="viewport" content="width=device-width, initial-scale=1">

  <link data-id="14" rel="manifest" href="site.webmanifest">
  <link data-id="16" rel="apple-touch-icon" href="icon.png">
  <!-- Place favicon.ico in the root directory -->

  <link data-id="20" rel="stylesheet" href="css/normalize.css">
  <link data-id="22" rel="stylesheet" href="css/main.css">

  <meta data-id="24" name="theme-color" content="#fafafa">
</head>

<body data-id="27">
  <!--[if IE]>
    <p class="browserupgrade">You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.</p>
  <![endif]-->

  <!-- Add your site or application content here -->
  <p data-id="33">Hello world! This is HTML5 Boilerplate.</p>
  <script data-id="36" src="js/vendor/modernizr-{{MODERNIZR_VERSION}}.min.js"></script>
  <script data-id="38" src="https://code.jquery.com/jquery-{{JQUERY_VERSION}}.min.js" integrity="{{JQUERY_SRI_HASH}}" crossorigin="anonymous"></script>
  <script data-id="40">window.jQuery || document.write('<script src="js/vendor/jquery-{{JQUERY_VERSION}}.min.js"></script>')</script>
  <script data-id="44" src="js/plugins.js"></script>
  <script data-id="46" src="js/main.js"></script>

  <!-- Google Analytics: change UA-XXXXX-Y to be your site's ID. -->
  <script data-id="50">
    window.ga = function () { ga.q.push(arguments) }; ga.q = []; ga.l = +new Date;
    ga('create', 'UA-XXXXX-Y', 'auto'); ga('set','transport','beacon'); ga('send', 'pageview')
  </script>
  <script data-id="53" src="https://www.google-analytics.com/analytics.js" async></script>
</body>

</html>`
  expect(output).toBe(expectedOutput)
})