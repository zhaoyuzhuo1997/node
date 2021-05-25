const express = require('express');
const router = express.Router();
const member = require("../models/member"); //member Model
const { joinValidator } = require('../middlewares/join_validator')

router.route("/join")
		/** 회원 가입 양식 */
		.get((req, res, next) => {
			res.render("member/form");
		})
		/** 회원 가입 처리 */
		.post(joinValidator, (req, res, next) => {
			try {
				const result = await member.join(req.memId, req.memPw);
			} catch (err) {
				console.error(err);
				next(err);
			}
		});

module.exports = router;