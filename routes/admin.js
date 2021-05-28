const resume = require("../models/resume");
const { alert, reload } = require("../lib/common");
const express = require('express');
const router = express.Router();

/**
* 이력서 관리 페이지
*/
router.get("/", (req, res, next) => {
	const params = {
		addClass : 'admin_page',
	};
	return res.render("admin/main", params);
});

router.route("/profile")
	/** 저장된 이력서 데이터 */
	.get(async (req, res, next) => {
		const data = await resume.get();
	})
/** 이력서 저장 처리 */
router.post("/profile", async (req, res, next) => {
	const result = await resume.update(req.body);
	if (!result)  {
		return alert("이력서 저장에 실패하였습니다.", res);
	}
	
	return reload(res, "parent");
});

module.exports = router;