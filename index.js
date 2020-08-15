const Koa = require('koa')
const app = new Koa()
const router = require('koa-router');
const path = require('path')
const Pug = require('koa-pug') // template engine
const bodyParser = require('koa-body') // parse form data
const session = require('koa-session')
const cors = require('@koa/cors');
const https = require('https')

const pug = new Pug({
    viewPath: path.resolve(__dirname, './views'),
    basedir: path.resolve(__dirname, './views'),
    app: app // Binding `ctx.render()`, equals to pug.use(app)
})
// form data
app.use(bodyParser({
    formidable:{uploadDir: './uploads'},
    multipart: true,
    urlencoded: true
}))

app.keys = ['Shh, ITS A SECRET!']
app.use(session(app))

app.use(cors())

var _ = router(); //Instantiate the router
_.all('/all', async (ctx, next)=>{ // Define routes
    ctx.body = 'all methods'
});
// dynamic router, you can get dynamic params from 'ctx.params'
_.get('/get/:name', async (ctx, next)=>{
    console.log(`params: name=${ctx.params.name}`)
    // ctx.request
    console.log('query:', ctx.request.query)
    ctx.body = `get method`
    // ctx.response
    // ctx.response.set('Custom-response', ctx.response.message)
    // redirect 
    // ctx.redirect('/not_found')

    // Helper method to throw an error with a .status property defaulting to 500 that will allow Koa to respond appropriately.
    // ctx.throw(400, 'name required');

    // render template use template engine
    await ctx.render('content', {
        user: {name: 'Feeoly'},
        loginUrl: 'https://www.tutorialspoint.com'
    })
})

_.get('/form', async (ctx, next)=>{
    ctx.cookies.set('unique-form', 'formdata', {httpOnly: false, sameSite: 'none'})
    await ctx.render('form')
});
_.post('/postForm', async (ctx, next)=>{
    console.log(ctx.request.body);
    ctx.body = ctx.request.body; //This is where the parsed request is stored
});

app.use(_.routes())

// http get/post/put/delete etc.
//put: The PUT method requests that the server accept the data enclosed in the request as a modification to the existing object identified by the URI. If it does not exist, then PUT method should create one.
https.createServer(app.callback())

//app.use() This function is a middleware, which gets called whenever our server gets a request.The callback function is a generator

// logger
app.use(async (ctx, next) => {
    await next()
    const rt = ctx.response.get('X-Response-Time');
    console.log(`${ctx.method} ${ctx.url} - ${rt}`)
})
// X-Response-Time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`)
})

// response with session
app.use(async(ctx, next)=>{
    let n = ctx.session.views || 0
    n ++ 
    ctx.session.views = n
    if (n>1){
        ctx.body=`You've visited this page ${ctx.session.views} times`
    } else {
        ctx.body='first time visite'
    }
    ctx.cookies.set('unique-session', n, {httpOnly: false, sameSite: 'none'})
})

// response
app.use(async ctx => {
    ctx.body = 'helloworld~'
    ctx.cookies.set('unique-id', '123', {httpOnly: false, sameSite: 'none'})
})
// listen error
app.on('error', (err, ctx) => {
    console.error('server error', err)
});
// listen with a callback, the callback will be executed if the app runs successfully
app.listen(3000, function() {
    console.log(`you are listening port 3000`)
})