run two terminals, one for front( http-server ), one for backend(nodemon or node)
Resources to learn Koa: 
https://koajs.com (official website)
https://www.tutorialspoint.com/koajs

template engine： https://www.npmjs.com/package/koa-pug

parse form data: use koa-body middleware, then you can access ctx.request.body to get form data


Note:
1. Error handling
  Each request will pass to app.use(cb) function, and the callback function is a generation function, which can control the flow of the code.  （Koa goes a step further by yielding **'downstream'**, then flowing the control back **'upstream'**. This effect is called **cascading**.）

  In Koa, you add a middleware that does try { yield next } as one of the first middleware. If we encounter any error downstream, we return to the associated catch clause and handle the error here.

```javascript
var koa = require('koa');
var app = koa();

//Error handling middleware
app.use(function *(next) {
   try {
      yield next;
   } catch (err) {
      this.status = err.status || 500;
      this.body = err.message;
      this.app.emit('error', err, this);
   }
});

//Create an error in the next middleware
//Set the error message and status code and throw it using context object

app.use(function *(next) {
   //This will set status and message
   this.throw('Error Message', 500);
});

app.listen(3000);
```



2. One of the most important things about middleware in Koa is that the order in which they are written/included in your file, are **the order in which they are executed downstream**. **As soon as we hit a yield statement in a middleware, it switches to the next middleware in line**, till we reach the last. Then again we start moving back up and resuming functions from yield statements. （**cascading**）

3. Cookie/ Session/ Authentication

   Authentication : We'll be creating a very basic authentication system that'll use **Basic HTTP Authentication**. This is the simplest possible way to enforce access control as it **doesn't require cookies, sessions**, or anything else. To use this, the client has to send the Authorization header along with every request it makes. The username and password are not encrypted, but are concatenated in a single string like the following. This string is encoded with Base64, and the word Basic is put before this value.

