const express = require('express');
const path = require('path');
const morgan = require('morgan');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');

dotenv.config();

const app = express();
app.set('port', process.env.PORT || 3000);
app.set("view engine", "html");

nunjucks.configure("views", {
	express : app,
	watch : true,
});

app.use(morgan('dev'));
app.use(methodOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended : false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 설정
app.use(session({
	resave: false,
	saveUninitalized : false,
}));


// 3) 없는 페이지 처리 미들웨어(라우터)
app.use((req, res, next) => {
	const error = new Error(`${req.method} ${req.url}은 없는 페이지입니다.`);
	error.status = 404;
	next(error); // 에러 처리 미들웨어로 전달
});

// 2) 에러 처리 미들웨어(라우터)
app.use((err, req, res, next) => {
	res.locals.error = err;
	res.status(err.status || 500).render('error');
});

// 1)
app.listen(app.get('port'), () => {
	console.log(app.get('port'), '번 포트에서 대기중');
});